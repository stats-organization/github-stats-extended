import axios from "axios";

import { CustomError, MissingParamError } from "../common/error.js";

import type { WakaTimeData } from "./types.js";

/**
 * Validates whether the given domain is a safe, valid FQDN.
 * Rejects private, loopback, link-local, and cloud metadata addresses.
 *
 * @param domain Domain to validate.
 * @returns True if valid, false otherwise.
 */
const isValidApiDomain = (domain: string): boolean => {
  const cleaned = domain.trim().replace(/\/+$/, "");
  const FQDN_PATTERN =
    /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(?:\.(?!-)[a-zA-Z0-9-]{1,63}(?<!-))*\.[a-zA-Z]{2,}$/;
  const PRIVATE_IP_PATTERN =
    /(?:^|\.)(?:127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0)(?:\.|$)/i;
  const isLoopbackOrInternal =
    /^(?:localhost|.*\.localhost|metadata\.google\.internal|instance-data)$/i.test(
      cleaned,
    );

  if (isLoopbackOrInternal || PRIVATE_IP_PATTERN.test(cleaned)) {
    return false;
  }

  return FQDN_PATTERN.test(cleaned);
};

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

  let domain = "wakatime.com";
  if (api_domain && api_domain.trim().length > 0) {
    const cleaned = api_domain.trim().replace(/\/+$/, "");
    if (!isValidApiDomain(cleaned)) {
      throw new CustomError(
        `Invalid api_domain provided: '${api_domain}'`,
        CustomError.INVALID_API_DOMAIN,
      );
    }
    domain = cleaned;
  }

  try {
    const { data } = await axios.get<{ data: WakaTimeData }>(
      `https://${domain}/api/v1/users/${username}/stats?is_including_today=true`,
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

export { fetchWakatimeStats, isValidApiDomain };
