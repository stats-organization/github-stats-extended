import nock from "nock";
import { describe, expect, it } from "vitest";

import topLangsApi from "../src/api/top-langs.js";
import {
  mapKernelLanguage,
  notebookCodeBytes,
  recountJupyterRepository,
} from "../src/fetchers/jupyter-languages.js";
import { fetchTopLanguages } from "../src/fetchers/top-languages.js";

const pythonNotebook = {
  nbformat: 4,
  metadata: {
    language_info: { name: "python" },
    kernelspec: { name: "python3", language: "python" },
  },
  cells: [
    { cell_type: "markdown", source: "# title\n" },
    {
      cell_type: "code",
      source: ["print(1)\n", "print(2)\n"],
      outputs: [{ output_type: "stream", text: "x".repeat(200) }],
    },
    { cell_type: "code", source: "%%bash\nls\n" },
    {
      cell_type: "code",
      metadata: { vscode: { languageId: "javascript" } },
      source: "console.log(1)\n",
    },
    { cell_type: "code", source: "" },
  ],
};

const notebookJson = (source: string): string => {
  return JSON.stringify({
    nbformat: 4,
    metadata: { language_info: { name: "python" } },
    cells: [
      {
        cell_type: "code",
        source,
        outputs: [{ output_type: "stream", text: "ignored output" }],
      },
    ],
  });
};

const utf8Bytes = (text: string): number => {
  return new TextEncoder().encode(text).byteLength;
};

const toGitHubBase64 = (text: string): string => {
  return btoa(text).replace(/(.{60})/g, "$1\n");
};

describe("notebook code cells", () => {
  it("counts code-cell bytes and ignores markdown and outputs", () => {
    const bytes = notebookCodeBytes(pythonNotebook);

    expect(bytes).toStrictEqual({
      Python: utf8Bytes("print(1)\nprint(2)\n"),
      Shell: utf8Bytes("%%bash\nls\n"),
      JavaScript: utf8Bytes("console.log(1)\n"),
    });
  });

  it("uses the kernel language when a cell does not name one", () => {
    expect(
      notebookCodeBytes({
        metadata: { kernelspec: { language: "r" } },
        cells: [{ cell_type: "code", source: "x <- 1\n" }],
      }),
    ).toStrictEqual({ R: utf8Bytes("x <- 1\n") });
  });

  it("keeps an unknown kernel as Jupyter Notebook without counting outputs", () => {
    expect(
      notebookCodeBytes({
        metadata: { language_info: { name: "fortran-magic" } },
        cells: [{ cell_type: "code", source: "print *\n", outputs: [1, 2, 3] }],
      }),
    ).toStrictEqual({
      "Jupyter Notebook": utf8Bytes("print *\n"),
    });
  });

  it("reads nbformat 3 worksheets", () => {
    expect(
      notebookCodeBytes({
        metadata: { language_info: { name: "python" } },
        worksheets: [{ cells: [{ cell_type: "code", source: "a = 1\n" }] }],
      }),
    ).toStrictEqual({ Python: utf8Bytes("a = 1\n") });
  });

  it("returns null for a value that is not a notebook", () => {
    expect(notebookCodeBytes(null)).toBeNull();
    expect(notebookCodeBytes({ metadata: {} })).toBeNull();
  });

  it("maps python versions and leaves unknown names unmapped", () => {
    expect(mapKernelLanguage("python3.11")).toBe("Python");
    expect(mapKernelLanguage("C++")).toBe("C++");
    expect(mapKernelLanguage("fortran-magic")).toBeNull();
  });
});

