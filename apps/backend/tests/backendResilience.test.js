import { describe, expect, it, vi } from "vitest";

import deleteUserHandler from "../api/delete-user.js";
import * as database from "../src/common/database.js";
import { normalizeRequestUrl } from "../src/repeatRequests.js";

describe("Backend Resilience & Error Handling", () => {
  describe("normalizeRequestUrl", () => {
    it("should correctly join clean host and path", () => {
      expect(normalizeRequestUrl("example.com", "/api/stats")).toBe(
        "https://example.com/api/stats",
      );
    });

    it("should strip duplicate protocol and trailing slash from baseUrl", () => {
      expect(
        normalizeRequestUrl("https://stats.vercel.app/", "/api/top-langs"),
      ).toBe("https://stats.vercel.app/api/top-langs");

      expect(
        normalizeRequestUrl("http://stats.vercel.app///", "api/top-langs"),
      ).toBe("https://stats.vercel.app/api/top-langs");
    });

    it("should handle empty or missing parameters cleanly", () => {
      expect(normalizeRequestUrl("example.com", "")).toBe(
        "https://example.com/",
      );
    });
  });

  describe("deleteUser error handling", () => {
    it("should terminate handler and not double-send on error", async () => {
      vi.spyOn(database, "deleteUser").mockRejectedValueOnce(
        new Error("Database connection lost"),
      );

      const req = { query: { user_key: "test-user-key" } };
      const res = {
        send: vi.fn(),
      };

      await deleteUserHandler(req, res);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith(
        "Something went wrong: Database connection lost",
      );
    });

    it("should send ok on success", async () => {
      vi.spyOn(database, "deleteUser").mockResolvedValueOnce(undefined);

      const req = { query: { user_key: "test-user-key" } };
      const res = {
        send: vi.fn(),
      };

      await deleteUserHandler(req, res);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith("ok");
    });
  });
});
