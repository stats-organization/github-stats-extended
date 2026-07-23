import axios from "axios";

import { CustomError, MissingParamError } from "../common/error.js";

import type { WakaTimeData } from "./types.js";

/**
 * WakaTime data fetcher.
 *
 * @param props Fetcher props.
 * @param props.username WakaTime username.
 * @param props.api_domain Optional WakaTime API domain (defaults to `wakatime.com`).
 * @returns WakaTime data response.
 */
const fetchWakatimeStats = async ({
  username,
  api_domain,
}: {
  username: string;
  api_domain?: string;
}): Promise<WakaTimeData> => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  try {
    const { data } = await axios.get<{ data: WakaTimeData }>(
      `https://${
        api_domain ? api_domain.replace(/\/$/gi, "") : "wakatime.com"
      }/api/v1/users/${username}/stats?is_including_today=true`,
    );

    return data.data;
  } catch (err) {
    if (
      axios.isAxiosError(err) &&
      err.response &&
      (err.response.status < 200 || err.response.status > 299)
    ) {
      throw new CustomError(
        `Could not resolve to a User with the login of '${username}'`,
        "WAKATIME_USER_NOT_FOUND",
      );
    }
    throw err;
  }
};

export { fetchWakatimeStats };