describe("recount Jupyter repositories", () => {
  it("replaces Jupyter Notebook bytes with code-cell bytes", async () => {
    const source = "print(1)\n";
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, {
        data: {
          user: {
            repositories: {
              nodes: [
                {
                  name: "ships",
                  owner: { login: "octocat" },
                  languages: {
                    edges: [
                      {
                        size: 100,
                        node: { color: "#3572A5", name: "Python" },
                      },
                      {
                        size: 9000,
                        node: { color: "#DA5B0B", name: "Jupyter Notebook" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      })
      .get("/repos/octocat/ships/git/trees/HEAD")
      .query({ recursive: "1" })
      .reply(200, {
        truncated: false,
        tree: [
          {
            path: "train.ipynb",
            mode: "100644",
            type: "blob",
            sha: "abc123",
            size: 120,
          },
          {
            path: ".ipynb_checkpoints/train-checkpoint.ipynb",
            mode: "100644",
            type: "blob",
            sha: "skip",
            size: 120,
          },
        ],
      })
      .get("/repos/octocat/ships/git/blobs/abc123")
      .reply(200, {
        encoding: "base64",
        content: toGitHubBase64(notebookJson(source)),
      });

    const langs = await fetchTopLanguages("octocat", [], 1, 0, [], null, true);

    expect(langs["Python"]).toStrictEqual({
      name: "Python",
      color: "#3572A5",
      size: 100 + utf8Bytes(source),
      count: 1,
    });
    expect(langs["Jupyter Notebook"]).toBeUndefined();
  });

  it("keeps GitHub's Jupyter count when a notebook cannot be read", async () => {
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, {
        data: {
          user: {
            repositories: {
              nodes: [
                {
                  name: "ships",
                  owner: { login: "octocat" },
                  languages: {
                    edges: [
                      {
                        size: 9000,
                        node: { color: "#DA5B0B", name: "Jupyter Notebook" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      })
      .get("/repos/octocat/ships/git/trees/HEAD")
      .query({ recursive: "1" })
      .reply(404, { message: "Not Found" });

    const langs = await fetchTopLanguages("octocat", [], 1, 0, [], null, true);

    expect(langs["Jupyter Notebook"]).toMatchObject({ size: 9000, count: 1 });
  });

  it("does not download a repository that exceeds the notebook budget", async () => {
    nock("https://api.github.com")
      .get("/repos/octocat/ships/git/trees/HEAD")
      .query({ recursive: "1" })
      .reply(200, {
        truncated: false,
        tree: [
          { path: "a.ipynb", type: "blob", sha: "a", size: 10 },
          { path: "b.ipynb", type: "blob", sha: "b", size: 10 },
        ],
      });

    const recounted = await recountJupyterRepository(
      "octocat",
      "ships",
      "token",
      1,
    );

    expect(recounted).toBeNull();
  });

  it("rejects an unknown count_jupyter value before calling GitHub", async () => {
    const result = await topLangsApi(
      // The JavaScript handler types every destructured query field as required.
      { username: "octocat", count_jupyter: "yes" } as Parameters<
        typeof topLangsApi
      >[0],
    );

    expect(result.status).toBe("error - permanent");
    expect(result.content).toContain("Incorrect count_jupyter input");
  });

  it("renders recounted languages when the card asks for code cells", async () => {
    const source = "print(1)\n";
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, {
        data: {
          user: {
            repositories: {
              nodes: [
                {
                  name: "ships",
                  owner: { login: "octocat" },
                  languages: {
                    edges: [
                      {
                        size: 9000,
                        node: { color: "#DA5B0B", name: "Jupyter Notebook" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      })
      .get("/repos/octocat/ships/git/trees/HEAD")
      .query({ recursive: "1" })
      .reply(200, {
        truncated: false,
        tree: [{ path: "train.ipynb", type: "blob", sha: "abc123", size: 80 }],
      })
      .get("/repos/octocat/ships/git/blobs/abc123")
      .reply(200, { content: toGitHubBase64(notebookJson(source)) });

    const result = await topLangsApi(
      // The JavaScript handler types every destructured query field as required.
      { username: "octocat", count_jupyter: "code" } as Parameters<
        typeof topLangsApi
      >[0],
    );

    expect(result.status).toBe("success");
    expect(result.content).toContain("Python");
    expect(result.content).not.toContain("Jupyter Notebook");
  });
});
