import axios from "axios";
import { storeUser } from "./common/database.js";

/**
 * Given an access token, return the GitHub login (userId) or null if invalid
 *
 * @param {string} accessToken GitHub access token
 * @returns {Promise<string|null>} login name or null if invalid access_token
 */
async function getUserFromToken(accessToken) {
  const res = await axios.get("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `bearer ${accessToken}`,
    },
  });

  return res.data && res.data.login ? res.data.login : null;
}

/**
 * Exchanges OAuth code for access token and returns userId + accessToken
 *
 * @param {string} code GitHub authentication code from OAuth process
 * @returns {Promise<{userId: string, accessToken: string}>} user_id and access_token of authenticated user
 */
async function githubAuthenticate(code) {
  if (
    !process.env.OAUTH_CLIENT_ID ||
    !process.env.OAUTH_CLIENT_SECRET ||
    !process.env.OAUTH_REDIRECT_URI
  ) {
    throw new Error(
      "OAuth Error: One or more required environment variables (OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REDIRECT_URI) are not set.",
    );
  }

  const start = Date.now();
  const params = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_CLIENT_SECRET,
    code,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    prompt: "select_account",
  });

  try {
    const res = await axios.post(
      "https://github.com/login/oauth/access_token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
    );

    const body = res.data;
    const accessToken = body && body.access_token ? body.access_token : null;

    if (!accessToken) {
      throw new Error("OAuth Error: access_token missing from response");
    }

    const userId = await getUserFromToken(accessToken);

    if (!userId) {
      throw new Error("OAuth Error: Invalid user_id/access_token");
    }

    console.log("GitHub Authentication", `${Date.now() - start} ms`);
    return { userId, accessToken };
  } catch (err) {
    if (err.response) {
      throw new Error(`OAuth Error: ${err.response.status}`);
    }
    throw err;
  }
}

/**
 * Authenticate using the OAuth code and update DB with associated user info.
 *
 * @param {string} code GitHub authentication code from OAuth process
 * @param {boolean} privateAccess whether private access was requested
 * @param {string} userKey user key to associate with the user
 * @returns {Promise<string>} user_id of authenticated user
 */
export async function authenticate(code, privateAccess, userKey) {
  const { userId, accessToken } = await githubAuthenticate(code);
  await storeUser(userId, accessToken, userKey, privateAccess);
  return userId;
}
