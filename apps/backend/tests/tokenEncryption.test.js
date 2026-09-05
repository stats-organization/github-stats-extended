/**
 * @file Tests for `AccessTokenCipher`.
 */

import { randomBytes } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AccessTokenCipher,
  TokenDecryptionError,
} from "../src/common/tokenEncryption.js";

const KEY = randomBytes(32);
const OTHER_KEY = randomBytes(32);
const cipher = new AccessTokenCipher([KEY]);
const USER = "anuraghazra";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Test AccessTokenCipher", () => {
  it("should round-trip a token", () => {
    const encrypted = cipher.encrypt("gho_secret", USER);

    expect(encrypted).not.toContain("gho_secret");
    expect(encrypted).toMatch(/^gse\.v1\./);
    expect(AccessTokenCipher.isEncryptedValue(encrypted)).toBe(true);
    expect(cipher.decrypt(encrypted, USER)).toBe("gho_secret");
  });

  it("should round-trip an empty token", () => {
    expect(cipher.decrypt(cipher.encrypt("", USER), USER)).toBe("");
  });

  it("should produce a different ciphertext for every call", () => {
    expect(cipher.encrypt("gho_secret", USER)).not.toBe(
      cipher.encrypt("gho_secret", USER),
    );
  });

  it("should pass legacy plaintext values through", () => {
    expect(AccessTokenCipher.isEncryptedValue("gho_secret")).toBe(false);
    expect(cipher.decrypt("gho_secret", USER)).toBe("gho_secret");
    expect(cipher.isCurrent("gho_secret", USER)).toBe(false);
  });

  it("should store plaintext when no key is configured", () => {
    const disabled = new AccessTokenCipher([]);

    expect(disabled.isEnabled).toBe(false);
    expect(disabled.encrypt("gho_secret", USER)).toBe("gho_secret");
  });

  it("should decrypt with a rotated-out key and report it as not current", () => {
    const encrypted = new AccessTokenCipher([OTHER_KEY]).encrypt(
      "gho_secret",
      USER,
    );
    const rotated = new AccessTokenCipher([KEY, OTHER_KEY]);

    expect(rotated.decrypt(encrypted, USER)).toBe("gho_secret");
    expect(rotated.isCurrent(encrypted, USER)).toBe(false);
    expect(rotated.isCurrent(rotated.encrypt("gho_secret", USER), USER)).toBe(
      true,
    );
    expect(() => cipher.decrypt(encrypted, USER)).toThrow(TokenDecryptionError);
  });

  it("should throw when the key is missing for an encrypted token", () => {
    const encrypted = cipher.encrypt("gho_secret", USER);
    let error;
    try {
      new AccessTokenCipher([]).decrypt(encrypted, USER);
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeInstanceOf(TokenDecryptionError);
    expect(error.message).toMatch(/TOKEN_ENCRYPTION_KEY is not set/);
  });

  it("should reject a ciphertext moved to another user", () => {
    const encrypted = cipher.encrypt("gho_secret", USER);

    expect(() => cipher.decrypt(encrypted, "rickstaa")).toThrow(
      TokenDecryptionError,
    );
  });

  it("should throw when the ciphertext was tampered with", () => {
    const parts = cipher.encrypt("gho_secret", USER).split(".");
    const tampered = Buffer.from(parts[4], "base64");
    tampered[0] ^= 0xff;
    parts[4] = tampered.toString("base64");

    expect(() => cipher.decrypt(parts.join("."), USER)).toThrow(
      /no key in TOKEN_ENCRYPTION_KEY matches/,
    );
  });

  it("should throw on a malformed encrypted value", () => {
    expect(() => cipher.decrypt("gse.v1.only-one-part", USER)).toThrow(
      /Malformed encrypted access token/,
    );
    expect(() => cipher.decrypt("gse.v1.a.b.c.d", USER)).toThrow(
      /Malformed encrypted access token/,
    );
  });

  describe("fromEnv", () => {
    it("should accept base64 and hex keys", () => {
      vi.stubEnv("TOKEN_ENCRYPTION_KEY", KEY.toString("base64"));
      const fromBase64 = AccessTokenCipher.fromEnv();
      vi.stubEnv("TOKEN_ENCRYPTION_KEY", KEY.toString("hex"));
      const fromHex = AccessTokenCipher.fromEnv();

      expect(
        fromHex.decrypt(fromBase64.encrypt("gho_secret", USER), USER),
      ).toBe("gho_secret");
    });

    it("should read a comma-separated key list, ignoring whitespace", () => {
      vi.stubEnv(
        "TOKEN_ENCRYPTION_KEY",
        ` ${KEY.toString("base64")} ,${OTHER_KEY.toString("base64")}\n`,
      );
      const encrypted = new AccessTokenCipher([OTHER_KEY]).encrypt(
        "gho_secret",
        USER,
      );

      expect(AccessTokenCipher.fromEnv().decrypt(encrypted, USER)).toBe(
        "gho_secret",
      );
    });

    it("should be disabled without a key", () => {
      vi.stubEnv("TOKEN_ENCRYPTION_KEY", "");

      expect(AccessTokenCipher.fromEnv().isEnabled).toBe(false);
    });

    it("should reject a key of the wrong size", () => {
      vi.stubEnv("TOKEN_ENCRYPTION_KEY", randomBytes(16).toString("base64"));

      expect(() => AccessTokenCipher.fromEnv()).toThrow(
        /Invalid TOKEN_ENCRYPTION_KEY/,
      );
    });
  });
});
