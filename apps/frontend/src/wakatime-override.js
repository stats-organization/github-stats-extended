import axios from 'axios';
import { HOST } from './constants';

const fetchWakatimeStats = async ({ username, api_domain }) => {
  if (!username) {
    throw new Error('missing parameter: username');
  }

  const { data } = await axios.get(
    `https://${HOST}/api/wakatime-proxy?username=${username}`,
  );

  return data;
};

export { fetchWakatimeStats };
export default fetchWakatimeStats;
