import { MissingParamError } from "../common/error.js";
import { createGraphQLFetcher } from "../common/http.js";
import { retryer } from "../common/retryer.js";
import { GistInfoDocument } from "../graphql/generated/gist.js";
import type { GistFileInfoFragment } from "../graphql/generated/gist.js";

import type { GistData } from "./types.js";

const fetcher = createGraphQLFetcher(GistInfoDocument, "token");

/**
 * This function calculates the primary language of a gist by files size.
 *
 * @param files Files.
 * @returns Primary language, or `null` when no file has a language.
 */
const calculatePrimaryLanguage = (
  files: Array<GistFileInfoFragment>,
): string | null => {
  const languages: Record<string, number> = {};

  for (const file of files) {
    if (file.language) {
      languages[file.language.name] =
        (languages[file.language.name] ?? 0) + (file.size ?? 0);
    }
  }

  let primaryLanguage: string | null = null;
  let maxSize = -1;
  for (const [language, size] of Object.entries(languages)) {
    if (size > maxSize) {
      maxSize = size;
      primaryLanguage = language;
    }
  }

  return primaryLanguage;
};

/**
 * Fetch GitHub gist information by given username and ID.
 *
 * @param id GitHub gist ID.
 * @param pat Optional PAT override.
 * @returns Gist data.
 */
const fetchGist = async (
  id: string,
  pat: string | null = null,
): Promise<GistData> => {
  if (!id) {
    throw new MissingParamError(["id"], "/api/gist?id=GIST_ID");
  }
  const res = await retryer(fetcher, { gistName: id }, pat);
  if (res.data.errors) {
    throw new Error(res.data.errors[0]?.message);
  }
  const gist = res.data.data.viewer.gist;
  if (!gist) {
    throw new Error("Gist not found");
  }
  const firstFile = gist.files?.[0];
  if (!firstFile?.name) {
    throw new Error("Gist has no files");
  }
  return {
    name: firstFile.name,
    nameWithOwner: `${gist.owner?.login ?? ""}/${firstFile.name}`,
    description: gist.description,
    language: calculatePrimaryLanguage(
      gist.files?.filter((file) => !!file) ?? [],
    ),
    starsCount: gist.stargazerCount,
    forksCount: gist.forks.totalCount,
  };
};

export { fetchGist };
