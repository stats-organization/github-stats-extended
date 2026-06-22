import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Send GraphQL request to GitHub API.
 *
 * @param data Request data.
 * @param headers Request headers.
 * @returns Request response.
 */
const request = (
  data: unknown,
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
