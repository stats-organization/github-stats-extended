import axios from "axios";

import { logger } from "../common/log.js";

/** Linguist name GitHub uses for `.ipynb` files. */
const JUPYTER_NOTEBOOK = "Jupyter Notebook";

/** Notebooks read for one card. Extra repositories keep GitHub's original count. */
const MAX_NOTEBOOKS_PER_CARD = 25;

/** Larger files are usually saved outputs. Those repositories are left unchanged. */
const MAX_NOTEBOOK_BYTES = 2 * 1024 * 1024;

const REQUEST_TIMEOUT_MS = 4000;
const DOWNLOAD_CONCURRENCY = 5;

/**
 * Jupyter kernel / VS Code language id to the Linguist name used by this card.
 * Names that are not listed stay Jupyter Notebook, so an unknown kernel is not dropped.
 */
const KERNEL_LANGUAGES: Record<string, string> = {
  bash: "Shell",
  c: "C",
  "c#": "C#",
  "c++": "C++",
  clojure: "Clojure",
  clojurescript: "Clojure",
  cpp: "C++",
  crystal: "Crystal",
  csharp: "C#",
  css: "CSS",
  cuda: "Cuda",
  cxx: "C++",
  dart: "Dart",
  elixir: "Elixir",
  erlang: "Erlang",
  "f#": "F#",
  fish: "Shell",
  fortran: "Fortran",
  fsharp: "F#",
  go: "Go",
  golang: "Go",
  groovy: "Groovy",
  haskell: "Haskell",
  html: "HTML",
  ipython: "Python",
  ir: "R",
  java: "Java",
  javascript: "JavaScript",
  jruby: "Ruby",
  js: "JavaScript",
  julia: "Julia",
  kotlin: "Kotlin",
  lisp: "Common Lisp",
  lua: "Lua",
  matlab: "MATLAB",
  mathematica: "Wolfram Language",
  nim: "Nim",
  node: "JavaScript",
  nodejs: "JavaScript",
  objc: "Objective-C",
  "objective-c": "Objective-C",
  objectivec: "Objective-C",
  ocaml: "OCaml",
  octave: "Octave",
  perl: "Perl",
  php: "PHP",
  powershell: "PowerShell",
  pwsh: "PowerShell",
  python: "Python",
  python2: "Python",
  python3: "Python",
  r: "R",
  ruby: "Ruby",
  rust: "Rust",
  sas: "SAS",
  scala: "Scala",
  scheme: "Scheme",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  stata: "Stata",
  swift: "Swift",
  ts: "TypeScript",
  typescript: "TypeScript",
  wolfram: "Wolfram Language",
  "wolfram language": "Wolfram Language",
  zig: "Zig",
  zsh: "Shell",
};

interface GitHubTree {
  truncated?: boolean;
  tree?: Array<GitHubTreeEntry>;
}

interface GitHubTreeEntry {
  path?: string;
  sha?: string;
  size?: number;
  type?: string;
}

interface GitHubBlob {
  content?: string;
}

interface NotebookBlob {
  sha: string;
  size: number;
}

/** Code-cell bytes for one repository, after every notebook in it was read. */
interface JupyterRecount {
  notebooks: number;
  bytesByLanguage: Record<string, number>;
}

const textEncoder = new TextEncoder();

/**
 * Map a kernel name onto the language name GitHub Linguist uses.
 *
 * @param name Kernel name, language id, or cell magic.
 * @returns Linguist language name, or null when this card does not know it.
 */
