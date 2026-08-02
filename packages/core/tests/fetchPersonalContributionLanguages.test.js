import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  detectLanguage,
  fetchPersonalContributionLanguages,
  normalizeLimit,
  normalizePages,
  shouldIgnoreFile,
} from "../src/fetchers/personal-contribution-languages.js";

vi.mock(import("../src/common/log.js"), async () => {
  const { createLoggerMock } = await import("./utils.js");
  return createLoggerMock();
});

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
});

describe("FetchPersonalContributionLanguages", () => {
  it("should detect languages from common contribution file paths", () => {
    expect(detectLanguage("src/index.ts")).toBe("TypeScript");
    expect(detectLanguage("Dockerfile")).toBe("Dockerfile");
    expect(detectLanguage("unknown/file.ext")).toBe(null);
  });

  it("should ignore generated and binary files", () => {
    expect(shouldIgnoreFile("dist/app.js")).toBe(true);
    expect(shouldIgnoreFile("src/logo.png")).toBe(true);
    expect(shouldIgnoreFile("src/app.ts")).toBe(false);
  });

  it("should clamp page count", () => {
    expect(normalizePages("0")).toBe(2);
    expect(normalizePages("50")).toBe(10);
    expect(normalizePages("3")).toBe(3);
  });

  it("should clamp commit limit", () => {
    expect(normalizeLimit("0")).toBe(40);
    expect(normalizeLimit("500")).toBe(200);
    expect(normalizeLimit("30")).toBe(30);
  });

  it("should fetch and aggregate additions from authored commits", async () => {
    mock.onGet("https://api.github.com/search/commits").reply((config) => {
      expect(config.params.q).toBe("author:andre org:acme");
      expect(config.params.page).toBe(1);

      return [
        200,
        {
          items: [
            {
              sha: "abc123",
              repository: { full_name: "acme/app" },
            },
            {
              sha: "def456",
              repository: { full_name: "acme/api" },
            },
          ],
        },
      ];
    });

    mock
      .onGet("https://api.github.com/repos/acme/app/commits/abc123")
      .reply(200, {
        files: [
          { filename: "src/App.tsx", additions: 12 },
          { filename: "dist/App.js", additions: 200 },
          { filename: "README.md", additions: 4 },
        ],
      });

    mock
      .onGet("https://api.github.com/repos/acme/api/commits/def456")
      .reply(200, {
        files: [
          { filename: "server.js", additions: 5 },
          { filename: "package-lock.json", additions: 50 },
        ],
      });

    const languages = await fetchPersonalContributionLanguages(
      "andre",
      ["acme"],
      1,
      40,
    );

    expect(languages).toStrictEqual({
      TypeScript: {
        color: expect.any(String),
        count: 1,
        name: "TypeScript",
        size: 12,
      },
      JavaScript: {
        color: expect.any(String),
        count: 1,
        name: "JavaScript",
        size: 5,
      },
      Markdown: {
        color: expect.any(String),
        count: 1,
        name: "Markdown",
        size: 4,
      },
    });
  });
});
