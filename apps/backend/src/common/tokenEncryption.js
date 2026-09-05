import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;
const HEX_KEY = /^[0-9a-fA-F]{64}$/;

/** Marks a value as encrypted and versions the format. */
const PREFIX = "gse.v1.";

/** The stored token is unreadable, the user has to log in again. Any other error is a config problem. */
export class TokenDecryptionError extends Error {
  name = "TokenDecryptionError";
}

/**
 * @returns {Array<Buffer>} Keys from the comma-separated `TOKEN_ENCRYPTION_KEY`, each 32 bytes of base64 or hex
 */
function readEncryptionKeysFromEnv() {
  return (process.env.TOKEN_ENCRYPTION_KEY ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      const key = Buffer.from(value, HEX_KEY.test(value) ? "hex" : "base64");
      if (key.length !== KEY_BYTES) {
        throw new Error(
          `Invalid TOKEN_ENCRYPTION_KEY: expected ${KEY_BYTES} bytes (base64 or hex), got ${key.length}`,
        );
      }
      return key;
    });
}

/**
 * AES-256-GCM cipher for stored GitHub access tokens.
 * The first key encrypts, every key decrypts (rotation); with no key it is a pass-through.
 */
export class AccessTokenCipher {
  /** @type {Array<Buffer>} */
  #keys;

  /**
   * @param {Array<Buffer>} keys First key encrypts, all decrypt; empty disables encryption
   */
  constructor(keys) {
    this.#keys = keys;
  }

  /**
   * @returns {AccessTokenCipher} Cipher for `TOKEN_ENCRYPTION_KEY`, throws on an invalid key
   */
  static fromEnv() {
    return new AccessTokenCipher(readEncryptionKeysFromEnv());
  }

  /**
   * @param {string} value Value read from the database
   * @returns {boolean} false for a legacy plaintext token
   */
  static isEncryptedValue(value) {
    return value.startsWith(PREFIX);
  }

  /**
   * @returns {boolean} true when at least one key is configured
   */
  get isEnabled() {
    return this.#keys.length > 0;
  }

  /**
   * @param {string} token Plaintext GitHub access token
   * @param {string} userId Bound to the ciphertext so it cannot be moved to another row
   * @returns {string} Encrypted token, or plaintext if encryption is disabled
   */
  encrypt(token, userId) {
    const [key] = this.#keys;
    if (!key) {
      return token;
    }

    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, key, iv).setAAD(
      Buffer.from(userId),
    );
    const ciphertext = Buffer.concat([cipher.update(token), cipher.final()]);
    const parts = [iv, cipher.getAuthTag(), ciphertext].map((part) =>
      part.toString("base64"),
    );
    return PREFIX + parts.join(".");
  }

  /**
   * @param {string} value `access_token` column; legacy plaintext passes through
   * @param {string} userId Owner of the row
   * @returns {string} Plaintext GitHub access token
   * @throws {TokenDecryptionError} malformed value or no key matches
   * @throws {Error} encrypted value but no key configured
   */
  decrypt(value, userId) {
    if (!AccessTokenCipher.isEncryptedValue(value)) {
      return value;
    }
    if (!this.isEnabled) {
      throw new Error(
        "The stored access token is encrypted but TOKEN_ENCRYPTION_KEY is not set",
      );
    }
    const token = this.#decryptWith(this.#keys, value, userId);
    if (token === null) {
      throw new TokenDecryptionError(
        "Failed to decrypt the stored access token: no key in TOKEN_ENCRYPTION_KEY matches",
      );
    }
    return token;
  }

  /**
   * @param {string} value `access_token` column
   * @param {string} userId Owner of the row
   * @returns {boolean} true if the value is already encrypted with the first key
   */
  isCurrent(value, userId) {
    return (
      AccessTokenCipher.isEncryptedValue(value) &&
      this.#decryptWith(this.#keys.slice(0, 1), value, userId) !== null
    );
  }

  /**
   * @param {Array<Buffer>} keys Keys to try in order
   * @param {string} value Encrypted value
   * @param {string} userId Owner of the row
   * @returns {string | null} Plaintext, or null if no key authenticates the value
   */
  #decryptWith(keys, value, userId) {
    const parts = value.slice(PREFIX.length).split(".");
    if (parts.length !== 3) {
      throw new TokenDecryptionError("Malformed encrypted access token");
    }
    const [iv, authTag, ciphertext] = parts.map((part) =>
      Buffer.from(part, "base64"),
    );
    const aad = Buffer.from(userId);

    for (const key of keys) {
      try {
        const decipher = createDecipheriv(ALGORITHM, key, iv)
          .setAAD(aad)
          .setAuthTag(authTag);
        return Buffer.concat([
          decipher.update(ciphertext),
          decipher.final(),
        ]).toString();
      } catch {
        // wrong key, try the next one
      }
    }
    return null;
  }
}