const mapKernelLanguage = (name: string | null): string | null => {
  if (name === null) {
    return null;
  }
  const key = name.trim().toLowerCase();
  if (key === "") {
    return null;
  }
  const exact = KERNEL_LANGUAGES[key];
  if (exact !== undefined) {
    return exact;
  }
  if (/^python\d/.test(key)) {
    return "Python";
  }
  if (/^julia[\d.-]/.test(key)) {
    return "Julia";
  }
  return null;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

/**
 * Notebook source is either one string or a list of strings that concatenate.
 *
 * @param source Cell `source` field.
 * @returns The cell source, or an empty string when it is missing.
 */
const sourceText = (source: unknown): string => {
  if (typeof source === "string") {
    return source;
  }
  if (!Array.isArray(source)) {
    return "";
  }
  let text = "";
  for (const part of source) {
    if (typeof part === "string") {
      text += part;
    }
  }
  return text;
};

// Array.isArray's type predicate is any[], so copy into unknown[] before use.
const unknownArray = (value: unknown): Array<unknown> | null => {
  if (!Array.isArray(value)) {
    return null;
  }
  const items: Array<unknown> = [];
  for (const item of value as Array<unknown>) {
    items.push(item);
  }
  return items;
};

const notebookCells = (
  notebook: Record<string, unknown>,
): Array<unknown> | null => {
  const cells = unknownArray(notebook["cells"]);
  if (cells !== null) {
    return cells;
  }
  const worksheets = unknownArray(notebook["worksheets"]);
  if (worksheets === null) {
    return null;
  }
  const flattened: Array<unknown> = [];
  for (const sheet of worksheets) {
    if (!isRecord(sheet)) {
      continue;
    }
    const sheetCells = unknownArray(sheet["cells"]);
    if (sheetCells !== null) {
      flattened.push(...sheetCells);
    }
  }
  return flattened;
};

const fallbackLanguage = (notebook: Record<string, unknown>): string => {
  const metadata = notebook["metadata"];
  if (!isRecord(metadata)) {
    return JUPYTER_NOTEBOOK;
  }
  const languageInfo = metadata["language_info"];
  const fromInfo = isRecord(languageInfo)
    ? mapKernelLanguage(readString(languageInfo["name"]))
    : null;
  if (fromInfo !== null) {
    return fromInfo;
  }
  const kernelspec = metadata["kernelspec"];
  if (!isRecord(kernelspec)) {
    return JUPYTER_NOTEBOOK;
  }
  return (
    mapKernelLanguage(readString(kernelspec["language"])) ??
    mapKernelLanguage(readString(kernelspec["name"])) ??
    JUPYTER_NOTEBOOK
  );
};

const languageOfCell = (
  cell: Record<string, unknown>,
  source: string,
  fallback: string,
): string => {
  const firstLine = source.split("\n", 1)[0] ?? "";
  const magic = /^%%([A-Za-z0-9#+]+)/.exec(firstLine.trim());
  const magicName = magic?.[1];
  if (magicName !== undefined) {
    const mapped = mapKernelLanguage(magicName);
    if (mapped !== null) {
      return mapped;
    }
  }
  const metadata = cell["metadata"];
  if (!isRecord(metadata)) {
    return fallback;
  }
  const vscode = metadata["vscode"];
  if (!isRecord(vscode)) {
    return fallback;
  }
  return mapKernelLanguage(readString(vscode["languageId"])) ?? fallback;
};

const addBytes = (
  totals: Map<string, number>,
  language: string,
  bytes: number,
): void => {
  totals.set(language, (totals.get(language) ?? 0) + bytes);
};

/**
 * Count UTF-8 bytes of code-cell source, grouped by the language that cell is written in.
 * Markdown cells and outputs are ignored. Null means this value is not a notebook we can read.
 *
 * @param notebook Parsed notebook JSON.
 * @returns Byte counts keyed by Linguist language name.
 */
const notebookCodeBytes = (
  notebook: unknown,
): Record<string, number> | null => {
  if (!isRecord(notebook)) {
    return null;
  }
  const cells = notebookCells(notebook);
  if (cells === null) {
    return null;
  }
  const fallback = fallbackLanguage(notebook);
  const totals = new Map<string, number>();
  for (const cell of cells) {
    if (!isRecord(cell) || cell["cell_type"] !== "code") {
      continue;
    }
    const source = sourceText(cell["source"]);
    const bytes = textEncoder.encode(source).byteLength;
    if (bytes === 0) {
      continue;
    }
    addBytes(totals, languageOfCell(cell, source, fallback), bytes);
  }
  return Object.fromEntries(totals);
};

const isNotebookBlob = (entry: GitHubTreeEntry): entry is NotebookBlob => {
  if (entry.type !== "blob" || typeof entry.path !== "string") {
    return false;
  }
  if (!entry.path.endsWith(".ipynb")) {
    return false;
  }
  // Checkpoint copies repeat the same notebook and would double-count it.
  if (entry.path.split("/").includes(".ipynb_checkpoints")) {
    return false;
  }
  return typeof entry.sha === "string" && typeof entry.size === "number";
};

const decodeBase64 = (content: string): string => {
  const binary = atob(content.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
};

const fetchBlobText = async (
  owner: string,
  repo: string,
  sha: string,
  token: string,
): Promise<string> => {
  const response = await axios.get<GitHubBlob>(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs/${encodeURIComponent(sha)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `token ${token}`,
      },
      timeout: REQUEST_TIMEOUT_MS,
    },
  );
  const content = response.data.content;
  if (typeof content !== "string" || content === "") {
    throw new Error("Notebook blob was empty");
  }
  return decodeBase64(content);
};

/**
 * Read every `.ipynb` in one repository and sum code-cell bytes by language.
 * Returns null when the repository cannot be recounted completely, so the caller
 * keeps GitHub's original Jupyter Notebook total instead of a partial mix.
 *
 * @param owner Repository owner login.
 * @param repo Repository name.
 * @param token GitHub token that already succeeded for this card.
 * @param budget Notebooks this card may still download.
 * @returns Code-cell bytes and how many notebooks were read.
 */
const recountJupyterRepository = async (
  owner: string,
  repo: string,
  token: string,
  budget: number,
): Promise<JupyterRecount | null> => {
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) {
    return null;
  }
  try {
    const response = await axios.get<GitHubTree>(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/HEAD`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `token ${token}`,
        },
        params: { recursive: "1" },
        timeout: REQUEST_TIMEOUT_MS,
      },
    );
    if (response.data.truncated === true) {
      return null;
    }
    const notebooks = (response.data.tree ?? []).filter(isNotebookBlob);
    if (
      notebooks.length === 0 ||
      notebooks.length > budget ||
      notebooks.some((notebook) => notebook.size > MAX_NOTEBOOK_BYTES)
    ) {
      return null;
    }

    const totals = new Map<string, number>();
    for (
      let start = 0;
      start < notebooks.length;
      start += DOWNLOAD_CONCURRENCY
    ) {
      const batch = notebooks.slice(start, start + DOWNLOAD_CONCURRENCY);
      const texts = await Promise.all(
        batch.map((notebook) =>
          fetchBlobText(owner, repo, notebook.sha, token),
        ),
      );
      for (const text of texts) {
        const bytes = notebookCodeBytes(JSON.parse(text) as unknown);
        if (bytes === null) {
          return null;
        }
        for (const [language, size] of Object.entries(bytes)) {
          addBytes(totals, language, size);
        }
      }
    }
    return {
      notebooks: notebooks.length,
      bytesByLanguage: Object.fromEntries(totals),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "request failed";
    logger.log(`jupyter recount skipped for ${owner}/${repo}: ${message}`);
    return null;
  }
};

export {
  JUPYTER_NOTEBOOK,
  MAX_NOTEBOOKS_PER_CARD,
  mapKernelLanguage,
  notebookCodeBytes,
  recountJupyterRepository,
};
