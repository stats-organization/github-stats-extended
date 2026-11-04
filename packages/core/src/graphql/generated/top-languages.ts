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
  owner: { login: string } | { login: string };
  languages: {
    edges: Array<{
      size: number;
      node: { color: string | null; name: string };
    } | null> | null;
  } | null;
};

export type TopLanguagesQueryVariables = Exact<{
  login: string;
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
        owner: { login: string } | { login: string };
        languages: {
          edges: Array<{
            size: number;
            node: { color: string | null; name: string };
          } | null> | null;
        } | null;
      } | null> | null;
    };
  } | null;
};

export const TopLanguagesDocument = graphqlDocument<
  TopLanguagesQuery,
  TopLanguagesQueryVariables
>(`
query topLanguages($login: String!, $ownerAffiliations: [RepositoryAffiliation]) {
  user(login: $login) {
    repositories(ownerAffiliations: $ownerAffiliations, isFork: false, first: 100) {
      nodes {
        ...TopLanguagesRepository
      }
    }
  }
}
fragment TopLanguagesRepository on Repository {
  name
  owner {
    login
  }
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
