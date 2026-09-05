/**
 * @file Re-encrypts every stored access token with the current `TOKEN_ENCRYPTION_KEY`.
 */

import { encryptStoredAccessTokens, pool } from "../src/common/database.js";

try {
  const { encrypted, failed } = await encryptStoredAccessTokens();
  console.log(`Encrypted ${encrypted} access token(s).`);
  if (failed.length > 0) {
    console.error(
      `Could not decrypt the token of: ${failed.join(", ")}. ` +
        "Add the key they were encrypted with to TOKEN_ENCRYPTION_KEY, or let those users log in again.",
    );
    process.exitCode = 1;
  }
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await pool?.end();
}
