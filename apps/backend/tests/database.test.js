/**
 * @file Tests for access token storage in `authenticated_users`.
 */

import { randomBytes } from "node:crypto";

import { logger } from "@stats-organization/github-readme-stats-core";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { AccessTokenCipher } from "../src/common/tokenEncryption.js";

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock(import("pg"), () => {
  class Pool {
    query = queryMock;
  }

  return { default: { Pool }, Pool };
});

const KEY = randomBytes(32);
const OLD_KEY = randomBytes(32);
const cipher = new AccessTokenCipher([KEY]);

let storeUser,
  getUserAccessByName,
  getUserAccessByKey,
  encryptStoredAccessTokens;

beforeAll(async () => {
  vi.stubEnv("POSTGRES_URL", "postgres://user:password@localhost:5432/test");
  vi.stubEnv("TOKEN_ENCRYPTION_KEY", KEY.toString("base64"));

  ({
    storeUser,
    getUserAccessByName,
    getUserAccessByKey,
    encryptStoredAccessTokens,
  } = await import("../src/common/database.js"));
});

beforeEach(() => {
  queryMock.mockReset().mockResolvedValue({ rows: [], rowCount: 0 });
});

afterAll(() => {
  vi.unstubAllEnvs();
});

const row = (user_id, access_token, private_access = true) => ({
  user_id,
  access_token,
  private_access,
});

describe("Test database access token storage", () => {
  it("should never send the plaintext token to Postgres", async () => {
    await storeUser("anuraghazra", "gho_secret", "user-key", true);

    const [, values] = queryMock.mock.calls[0];
    expect(values).toEqual([
      "anuraghazra",
      expect.stringMatching(/^gse\.v1\./),
      "user-key",
      true,
    ]);
    expect(JSON.stringify(values)).not.toContain("gho_secret");
  });

  it("should decrypt the token when reading it back", async () => {
    await storeUser("anuraghazra", "gho_secret", "user-key", true);
    const [, [, storedToken]] = queryMock.mock.calls[0];
    queryMock.mockResolvedValue({ rows: [row("anuraghazra", storedToken)] });

    await expect(getUserAccessByName("anuraghazra")).resolves.toEqual({
      token: "gho_secret",
      privateAccess: true,
    });
    await expect(getUserAccessByKey("user-key")).resolves.toEqual({
      token: "gho_secret",
      privateAccess: true,
    });
  });

  it("should read back a token stored before encryption was enabled", async () => {
    queryMock.mockResolvedValue({
      rows: [row("anuraghazra", "gho_legacy", false)],
    });

    await expect(getUserAccessByName("anuraghazra")).resolves.toEqual({
      token: "gho_legacy",
      privateAccess: false,
    });
  });

  it("should return a null token when it cannot be decrypted", async () => {
    const error = vi.spyOn(logger, "error").mockImplementation(() => {});
    queryMock.mockResolvedValue({
      rows: [row("anuraghazra", "gse.v1.aaa.bbb.ccc")],
    });

    await expect(getUserAccessByName("anuraghazra")).resolves.toEqual({
      token: null,
      privateAccess: true,
    });
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("(user: anuraghazra)"),
    );
    expect(JSON.stringify(error.mock.calls)).not.toContain("gse.v1.aaa");
    error.mockRestore();
  });

  it("should re-encrypt only the tokens not yet on the current key", async () => {
    vi.spyOn(logger, "error").mockImplementation(() => {});
    const current = cipher.encrypt("gho_current", "rickstaa");
    const old = new AccessTokenCipher([OLD_KEY]).encrypt("gho_old", "qwerty");
    queryMock
      .mockResolvedValueOnce({
        rows: [
          row("anuraghazra", "gho_legacy"),
          row("rickstaa", current),
          row("qwerty", old),
        ],
      })
      .mockResolvedValue({ rows: [], rowCount: 1 });

    await expect(encryptStoredAccessTokens()).resolves.toEqual({
      encrypted: 1,
      failed: ["qwerty"],
    });

    expect(queryMock).toHaveBeenCalledTimes(2);
    const [sql, values] = queryMock.mock.calls[1];
    // compare-and-swap on the value that was read
    expect(sql).toMatch(/AND access_token = \$3/);
    expect(values[0]).toBe("anuraghazra");
    expect(cipher.decrypt(values[1], "anuraghazra")).toBe("gho_legacy");
    expect(values[2]).toBe("gho_legacy");
    vi.restoreAllMocks();
  });

  it("should not count a token that was rewritten by a login in the meantime", async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [row("anuraghazra", "gho_legacy")] })
      .mockResolvedValue({ rows: [], rowCount: 0 });

    await expect(encryptStoredAccessTokens()).resolves.toEqual({
      encrypted: 0,
      failed: [],
    });
  });

  it("should report nothing to encrypt when the table does not exist", async () => {
    queryMock.mockRejectedValue(Object.assign(new Error(), { code: "42P01" }));

    await expect(encryptStoredAccessTokens()).resolves.toEqual({
      encrypted: 0,
      failed: [],
    });
  });
});
