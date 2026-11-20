import { getConfig } from "../common/config.js";
import { CustomError, MissingParamError } from "../common/error.js";
import { wrapTextMultiline } from "../common/fmt.js";
import { createGraphQLFetcher } from "../common/http.js";
import { logger } from "../common/log.js";
import { parseOwnerAffiliations } from "../common/ops.js";
import { retryer } from "../common/retryer.js";
import { TopLanguagesDocument } from "../graphql/generated/top-languages.js";
import type {
  TopLanguageFragment,
  TopLanguagesRepositoryFragment,
} from "../graphql/generated/top-languages.js";

import type { Lang, TopLangData } from "./types.js";

const fetcher = createGraphQLFetcher(TopLanguagesDocument, "token");

/** Upper bound on repository pages (100 repos each) fetched for one card. */
const MAX_PAGES = 10;

/**
 * Fetch one page of the user's non-fork repositories, most recently pushed first.
 *
 * @param username GitHub username.
 * @param affiliations Parsed owner affiliations.
 * @param after Cursor of the previous page, or null for the first page.
 * @param pat Optional PAT override.
 * @returns The page's repositories and pagination info.
 */
const fetchRepositoriesPage = async (
  username: string,
  affiliations: ReturnType<typeof parseOwnerAffiliations>,
  after: string | null,
  pat: string | null,
): Promise<{
  nodes: Array<TopLanguagesRepositoryFragment>;
  hasNextPage: boolean;
  endCursor: string | null;
}> => {
  const res = await retryer(
    fetcher,
    {
      login: username,
      ownerAffiliations: affiliations,
      after,
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

  const repositories = res.data.data.user?.repositories;
  return {
    nodes: (repositories?.nodes ?? []).filter(
      (node): node is TopLanguagesRepositoryFragment => !!node,
    ),
    hasNextPage: repositories?.pageInfo.hasNextPage ?? false,
    endCursor: repositories?.pageInfo.endCursor ?? null,
  };
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
 * @param pushedRange Only count repositories whose last push falls in this range.
 * @param pushedRange.after Inclusive lower bound on the last push date.
 *        Paging stops once repositories pushed before it are reached.
 * @param pushedRange.before Exclusive upper bound on the last push date.
 * @returns Top languages data.
 */
const fetchTopLanguages = async (
  username: string,
  exclude_repo: Array<string> = [],
  size_weight = 1,
  count_weight = 0,
  ownerAffiliations: Array<string> = [],
  pat: string | null = null,
  pushedRange: { after?: Date | null; before?: Date | null } = {},
): Promise<TopLangData> => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }
  const affiliations = parseOwnerAffiliations(ownerAffiliations);

  const { after: pushedAfter, before: pushedBefore } = pushedRange;
  const pushedAt = (node: TopLanguagesRepositoryFragment): Date | null =>
    node.pushedAt ? new Date(node.pushedAt) : null;
  const isNotTooOld = (node: TopLanguagesRepositoryFragment): boolean => {
    if (!pushedAfter) {
      return true;
    }
    const date = pushedAt(node);
    return !!date && date >= pushedAfter;
  };
  const isNotTooNew = (node: TopLanguagesRepositoryFragment): boolean => {
    if (!pushedBefore) {
      return true;
    }
    const date = pushedAt(node);
    return !!date && date < pushedBefore;
  };

  const fetchedNodes: Array<TopLanguagesRepositoryFragment> = [];
  let after: string | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const pageNodes = await fetchRepositoriesPage(
      username,
      affiliations,
      after,
      pat,
    );
    fetchedNodes.push(...pageNodes.nodes);

    // repositories come most recently pushed first, so once one is older
    // than the range, every later page is too
    const last = pageNodes.nodes.at(-1);
    if (!pageNodes.hasNextPage || (last && !isNotTooOld(last))) {
      break;
    }
    after = pageNodes.endCursor;
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

  // filter out repositories to be hidden or last pushed outside the range
  const repoNodes = fetchedNodes.filter(
    (node) => !repoToHide[node.name] && isNotTooOld(node) && isNotTooNew(node),
  );

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
