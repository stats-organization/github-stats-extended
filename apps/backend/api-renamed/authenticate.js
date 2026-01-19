import { logger } from "../src/common/log.js";
import { authenticate } from "../src/users.js";

/**
 * @param {any} req The request.
 * @param {any} res The response.
 */
export default async (req, res) => {
  const { code, private_access, user_key } = req.query;
  try {
    let { userId, needDowngrade } = await authenticate(
      code,
      private_access === "true",
      user_key,
    );
    res.send({ userId, needDowngrade });
  } catch (err) {
    logger.error(err);
    res.send("Something went wrong: " + err.message);
  }
};
