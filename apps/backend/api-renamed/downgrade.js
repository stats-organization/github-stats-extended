import { getUserAccessByKey, deleteUser } from "../src/common/database.js";
import axios from "axios";
import { logger } from "../src/common/log.js";

export default async (req, res) => {
  // We could optimize this method by doing both database operations in one statement, using "DELETE ... RETURNING ..."

  const { user_key } = req.query;
  if (!user_key) {
    res.statusCode = 400;
    res.send("missing user_key");
    return;
  }

  if (
    !process.env.OAUTH_CLIENT_ID ||
    !process.env.OAUTH_CLIENT_SECRET ||
    !process.env.OAUTH_REDIRECT_URI
  ) {
    throw new Error(
      "OAuth Error: One or more required environment variables (OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REDIRECT_URI) are not set.",
    );
  }

  // get token and private access status
  const userAccess = await getUserAccessByKey(user_key);
  if (!userAccess) {
    res.statusCode = 404;
    res.send("user not found");
    return;
  }

  // verify that user has private access
  if (!userAccess.privateAccess) {
    res.statusCode = 400;
    res.send("user does not have private access");
    return;
  }

  // delete existing app authorization via GitHub API
  try {
    await axios.delete(
      `https://api.github.com/applications/${process.env.OAUTH_CLIENT_ID}/grant`,
      {
        auth: {
          username: process.env.OAUTH_CLIENT_ID,
          password: process.env.OAUTH_CLIENT_SECRET,
        },
        data: { access_token: userAccess.token },
        headers: {
          Accept: "application/vnd.github+json",
        },
      },
    );
  } catch (err) {
    logger.error(err);
    res.statusCode = 500;
    res.send("Failed to delete GitHub authorization with private access");
    return;
  }

  await deleteUser(user_key);

  // redirect to GitHub OAuth for public access
  const params = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
  }).toString();

  res.statusCode = 302;
  res.setHeader(
    "Location",
    `https://github.com/login/oauth/authorize?${params}`,
  );
  res.end();
};
