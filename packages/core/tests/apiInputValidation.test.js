import { describe, expect, it } from "vitest";

import gistApi from "../src/api/gist.js";
import statsApi from "../src/api/index.js";
import pinApi from "../src/api/pin.js";
import topLangsApi from "../src/api/top-langs.js";
import wakatimeApi from "../src/api/wakatime.js";

// Values containing characters outside the safe set /^[-\w/.,]+$/. These must be
// rejected before any network request is made.
const unsafeValues = ["user name", "user@evil.com", "a<b", "a?b", "a:b", "a&b"];

describe("API input validation", () => {
  describe.each([
    ["top-langs", "username", topLangsApi],
    ["wakatime", "username", wakatimeApi],
    ["gist", "id", gistApi],
    ["stats", "username", statsApi],
    ["stats", "repo", statsApi],
    ["stats", "owner", statsApi],
    ["pin", "username", pinApi],
    ["pin", "repo", pinApi],
  ])("%s: %s", (_endpoint, param, api) => {
    it.each(unsafeValues)(`rejects unsafe ${param} %j`, async (value) => {
      const result = await api({ [param]: value });
      expect(result.status).toBe("error - permanent");
      expect(result.content).toContain("unsafe characters");
    });
  });
});
