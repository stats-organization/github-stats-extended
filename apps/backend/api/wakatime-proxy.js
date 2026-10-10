import {
  fetchWakatimeStats,
  logger,
} from "@stats-organization/github-readme-stats-core";

/**
 * @param {any} req The request.
 * @param {any} res The response.
 */
export default async (req, res) => {
  const { username } = req.query;
  res.setHeader("Content-Type", "application/json");
  try {
    const stats = await fetchWakatimeStats({ username });
    res.send(stats);
  } catch (err) {
    logger.error(err);
    res.send("Something went wrong: " + err.message);
  }
};
