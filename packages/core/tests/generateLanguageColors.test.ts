import fs from "fs";

import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("generate-language-colors", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("extracts colored languages from Linguist YAML into formatted JSON", async () => {
    const get = vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: `Python:\n  color: "#3572A5"\nC++:\n  color: "#f34b7d"\nPlain Text:\n  extensions: [".txt"]\n`,
    });

    await import("../scripts/generate-language-colors.js");

    expect(get).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml",
    );
    expect(fs.writeFileSync).toHaveBeenCalledOnce();
    const call = vi.mocked(fs.writeFileSync).mock.calls[0];
    if (!call) {
      throw new Error("Expected generated language colors");
    }
    const [destination, contents] = call;
    if (typeof contents !== "string") {
      throw new Error("Expected JSON text");
    }
    expect(destination).toBe("./src/common/languageColors.json");
    expect(JSON.parse(contents)).toEqual({
      Python: "#3572A5",
      "C++": "#f34b7d",
    });
    expect(contents).toContain("\n");
  });

  it("rejects case-insensitive duplicate names without writing", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: 'Python:\n  color: "#3572A5"\npython:\n  color: "#000000"\n',
    });

    await expect(
      import("../scripts/generate-language-colors.js"),
    ).rejects.toThrow(
      'Case-insensitive duplicate language: "Python" vs "python"',
    );
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("keeps the previous output when the YAML is invalid", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({ data: "Python: [\n" });

    await expect(
      import("../scripts/generate-language-colors.js"),
    ).rejects.toThrow();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("keeps the previous output when the download fails", async () => {
    vi.spyOn(axios, "get").mockRejectedValueOnce(
      new Error("network unavailable"),
    );

    await expect(
      import("../scripts/generate-language-colors.js"),
    ).rejects.toThrow("network unavailable");
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
