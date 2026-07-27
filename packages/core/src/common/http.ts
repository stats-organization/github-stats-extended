import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

/** Body of a GraphQL request sent to the GitHub API. */
interface GraphQLRequest {
  /** The GraphQL query. */
  query: string;
  /** Variables referenced by the query. */
  variables: Record<string, unknown>;
}

/**
 * Send GraphQL request to GitHub API.
 *
 * @param data Request data.
 * @param headers Request headers.
 * @returns Request response.
 */
const request = (
  data: GraphQLRequest,
  headers: NonNullable<AxiosRequestConfig["headers"]>,
): Promise<AxiosResponse> => {
  return axios({
    url: "https://api.github.com/graphql",
    method: "post",
    headers,
    data,
  });
};

export { request };
