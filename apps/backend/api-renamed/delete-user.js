import { logger } from "../src/common/log.js";
import { deleteUser } from "../src/common/database.js";

/**
 * @param {any} req The request.
 * @param {any} res The response.
 */
export default async (req, res) => {
  const { user_key } = req.query;
  try {
    await deleteUser(user_key);
  } catch (err) {
    logger.error(err);
    res.send("Something went wrong: " + err.message);
  }
  res.send("ok");
};
