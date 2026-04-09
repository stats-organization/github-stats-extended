import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getInput, info, setFailed, setOutput, warning } from "@actions/core";
import { api, gist, pin, topLangs, wakatime } from "github-readme-stats-core";

/**
 * Normalize option values to strings.
 * @param {Record<string, unknown>} options Input options.
 * @returns {Record<string, string>} Normalized options.
 */
const normalizeOptions = (options) => {
  const normalized = {};
  for (const [key, val] of Object.entries(options)) {
    if (Array.isArray(val)) {
      normalized[key] = val.join(",");
    } else if (val === null || val === undefined) {
      continue;
    } else {
      normalized[key] = String(val);
    }
  }
  return normalized;
};

/**
 * Parse options from query string or JSON and normalize values to strings.
 * @param {string} value Input value.
 * @returns {Record<string, string>} Parsed options.
 */
const parseOptions = (value) => {
  if (!value) {
    return {};
  }

  const trimmed = value.trim();
  const options = {};
  if (trimmed.startsWith("{")) {
    try {
      Object.assign(options, JSON.parse(trimmed));
    } catch {
      throw new Error("Invalid JSON in options.");
    }
  } else {
    const queryString = trimmed.startsWith("?") ? trimmed.slice(1) : trimmed;
    const params = new URLSearchParams(queryString);
    for (const [key, val] of params.entries()) {
      if (options[key]) {
        options[key] = `${options[key]},${val}`;
      } else {
        options[key] = val;
      }
    }
  }

  return normalizeOptions(options);
};

// Map of card types to their respective API handlers.
const cardHandlers = {
  stats: api,
  "top-langs": topLangs,
  pin,
  wakatime,
  gist,
};

/**
 * Validate required options for each card type.
 * @param {string} card Card type.
 * @param {Record<string, string>} query Parsed options.
 * @param {string | undefined} repoOwner Repository owner from environment.
 * @throws {Error} If required options are missing.
 */
const validateCardOptions = (card, query, repoOwner) => {
  if (!query.username && repoOwner) {
    query.username = repoOwner;
    warning("username not provided; defaulting to repository owner.");
  }
  switch (card) {
    case "stats":
    case "top-langs":
    case "wakatime":
      if (!query.username) {
        throw new Error(`username is required for the ${card} card.`);
      }
      break;
    case "pin":
      if (!query.repo) {
        throw new Error("repo is required for the pin card.");
      }
      break;
    case "gist":
      if (!query.id) {
        throw new Error("id is required for the gist card.");
      }
      break;
    default:
      break;
  }
};

const run = async () => {
  const card = getInput("card", { required: true }).toLowerCase();
  const optionsInput = getInput("options") || "";
  const outputPathInput = getInput("path");

  const handler = cardHandlers[card];
  if (!handler) {
    throw new Error(`Unsupported card type: ${card}`);
  }

  const query = parseOptions(optionsInput);

  validateCardOptions(card, query, process.env.GITHUB_REPOSITORY_OWNER);

  const outputPathValue =
    outputPathInput || path.join("profile", `${card}.svg`);
  const outputPath = path.resolve(process.cwd(), outputPathValue);
  await mkdir(path.dirname(outputPath), { recursive: true });

  const svg = (await handler(query)).content;
  if (!svg) {
    throw new Error("Card renderer returned empty output.");
  }

  await writeFile(outputPath, svg, "utf8");
  info(`Wrote ${outputPath}`);
  setOutput("path", outputPathValue);
};

run().catch((error) => {
  setFailed(error instanceof Error ? error.message : String(error));
});
