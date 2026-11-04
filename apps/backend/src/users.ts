import axios from "axios";

import { storeUser } from "./common/database.js";

interface GitHubUserResponse {
  login?: string;
}

interface GitHubAccessTokenResponse {
  access_token?: string;
  scope?: string;
}

/**
 * Given an access token, return the GitHub login (userId) or null if invalid
 *
 * @param accessToken GitHub access token
 * @returns login name or null if invalid access_token
 */
async function getUserFromToken(accessToken: string): Promise<string | null> {
  const res = await axios.get<GitHubUserResponse>(
    "https://api.github.com/user",
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `bearer ${accessToken}`,
      },
    },
  );

  return res.data.login || null;
}

/**
 * Exchanges OAuth code for access token and returns userId + accessToken
 *
 * @param code GitHub authentication code from OAuth process
 * @param privateAccess whether private access was requested
 * @returns user_id and access_token of authenticated user, and whether downgrade is needed
 */
async function githubAuthenticate(
  code: string,
  privateAccess: boolean,
): Promise<{ userId: string; accessToken: string; needDowngrade: boolean }> {
  const {
    OAUTH_CLIENT_ID: clientId,
    OAUTH_CLIENT_SECRET: clientSecret,
    OAUTH_REDIRECT_URI: redirectUri,
  } = process.env;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "OAuth Error: One or more required environment variables (OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REDIRECT_URI) are not set.",
    );
  }

  const start = Date.now();
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  try {
    const res = await axios.post<GitHubAccessTokenResponse>(
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
    const accessToken = body.access_token || null;

    if (!accessToken) {
      throw new Error(
        "OAuth Error: access_token missing from response: " +
          JSON.stringify(body),
      );
    }

    const userId = await getUserFromToken(accessToken);

    if (!userId) {
      throw new Error("OAuth Error: Invalid user_id/access_token");
    }

    // if user previously granted private access, then logged in via public flow
    const needDowngrade = !!body.scope && !privateAccess;

    console.log("GitHub Authentication", `${Date.now() - start} ms`);
    return { userId, accessToken, needDowngrade };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      // eslint-disable-next-line preserve-caught-error
      throw new Error(`OAuth Error: ${err.response.status}`);
    }
    throw err;
  }
}

/**
 * Authenticate using the OAuth code and update DB with associated user info.
 *
 * @param code GitHub authentication code from OAuth process
 * @param privateAccess whether private access was requested
 * @param userKey user key to associate with the user
 * @returns user_id of authenticated user and whether downgrade is needed
 */
export async function authenticate(
  code: string,
  privateAccess: boolean,
  userKey: string,
): Promise<{ userId: string; needDowngrade: boolean }> {
  const { userId, accessToken, needDowngrade } = await githubAuthenticate(
    code,
    privateAccess,
  );
  await storeUser(userId, accessToken, userKey, needDowngrade || privateAccess);
  return { userId, needDowngrade };
}
