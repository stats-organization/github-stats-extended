import { logger } from "@stats-organization/github-readme-stats-core";

import { AccessTokenCipher, TokenDecryptionError } from "./tokenEncryption.js";

/** SQLSTATE `undefined_table`, see https://www.postgresql.org/docs/current/errcodes-appendix.html */
const UNDEFINED_TABLE = "42P01";

export let pool = null;
if (process.env.POSTGRES_URL) {
  const { Pool } = await import("pg");
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
  if (!process.env.TOKEN_ENCRYPTION_KEY) {
    logger.error(
      "TOKEN_ENCRYPTION_KEY is not set: GitHub access tokens are stored in plaintext. " +
        "Generate a key with `openssl rand -base64 32` and set it to encrypt them at rest.",
    );
  }
}

/** @type {AccessTokenCipher | null} */
let cipher = null;

/**
 * Parsed once, on first use, so a bad key only fails the token paths and not every endpoint.
 *
 * @returns {AccessTokenCipher} Cipher for `TOKEN_ENCRYPTION_KEY`
 */
function getCipher() {
  cipher ??= AccessTokenCipher.fromEnv();
  return cipher;
}

/**
 * Creates all required tables if they do not exist.
 */
async function createAllTables() {
  if (!pool) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS requests (
      request TEXT PRIMARY KEY,
      requested_at TIMESTAMP NOT NULL DEFAULT now(),
      user_requested_at TIMESTAMP NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS authenticated_users (
      user_id TEXT PRIMARY KEY,
      access_token TEXT NOT NULL,
      user_key TEXT,
      private_access BOOLEAN NOT NULL DEFAULT false
    );
  `);
}

/**
 * Stores or updates a request in the database.
 */
export async function storeRequest(req) {
  if (!pool) {
    return;
  }

  const isBypass = req.headers && req.headers["x-bypass-store"];
  const insertQuery = isBypass
    ? `
        INSERT INTO requests (request, requested_at)
        VALUES ($1, NOW())
        ON CONFLICT (request)
        DO UPDATE SET requested_at = EXCLUDED.requested_at
      `
    : `
        INSERT INTO requests (request, requested_at, user_requested_at)
        VALUES ($1, NOW(), NOW())
        ON CONFLICT (request)
        DO UPDATE SET requested_at = EXCLUDED.requested_at, user_requested_at = EXCLUDED.user_requested_at
      `;

  try {
    await pool.query(insertQuery, [req.url]);
  } catch (err) {
    if (err.code === UNDEFINED_TABLE) {
      await createAllTables();
      // Retry the insert after creating the table
      await pool.query(insertQuery, [req.url]);
    } else {
      throw err; // Re-throw if it's some other error
    }
  }
}

/**
 * Deletes all requests older than the specified time from the database.
 */
export async function deleteOldRequests(interval) {
  if (!pool) {
    return;
  }

  const deleteQuery = `
      DELETE FROM requests
      WHERE user_requested_at < NOW() - INTERVAL '${interval}'
    `;
  try {
    let result = await pool.query(deleteQuery);
    console.log(`Deleted ${result.rowCount} old requests.`);
  } catch (err) {
    if (err.code === UNDEFINED_TABLE) {
      console.log("Error deleting requests, table doesn't exist");
    } else {
      throw err;
    }
  }
}

/**
 * Fetches all requests which are between minInterval and maxInterval old.
 *
 * @returns {Promise<string[]>} Array of all requests between minInterval and maxInterval old.
 */
export async function getRecentRequests(minInterval, maxInterval) {
  if (!pool) {
    return [];
  }

  const query = `
      SELECT request
      FROM requests
      WHERE requested_at >= NOW() - INTERVAL '${maxInterval}'
        AND requested_at < NOW() - INTERVAL '${minInterval}'
      ORDER BY requested_at ASC
      `;
  let rows;
  try {
    ({ rows } = await pool.query(query));
  } catch (err) {
    if (err.code === UNDEFINED_TABLE) {
      console.log("Error fetching requests, table doesn't exist");
    } else {
      throw err;
    }
  }
  return rows.map((row) => row.request);
}

/**
 * Inserts or updates a user in the database.
 *
 * @param {string} userId GitHub userId (login name)
 * @param {string} accessToken GitHub access token
 * @param {string|null} userKey Optional user key
 * @param {boolean} privateAccess Whether private access was requested
 */
export async function storeUser(userId, accessToken, userKey, privateAccess) {
  if (!pool) {
    return;
  }

  const insertQuery = `
      INSERT INTO authenticated_users (user_id, access_token, user_key, private_access)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id)
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        user_key = EXCLUDED.user_key,
        private_access = EXCLUDED.private_access
  `;

  const values = [
    userId,
    getCipher().encrypt(accessToken, userId),
    userKey,
    privateAccess,
  ];

  try {
    await pool.query(insertQuery, values);
  } catch (err) {
    if (err.code === UNDEFINED_TABLE) {
      await createAllTables();
      await pool.query(insertQuery, values);
    } else {
      throw err;
    }
  }
}

/**
 * @param {{user_id: string, access_token: string}} row Database row
 * @returns {string | null} Plaintext token, or null if it cannot be decrypted (config errors propagate)
 */
function tryDecrypt(row) {
  try {
    return getCipher().decrypt(row.access_token, row.user_id);
  } catch (err) {
    if (!(err instanceof TokenDecryptionError)) {
      throw err;
    }
    logger.error(`${err.message} (user: ${row.user_id})`);
    return null;
  }
}

/**
 * @param {{user_id: string, access_token: string, private_access: boolean}} row Database row
 * @returns {{token: string | null, privateAccess: boolean}} token is null when it cannot be decrypted and the user has to log in again
 */
function toUserAccess(row) {
  return { token: tryDecrypt(row), privateAccess: row.private_access };
}

/**
 * Delete a user from the database.
 *
 * @param userKey user key of the user which is to be deleted.
 */
export async function deleteUser(userKey) {
  if (!pool) {
    return;
  }

  const deleteQuery = `
      DELETE FROM authenticated_users
      WHERE user_key = $1
    `;
  try {
    await pool.query(deleteQuery, [userKey]);
  } catch (err) {
    if (err.code === UNDEFINED_TABLE) {
      console.log("Error deleting user, table doesn't exist");
    } else {
      throw err;
    }
  }
}

/**
 * Fetches token and private access status for a given user_key.
 *
 * @param {string} userKey user key of the user to fetch information for
 * @returns {Promise<{token: string | null, privateAccess: boolean} | null>} null if user not found, token null if it must log in again
 */
export async function getUserAccessByKey(userKey) {
  if (!pool) {
    return null;
  }

  const query = `
      SELECT user_id, access_token, private_access
      FROM authenticated_users
      WHERE user_key = $1
      LIMIT 1
    `;
  try {
    const { rows } = await pool.query(query, [userKey]);
    if (rows.length === 0) {
      return null;
    }
    return toUserAccess(rows[0]);
  } catch (err) {
    if (err.code === UNDEFINED_TABLE) {
      return null;
    } else {
      throw err;
    }
  }
}

/**
 * Fetches token and private access status for a given username.
 *
 * @param {string} userName GitHub username of the user to fetch information for
 * @returns {Promise<{token: string | null, privateAccess: boolean} | null>} null if user not found, token null if it must log in again
 */
export async function getUserAccessByName(userName) {
  if (!pool) {
    return null;
  }

  const query = `
      SELECT user_id, access_token, private_access
      FROM authenticated_users
      WHERE user_id = $1
      LIMIT 1
    `;
  try {
    const { rows } = await pool.query(query, [userName]);
    if (rows.length === 0) {
      return null;
    }
    return toUserAccess(rows[0]);
  } catch (err) {
    if (err.code === UNDEFINED_TABLE) {
      return null;
    } else {
      throw err;
    }
  }
}

/**
 * Re-encrypts every stored token that is not yet encrypted with the first key.
 * Covers legacy plaintext rows and rows written with a rotated-out key.
 *
 * @returns {Promise<{encrypted: number, failed: Array<string>}>} Rewritten row count and users whose token could not be read
 */
export async function encryptStoredAccessTokens() {
  if (!pool) {
    throw new Error("POSTGRES_URL is not set");
  }
  const cipher = getCipher();
  if (!cipher.isEnabled) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY is not set, there is nothing to encrypt",
    );
  }

  let rows;
  try {
    ({ rows } = await pool.query(
      "SELECT user_id, access_token FROM authenticated_users",
    ));
  } catch (err) {
    if (err.code === UNDEFINED_TABLE) {
      return { encrypted: 0, failed: [] };
    }
    throw err;
  }

  let encrypted = 0;
  const failed = [];

  for (const row of rows) {
    if (cipher.isCurrent(row.access_token, row.user_id)) {
      continue;
    }
    const token = tryDecrypt(row);
    if (token === null) {
      failed.push(row.user_id);
      continue;
    }

    // compare-and-swap so a login since the SELECT is not overwritten
    const { rowCount } = await pool.query(
      "UPDATE authenticated_users SET access_token = $2 WHERE user_id = $1 AND access_token = $3",
      [row.user_id, cipher.encrypt(token, row.user_id), row.access_token],
    );
    encrypted += rowCount ?? 0;
  }

  return { encrypted, failed };
}
