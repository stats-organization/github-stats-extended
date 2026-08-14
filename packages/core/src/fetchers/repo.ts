import { MissingParamError } from "../common/error.js";
import { createGraphQLFetcher } from "../common/http.js";
import { retryer } from "../common/retryer.js";
import { GetRepoDocument } from "../graphql/generated/repo.js";

import { fetchRepoUserStats } from "./stats.js";
import type { RepositoryData } from "./types.js";

const fetcher = createGraphQLFetcher(GetRepoDocument, "token");

const urlExample = "/api/pin?username=USERNAME&repo=REPO_NAME";

/**
 * Fetch repository data.
 *
 * @param username GitHub username.
 * @param reponame GitHub repository name.
 * @param include_prs_authored Include count of PRs authored.
 * @param include_prs_commented Include count of PRs commented.
 * @param include_prs_reviewed Include count of PRs reviewed.
 * @param include_issues_authored Include count of issues authored.
 * @param include_issues_commented Include count of issues commented.
 * @param pat Optional PAT override.
 * @returns Repository data.
 */
const fetchRepo = async (
  username: string,
  reponame: string,
  include_prs_authored = false,
  include_prs_commented = false,
  include_prs_reviewed = false,
  include_issues_authored = false,
  include_issues_commented = false,
  pat: string | null = null,
): Promise<RepositoryData> => {
  let owner = username;
  if (reponame && reponame.includes("/")) {
    const [parsedOwner, parsedRepo] = reponame.split("/");
    owner = parsedOwner ?? "";
    reponame = parsedRepo ?? "";
  }

  if (owner && !username) {
    username = owner;
  }
  if (username && !owner) {
    owner = username;
  }
  if (!username && !reponame) {
    throw new MissingParamError(["username", "repo"], urlExample);
  }
  if (!username) {
    throw new MissingParamError(["username"], urlExample);
  }
  if (!reponame) {
    throw new MissingParamError(["repo"], urlExample);
  }

  const res = await retryer(fetcher, { login: owner, repo: reponame }, pat);

  const data = res.data.data;

  if (!data.user && !data.organization) {
    throw new Error("Not found");
  }

  if (data.organization === null && data.user) {
    const repository = data.user.repository;
    if (!repository || repository.isPrivate) {
      throw new Error("User Repository Not found");
    }
    const repoUserStats = await fetchRepoUserStats(
      username,
      [owner + "/" + reponame],
      [],
      include_prs_authored,
      include_prs_commented,
      include_prs_reviewed,
      include_issues_authored,
      include_issues_commented,
      pat,
    );
    return {
      ...repoUserStats,
      ...repository,
    };
  }

  if (data.user === null && data.organization) {
    const repository = data.organization.repository;
    if (!repository || repository.isPrivate) {
      throw new Error("Organization Repository Not found");
    }
    const repoUserStats = await fetchRepoUserStats(
      username,
      [owner + "/" + reponame],
      [],
      include_prs_authored,
      include_prs_commented,
      include_prs_reviewed,
      include_issues_authored,
      include_issues_commented,
      pat,
    );
    return {
      ...repoUserStats,
      ...repository,
    };
  }

  throw new Error("Unexpected behavior");
};

export { fetchRepo };
