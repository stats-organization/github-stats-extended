import { describe, expect, it } from "vitest";

import { encodeHTML } from "../src/common/html.js";

describe("Test html.js", () => {
  it("should encode HTML entities", () => {
    expect(encodeHTML(`<html>"'\`\\hello world<,.#4^&^@%!🛜©))`)).toBe(
      "&#60;html&#62;&#34;&#39;`\\hello world&#60;,.#4^&#38;^@%!🛜&#169;))",
    );
  });

  it("should handle empty strings", () => {
    expect(encodeHTML("")).toBe("");
  });
});
