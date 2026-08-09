import { SLUG_BY_FILE } from "./pages";

/**
 * Absolute URL of the hosted deployment as written in the repository markdown.
 *
 * Occurrences are rewritten to site-relative URLs so a docs page always renders
 * its card samples through the deployment that serves it, rather than pinning
 * every sample to production. This is what keeps docs and API in sync: a page
 * built from a commit can only show what that same commit's API supports.
 */
const HOSTED_ORIGIN = "https://github-stats-extended.vercel.app";

const REPO_BLOB_URL =
  "https://github.com/stats-organization/github-stats-extended/blob/master";

/** Link to a repository file on GitHub, by its path from the repository root. */
export function repoBlobUrl(repoPath: string): string {
  return `${REPO_BLOB_URL}/${repoPath}`;
}

/**
 * Local images referenced from the markdown. Importing them here is what puts
 * them through Vite's asset pipeline; the keys are repository-root paths, which
 * is what `resolveRepoPath` produces.
 */
const ASSETS: Record<string, string> = {
  "docs/frontend-screenshot.png": new URL(
    "../../../../docs/frontend-screenshot.png",
    import.meta.url,
  ).href,
};

/**
 * Resolves `target` against the directory holding `fromFile`, both being
 * repository-root paths. A browser-side equivalent of `path.resolve` limited to
 * what the markdown sources use.
 */
export function resolveRepoPath(fromFile: string, target: string): string {
  const segments = fromFile.split("/").slice(0, -1);

  for (const segment of target.split("/")) {
    if (segment === "." || segment === "") {
      continue;
    }
    if (segment === "..") {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }

  return segments.join("/");
}

/**
 * Rewrites one URL found in `fromFile` so it resolves inside the docs page.
 *
 * Passed to `react-markdown` as `urlTransform`, so it covers links and images
 * alike, including the reference-style image definitions the generated theme
 * list uses.
 */
export function resolveDocUrl(url: string, fromFile: string): string {
  if (url.startsWith(HOSTED_ORIGIN)) {
    return url.slice(HOSTED_ORIGIN.length) || "/";
  }

  // Bare anchors and URLs to other sites are already correct.
  if (url.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(url)) {
    return url;
  }

  const [target = "", hash] = url.split("#");
  const suffix = hash ? `#${hash}` : "";

  // A root-relative URL already points at this deployment.
  if (target.startsWith("/")) {
    return url;
  }

  const repoPath = resolveRepoPath(fromFile, target);

  if (target.endsWith(".md")) {
    const slug = SLUG_BY_FILE.get(repoPath);
    // Markdown outside the docs site (CONTRIBUTING.md, …) keeps working by
    // pointing at the repository.
    return slug ? `?page=${slug}${suffix}` : repoBlobUrl(repoPath);
  }

  const asset = ASSETS[repoPath];
  if (asset) {
    return asset;
  }

  // Anything else is a repository file with no in-app equivalent.
  return repoBlobUrl(repoPath);
}
