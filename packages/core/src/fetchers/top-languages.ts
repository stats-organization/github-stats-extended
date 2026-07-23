import type { AxiosResponse } from "axios";

import { getConfig } from "../common/config.js";
import { CustomError, MissingParamError } from "../common/error.js";
import { wrapTextMultiline } from "../common/fmt.js";
import { request } from "../common/http.js";
import { logger } from "../common/log.js";
import { parseOwnerAffiliations } from "../common/ops.js";
import { retryer } from "../common/retryer.js";

import type { Lang, TopLangData } from "./types.js";

/**
 * Top languages fetcher object.
 *
 * @param variables Fetcher variables.
 * @param token GitHub token.
 * @returns Languages fetcher response.
 */
const fetcher = (
  variables: Record<string, unknown>,
  token: string,
): Promise<AxiosResponse> => {
  return request(
    {
      query: `
      query userInfo($login: String!, $ownerAffiliations: [RepositoryAffiliation]) {
        user(login: $login) {
          # do not fetch forks
          repositories(ownerAffiliations: $ownerAffiliations, isFork: false, first: 100) {
            nodes {
              name
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    color
                    name
                  }
                }
              }
            }
          }
        }
      }
      `,
      variables,
    },
    {
      Authorization: `token ${token}`,
    },
  );
};

/** A language edge within a repository's `languages` connection. */
interface LanguageEdge {
  size: number;
  node: { color: string; name: string };
}

/** A repository node returned by the query. */
interface RepositoryNode {
  name: string;
  /** Not selected by the query; only here so the no-op sort below type-checks. */
  size?: number;
  languages: { edges: Array<LanguageEdge> };
}

/** Shape of `response.data` returned by the top-languages query. */
interface TopLanguagesQueryResponse {
  data: {
    user: {
      repositories: { nodes: Array<RepositoryNode> };
    };
  };
}

/**
 * Fetch top languages for a given username.
 *
 * @param username GitHub username.
 * @param exclude_repo List of repositories to exclude. Default: [].
 * @param size_weight Weightage to be given to size.
 * @param count_weight Weightage to be given to count.
 * @param ownerAffiliations The owner affiliations to filter by. Default: OWNER.
 * @param pat Optional PAT override.
 * @returns Top languages data.
 */
const fetchTopLanguages = async (
  username: string,
  exclude_repo: Array<string> = [],
  size_weight = 1,
  count_weight = 0,
  ownerAffiliations: Array<string> = [],
  pat: string | null = null,
): Promise<TopLangData> => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }
  const affiliations = parseOwnerAffiliations(ownerAffiliations);

  const res = await retryer<TopLanguagesQueryResponse>(
    fetcher,
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
  const repoNodes = res.data.data.user.repositories.nodes
    .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
    .filter((node) => !repoToHide[node.name]);

  // flatten edges across repos. Order matters: `concat(acc)` prepends, and the
  // shared repoCount below depends on visitation order.
  const languageEdges = repoNodes
    .filter((node) => node.languages.edges.length > 0)
    .reduce<Array<LanguageEdge>>(
      (acc, curr) => curr.languages.edges.concat(acc),
      [],
    );

  // accumulate size and repo count per language
  const languageMap: Record<string, Lang> = {};
  let repoCount = 0;
  for (const edge of languageEdges) {
    const existing = languageMap[edge.node.name];

    // same language seen again: add to its size and bump count; else reset to 1
    let langSize = edge.size;
    if (existing && edge.node.name === existing.name) {
      langSize = edge.size + existing.size;
      repoCount += 1;
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
