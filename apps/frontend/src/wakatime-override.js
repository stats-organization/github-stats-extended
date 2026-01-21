import axios from "axios";
import { HOST } from "./constants";

// See https://github.com/stats-organization/github-stats-extended/pull/27#discussion_r2712184285
// eslint-disable-next-line no-unused-vars
const fetchWakatimeStats = async ({ username, api_domain }) => {
  if (!username) {
    throw new Error("missing parameter: username");
  }

  const { data } = await axios.get(
    `https://${HOST}/api/wakatime-proxy?username=${username}`,
  );

  return data;
};

export { fetchWakatimeStats };
export default fetchWakatimeStats;
