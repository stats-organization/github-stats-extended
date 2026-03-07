import axios from "axios";

import { HOST } from "./constants";

// See https://github.com/stats-organization/github-stats-extended/pull/27#discussion_r2712184285
const fetchWakatimeStats = async ({
  username,
  api_domain: _,
}: {
  username: string;
  api_domain: string;
}): Promise<unknown> => {
  if (!username) {
    throw new Error("missing parameter: username");
  }

  const res = await axios.get<unknown>(
    `https://${HOST}/api/wakatime-proxy?username=${username}`,
  );

  return res.data;
};

export { fetchWakatimeStats };
export default fetchWakatimeStats;
