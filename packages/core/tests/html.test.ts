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

  it("should securely encode tags and quotes followed by hash to prevent XSS bypass", () => {
    expect(encodeHTML("<#script>alert(1)</#script>")).toBe(
      "&#60;#script&#62;alert(1)&#60;/#script&#62;",
    );
    expect(encodeHTML('"# onfocus="alert(1)')).toBe(
      "&#34;# onfocus=&#34;alert(1)",
    );
    expect(encodeHTML("'# onfocus='alert(1)")).toBe(
      "&#39;# onfocus=&#39;alert(1)",
    );
  });

  it("should preserve valid numeric character references without double escaping", () => {
    expect(encodeHTML("&#60;hello&#62; &#x3c;world&#x3e;")).toBe(
      "&#60;hello&#62; &#x3c;world&#x3e;",
    );
    expect(encodeHTML("&#notanumber;")).toBe("&#38;#notanumber;");
  });
});
