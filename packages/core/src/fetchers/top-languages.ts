import { getConfig } from "../common/config.js";
import { CustomError, MissingParamError } from "../common/error.js";
import { wrapTextMultiline } from "../common/fmt.js";
import { createGraphQLFetcher } from "../common/http.js";
import { getLanguageColor } from "../common/languageColors.js";
import { logger } from "../common/log.js";
import { parseOwnerAffiliations } from "../common/ops.js";
import { retryer } from "../common/retryer.js";
import { TopLanguagesDocument } from "../graphql/generated/top-languages.js";
import type {
  TopLanguageFragment,
  TopLanguagesRepositoryFragment,
} from "../graphql/generated/top-languages.js";

import {
  JUPYTER_NOTEBOOK,
  MAX_NOTEBOOKS_PER_CARD,
  recountJupyterRepository,
} from "./jupyter-languages.js";
import type { Lang, TopLangData } from "./types.js";

const fetcher = createGraphQLFetcher(TopLanguagesDocument, "token");

/**
 * Swap a repository's Jupyter Notebook edge for the languages its code cells use.
 * Bytes of an unknown kernel stay Jupyter Notebook. Outputs are not included.
 *
 * @param edges Language edges GitHub reported for one repository.
 * @param bytesByLanguage Code-cell bytes keyed by Linguist language name.
 * @param jupyterColor Color GitHub assigned to Jupyter Notebook.
 * @returns Edges with notebook output bytes removed.
 */
const mergeCodeCellBytes = (
  edges: Array<TopLanguageFragment | null>,
  bytesByLanguage: Record<string, number>,
  jupyterColor: string | null,
): Array<TopLanguageFragment> => {
  const next = edges.filter(
    (edge): edge is TopLanguageFragment =>
      edge !== null && edge.node.name !== JUPYTER_NOTEBOOK,
  );
  for (const [name, size] of Object.entries(bytesByLanguage)) {
    if (size <= 0) {
      continue;
    }
    const existing = next.find((edge) => edge.node.name === name);
    if (existing) {
      existing.size += size;
      continue;
    }
    next.push({
      size,
      node: {
        name,
        color:
          name === JUPYTER_NOTEBOOK ? jupyterColor : getLanguageColor(name),
      },
    });
  }
  return next;
};

/**
 * Fetch top languages for a given username.
 *
 * @param username GitHub username.
 * @param exclude_repo List of repositories to exclude. Default: [].
 * @param size_weight Weightage to be given to size.
 * @param count_weight Weightage to be given to count.
 * @param ownerAffiliations The owner affiliations to filter by. Default: OWNER.
 * @param pat Optional PAT override.
 * @param countJupyter When true, replace Jupyter Notebook bytes with code-cell bytes.
 * @returns Top languages data.
 */
const fetchTopLanguages = async (
  username: string,
  exclude_repo: Array<string> = [],
  size_weight = 1,
  count_weight = 0,
  ownerAffiliations: Array<string> = [],
  pat: string | null = null,
  countJupyter = false,
): Promise<TopLangData> => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }
  const affiliations = parseOwnerAffiliations(ownerAffiliations);

  let githubToken = "";
  const res = await retryer(
    (variables, token) => {
      githubToken = token;
      return fetcher(variables, token);
    },
    {
      login: username,
      ownerAffiliations: affiliations,
    },
    pat,
  );

  if (res.data.errors) {
    logger.error(res.data.errors);
    const firstError = res.data.errors[0];
    if (firstError?.type === "NOT_FOUND") {
      throw new CustomError(
        firstError.message || "Could not fetch user.",
        CustomError.USER_NOT_FOUND,
      );
    }
    if (firstError?.message) {
      throw new CustomError(
        wrapTextMultiline(firstError.message, 525, 12)[0] ?? "",
        res.statusText,
      );
    }
    throw new CustomError(
      "Something went wrong while trying to retrieve the language data using the GraphQL API.",
      CustomError.GRAPHQL_ERROR,
    );
  }

  const repoToHide: Record<string, boolean> = {};
  const allExcludedRepos = [
    ...exclude_repo,
    ...getConfig().excludeRepositories,
  ];

  // populate repoToHide map for quick lookup while filtering out
  allExcludedRepos.forEach((repoName) => {
    repoToHide[repoName] = true;
  });

  // filter out repositories to be hidden
  const repoNodes = (res.data.data.user?.repositories.nodes ?? []).filter(
    (node): node is TopLanguagesRepositoryFragment =>
      !!node && !repoToHide[node.name],
  );

  if (countJupyter && githubToken !== "") {
    let budget = MAX_NOTEBOOKS_PER_CARD;
    for (const repo of repoNodes) {
      if (budget <= 0) {
        break;
      }
      const languages = repo.languages;
      if (languages === null) {
        continue;
      }
      const edges = languages.edges;
      if (edges === null) {
        continue;
      }
      const jupyterEdge = edges.find(
        (edge) => edge?.node.name === JUPYTER_NOTEBOOK,
      );
      if (jupyterEdge === null || jupyterEdge === undefined) {
        continue;
      }
      const recounted = await recountJupyterRepository(
        repo.owner.login,
        repo.name,
        githubToken,
        budget,
      );
      if (recounted === null) {
        continue;
      }
      budget -= recounted.notebooks;
      languages.edges = mergeCodeCellBytes(
        edges,
        recounted.bytesByLanguage,
        jupyterEdge.node.color,
      );
    }
  }

  // flatten edges across repos. Order matters: `concat(acc)` prepends, and the
  // shared repoCount below depends on visitation order.
  const languageEdges = repoNodes.reduce<Array<TopLanguageFragment>>(
    (acc, repo) => {
      const edges = (repo.languages?.edges ?? []).filter(
        (edge): edge is TopLanguageFragment => !!edge,
      );
      return edges.length > 0 ? edges.concat(acc) : acc;
    },
    [],
  );

  // accumulate size and repo count per language
  const languageMap: Record<string, Lang> = {};
  let repoCount: number;
  for (const edge of languageEdges) {
    const existing = languageMap[edge.node.name];

    // same language seen again: add to its size and bump count; else reset to 1
    let langSize = edge.size;
    if (existing && edge.node.name === existing.name) {
      langSize = edge.size + existing.size;
      repoCount = existing.count + 1;
    } else {
      repoCount = 1;
    }
    languageMap[edge.node.name] = {
      name: edge.node.name,
      color: edge.node.color,
      size: langSize,
      count: repoCount,
    };
  }

  // comparison index calculation
  for (const lang of Object.values(languageMap)) {
    lang.size =
      Math.pow(lang.size, size_weight) * Math.pow(lang.count, count_weight);
  }

  // return languages sorted by (weighted) size, descending
  return Object.fromEntries(
    Object.entries(languageMap).sort(([, a], [, b]) => b.size - a.size),
  );
};

export { fetchTopLanguages };
