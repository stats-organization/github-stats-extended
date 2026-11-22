import { getConfig } from "../common/config.js";
import { CustomError, MissingParamError } from "../common/error.js";
import { wrapTextMultiline } from "../common/fmt.js";
import { createGraphQLFetcher } from "../common/http.js";
import { logger } from "../common/log.js";
import { parseOwnerAffiliations } from "../common/ops.js";
import { retryer } from "../common/retryer.js";
import { TopLanguagesDocument } from "../graphql/generated/top-languages.js";
import type { TopLanguagesRepositoryFragment } from "../graphql/generated/top-languages.js";

import type { Lang, TopLangData } from "./types.js";

const fetcher = createGraphQLFetcher(TopLanguagesDocument, "token");

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

  const res = await retryer(
    fetcher,
    {
      login: username,
      after: null,
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

  const allRepoNodes: Array<TopLanguagesRepositoryFragment> = [];
  const initialNodes = res.data.data.user?.repositories.nodes ?? [];
  for (const node of initialNodes) {
    if (node) {
      allRepoNodes.push(node);
    }
  }

  const maxPages = getConfig().fetchMultiPageLangs;
  let pageRepositories = res.data.data.user?.repositories;
  let previousCursor: string | null = null;
  let fetchedPages = 1;

  interface PageInfoType {
    hasNextPage?: boolean;
    endCursor?: string | null;
  }

  while (
    fetchedPages < maxPages &&
    Boolean(
      (pageRepositories as { pageInfo?: PageInfoType } | undefined)?.pageInfo
        ?.hasNextPage,
    )
  ) {
    const after =
      (pageRepositories as { pageInfo?: PageInfoType } | undefined)?.pageInfo
        ?.endCursor ?? null;
    if (after === null || after === previousCursor) {
      break;
    }
    previousCursor = after;

    const pageRes = await retryer(
      fetcher,
      {
        login: username,
        after,
        ownerAffiliations: affiliations,
      },
      pat,
    );

    if (pageRes.data.errors) {
      logger.error(pageRes.data.errors);
      break;
    }

    pageRepositories = pageRes.data.data.user?.repositories;
    const pageNodes = pageRepositories?.nodes ?? [];
    for (const node of pageNodes) {
      if (node) {
        allRepoNodes.push(node);
      }
    }
    fetchedPages++;
  }

  const repoToHide: Record<string, boolean> = {};
  const allExcludedRepos = [
    ...exclude_repo,
    ...getConfig().excludeRepositories,
  ];

  // populate repoToHide map for quick lookup while filtering out
  allExcludedRepos.forEach((repoName) => {
    repoToHide[repoName.trim()] = true;
  });

  // filter out repositories to be hidden (matching name or nameWithOwner)
  const repoNodes = allRepoNodes.filter(
    (node) => !repoToHide[node.name] && !repoToHide[node.nameWithOwner],
  );

  // accumulate size and repo count per language in a single linear pass
  const languageMap: Record<string, Lang> = {};
  for (const repo of repoNodes) {
    const edges = repo.languages?.edges ?? [];
    for (const edge of edges) {
      if (!edge) {
        continue;
      }
      const existing = languageMap[edge.node.name];
      if (existing) {
        existing.size += edge.size;
        existing.count += 1;
      } else {
        languageMap[edge.node.name] = {
          name: edge.node.name,
          color: edge.node.color,
          size: edge.size,
          count: 1,
        };
      }
    }
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
