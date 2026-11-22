// Generated file — see .github/CONTRIBUTING.md

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
import type * as Types from "./common.js";

import { graphqlDocument } from "../graphqlDocument.js";
export type TopLanguageFragment = {
  size: number;
  node: { color: string | null; name: string };
};

export type TopLanguagesRepositoryFragment = {
  name: string;
  nameWithOwner: string;
  languages: {
    edges: Array<{
      size: number;
      node: { color: string | null; name: string };
    } | null> | null;
  } | null;
};

export type TopLanguagesQueryVariables = Exact<{
  login: string;
  after?: string | null | undefined;
  ownerAffiliations?:
    | Array<Types.RepositoryAffiliation | null | undefined>
    | Types.RepositoryAffiliation
    | null
    | undefined;
}>;

export type TopLanguagesQuery = {
  user: {
    repositories: {
      nodes: Array<{
        name: string;
        nameWithOwner: string;
        languages: {
          edges: Array<{
            size: number;
            node: { color: string | null; name: string };
          } | null> | null;
        } | null;
      } | null> | null;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
};

export const TopLanguagesDocument = graphqlDocument<
  TopLanguagesQuery,
  TopLanguagesQueryVariables
>(`
query topLanguages($login: String!, $after: String, $ownerAffiliations: [RepositoryAffiliation]) {
  user(login: $login) {
    repositories(
      ownerAffiliations: $ownerAffiliations
      isFork: false
      first: 100
      after: $after
      orderBy: {field: PUSHED_AT, direction: DESC}
    ) {
      nodes {
        ...TopLanguagesRepository
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
fragment TopLanguagesRepository on Repository {
  name
  nameWithOwner
  languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
    edges {
      ...TopLanguage
    }
  }
}
fragment TopLanguage on LanguageEdge {
  size
  node {
    color
    name
  }
}`);
