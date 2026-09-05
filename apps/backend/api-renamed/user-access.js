import { logger } from "@stats-organization/github-readme-stats-core";

import { deleteUser, getUserAccessByKey } from "../src/common/database.js";

/**
 * @param {any} req The request.
 * @param {any} res The response.
 */
export default async (req, res) => {
  const { user_key } = req.query;
  try {
    const result = await getUserAccessByKey(user_key);

    if (!result) {
      res.statusCode = 404;
      res.send("user not found");
      return;
    }
    if (result.token === null) {
      // the stored token cannot be decrypted: drop it so the user can log in again
      await deleteUser(user_key);
      res.statusCode = 404;
      res.send("user must log in again");
      return;
    }

    res.send({
      privateAccess: result.privateAccess,
      token: result.token,
    });
  } catch (err) {
    logger.error(err);
    res.send("Something went wrong: " + err.message);
  }
};
