/**
 * A GraphQL query paired with the types of its result and variables.
 *
 * `text` is what goes over the wire; the other two members only carry types and are never assigned.
 * Documents are generated from `queries/*.graphql`
 * See `scripts/generate-graphql-types.js`.
 */
interface GraphQLDocument<TResult, TVariables> {
  readonly text: string;
  readonly __result?: TResult;
  readonly __variables?: TVariables;
}

/**
 * Build a typed document.
 *
 * @param text The query text, including every fragment it spreads.
 * @returns The document to pass to the function created by `createGraphQLFetcher`.
 */
const graphqlDocument = <TResult, TVariables>(
  text: string,
): GraphQLDocument<TResult, TVariables> => ({ text });

export { graphqlDocument };
export type { GraphQLDocument };
