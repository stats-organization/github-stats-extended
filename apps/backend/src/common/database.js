import { Pool } from "pg";

export const pool = process.env.POSTGRES_URL
  ? new Pool({
      connectionString: process.env.POSTGRES_URL,
    })
  : null;

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
    // Check for undefined_table error (SQLSTATE 42P01)
    if (err.code === "42P01") {
      await createAllTables();
      // Retry the insert after creating the table
      await pool.query(insertQuery, [req.url]);
    } else {
      throw err; // Re-throw if it's some other error
    }
  }
}

/**
 * Deletes all requests older than 8 days from the database.
 */
export async function deleteOldRequests() {
  if (!pool) {
    return;
  }

  const deleteQuery = `
      DELETE FROM requests
      WHERE user_requested_at < NOW() - INTERVAL '8 days'
    `;
  try {
    let result = await pool.query(deleteQuery);
    console.log(`Deleted ${result.rowCount} old requests.`);
  } catch (err) {
    if (err.code === "42P01") {
      console.log("Error deleting requests, table doesn't exist");
    } else {
      throw err;
    }
  }
}

/**
 * Fetches all requests which are between 11 hours and 8 days old.
 *
 * @returns {Promise<string[]>} Array of all requests between 11 hours and 8 days old.
 */
export async function getRecentRequests() {
  if (!pool) {
    return [];
  }

  const query = `
      SELECT request
      FROM requests
      WHERE requested_at >= NOW() - INTERVAL '8 days'
        AND requested_at < NOW() - INTERVAL '11 hours'
      ORDER BY requested_at ASC
      `;
  let rows;
  try {
    ({ rows } = await pool.query(query));
  } catch (err) {
    if (err.code === "42P01") {
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

  try {
    await pool.query(insertQuery, [
      userId,
      accessToken,
      userKey,
      privateAccess,
    ]);
  } catch (err) {
    if (err.code === "42P01") {
      await createAllTables();
      await pool.query(insertQuery, [
        userId,
        accessToken,
        userKey,
        privateAccess,
      ]);
    } else {
      throw err;
    }
  }
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
    if (err.code === "42P01") {
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
 * @returns {Promise<{token: string, privateAccess: boolean} | null>} token and private access status, or null if user not found
 */
export async function getUserAccessByKey(userKey) {
  if (!pool) {
    return null;
  }

  const query = `
      SELECT access_token, private_access
      FROM authenticated_users
      WHERE user_key = $1
      LIMIT 1
    `;
  try {
    const { rows } = await pool.query(query, [userKey]);
    if (rows.length === 0) {
      return null;
    }
    return {
      token: rows[0].access_token,
      privateAccess: rows[0].private_access,
    };
  } catch (err) {
    if (err.code === "42P01") {
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
 * @returns {Promise<{token: string, privateAccess: boolean} | null>} token and private access status, or null if user not found
 */
export async function getUserAccessByName(userName) {
  if (!pool) {
    return null;
  }

  const query = `
      SELECT access_token, private_access
      FROM authenticated_users
      WHERE user_id = $1
      LIMIT 1
    `;
  try {
    const { rows } = await pool.query(query, [userName]);
    if (rows.length === 0) {
      return null;
    }
    return {
      token: rows[0].access_token,
      privateAccess: rows[0].private_access,
    };
  } catch (err) {
    if (err.code === "42P01") {
      return null;
    } else {
      throw err;
    }
  }
}
