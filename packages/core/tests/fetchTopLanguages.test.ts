import nock from "nock";
import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchTopLanguages } from "../src/fetchers/top-languages.js";

import { approxNumber } from "./utils.js";

vi.mock(import("../src/common/log.js"), async () => {
  const { createLoggerMock } = await import("./utils.js");
  return createLoggerMock();
});

const { logger } = await import("../src/index.js");

const loggerErrorSpy = vi.mocked(logger.error);

afterEach(() => {
  loggerErrorSpy.mockClear();
});

const data_langs = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: "test-repo-1",
            languages: {
              edges: [{ size: 100, node: { color: "#0f0", name: "HTML" } }],
            },
          },
          {
            name: "test-repo-2",
            languages: {
              edges: [
                { size: 100, node: { color: "#0ff", name: "javascript" } },
              ],
            },
          },
          {
            name: "test-repo-3",
            languages: {
              edges: [{ size: 100, node: { color: "#0f0", name: "HTML" } }],
            },
          },
          {
            name: "test-repo-4",
            languages: {
              edges: [
                { size: 100, node: { color: "#0ff", name: "javascript" } },
              ],
            },
          },
        ],
      },
    },
  },
};

const error = {
  errors: [
    {
      type: "NOT_FOUND",
      path: ["user"],
      locations: [],
      message: "Could not resolve to a User with the login of 'noname'.",
    },
  ],
};

describe("FetchTopLanguages", () => {
  it("should fetch correct language data while using the new calculation", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, data_langs);

    const repo = await fetchTopLanguages("anuraghazra", [], 0.5, 0.5);
    expect(repo).toStrictEqual({
      HTML: {
        color: "#0f0",
        count: 2,
        name: "HTML",
        size: approxNumber(20.0),
      },
      javascript: {
        color: "#0ff",
        count: 2,
        name: "javascript",
        size: approxNumber(20.0),
      },
    });
  });

  it("should fetch correct language data while excluding the 'test-repo-1' repository", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, data_langs);

    const repo = await fetchTopLanguages("anuraghazra", ["test-repo-1"]);
    expect(repo).toStrictEqual({
      HTML: {
        color: "#0f0",
        count: 1,
        name: "HTML",
        size: 100,
      },
      javascript: {
        color: "#0ff",
        count: 2,
        name: "javascript",
        size: 200,
      },
    });
  });

  it("should fetch correct language data while using the old calculation", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, data_langs);

    const repo = await fetchTopLanguages("anuraghazra", [], 1, 0);
    expect(repo).toStrictEqual({
      HTML: {
        color: "#0f0",
        count: 2,
        name: "HTML",
        size: 200,
      },
      javascript: {
        color: "#0ff",
        count: 2,
        name: "javascript",
        size: 200,
      },
    });
  });

  it("should rank languages by the number of repositories they appear in", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, data_langs);

    const repo = await fetchTopLanguages("anuraghazra", [], 0, 1);
    expect(repo).toStrictEqual({
      HTML: {
        color: "#0f0",
        count: 2,
        name: "HTML",
        size: 2,
      },
      javascript: {
        color: "#0ff",
        count: 2,
        name: "javascript",
        size: 2,
      },
    });
  });

  it("should throw specific error when user not found", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, error);

    await expect(fetchTopLanguages("anuraghazra")).rejects.toThrow(
      "Could not resolve to a User with the login of 'noname'.",
    );

    expect(loggerErrorSpy).toHaveBeenCalledOnce();
  });

  it("should throw other errors with their message", async () => {
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, {
        errors: [{ message: "Some test GraphQL error" }],
      });

    await expect(fetchTopLanguages("anuraghazra")).rejects.toThrow(
      "Some test GraphQL error",
    );

    expect(loggerErrorSpy).toHaveBeenCalledOnce();
  });

  it("should throw error with specific message when error does not contain message property", async () => {
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, {
        errors: [{ type: "TEST" }],
      });

    await expect(fetchTopLanguages("anuraghazra")).rejects.toThrow(
      "Something went wrong while trying to retrieve the language data using the GraphQL API.",
    );

    expect(loggerErrorSpy).toHaveBeenCalledOnce();
  });

  it("should paginate through multiple pages and accumulate languages without loss", async () => {
    const page1 = {
      data: {
        user: {
          repositories: {
            nodes: [
              {
                name: "repo-page-1",
                nameWithOwner: "anuraghazra/repo-page-1",
                languages: {
                  edges: [
                    {
                      size: 300,
                      node: { color: "#3178c6", name: "TypeScript" },
                    },
                    {
                      size: 100,
                      node: { color: "#f1e05a", name: "JavaScript" },
                    },
                  ],
                },
              },
            ],
            pageInfo: {
              hasNextPage: true,
              endCursor: "cursor_page_1",
            },
          },
        },
      },
    };

    const page2 = {
      data: {
        user: {
          repositories: {
            nodes: [
              {
                name: "repo-page-2",
                nameWithOwner: "anuraghazra/repo-page-2",
                languages: {
                  edges: [
                    { size: 250, node: { color: "#A97BFF", name: "Kotlin" } },
                    {
                      size: 100,
                      node: { color: "#3178c6", name: "TypeScript" },
                    },
                  ],
                },
              },
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: "cursor_page_2",
            },
          },
        },
      },
    };

    nock("https://api.github.com").post("/graphql").reply(200, page1);
    nock("https://api.github.com").post("/graphql").reply(200, page2);

    const result = await fetchTopLanguages("anuraghazra");

    expect(result).toStrictEqual({
      TypeScript: {
        color: "#3178c6",
        count: 2,
        name: "TypeScript",
        size: 400,
      },
      Kotlin: {
        color: "#A97BFF",
        count: 1,
        name: "Kotlin",
        size: 250,
      },
      JavaScript: {
        color: "#f1e05a",
        count: 1,
        name: "JavaScript",
        size: 100,
      },
    });
  });

  it("should exclude repository by namespaced nameWithOwner", async () => {
    const multiRepoData = {
      data: {
        user: {
          repositories: {
            nodes: [
              {
                name: "shared-repo",
                nameWithOwner: "orgA/shared-repo",
                languages: {
                  edges: [{ size: 300, node: { color: "#00f", name: "C++" } }],
                },
              },
              {
                name: "shared-repo",
                nameWithOwner: "orgB/shared-repo",
                languages: {
                  edges: [{ size: 200, node: { color: "#f00", name: "Rust" } }],
                },
              },
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      },
    };

    nock("https://api.github.com").post("/graphql").reply(200, multiRepoData);

    const result = await fetchTopLanguages("anuraghazra", ["orgA/shared-repo"]);
    expect(result).toStrictEqual({
      Rust: {
        color: "#f00",
        count: 1,
        name: "Rust",
        size: 200,
      },
    });
  });
});
