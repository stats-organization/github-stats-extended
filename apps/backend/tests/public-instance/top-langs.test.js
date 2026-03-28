// @ts-check

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeSvg } from "../utils.js";

const mock = new MockAdapter(axios);

const data_langs = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: "repo-html",
            languages: {
              edges: [{ size: 180, node: { color: "#0f0", name: "HTML" } }],
            },
          },
          {
            name: "repo-javascript",
            languages: {
              edges: [
                { size: 120, node: { color: "#0ff", name: "JavaScript" } },
              ],
            },
          },
          {
            name: "repo-ts-1",
            languages: {
              edges: [
                { size: 45, node: { color: "#3178c6", name: "TypeScript" } },
              ],
            },
          },
          {
            name: "repo-ts-2",
            languages: {
              edges: [
                { size: 45, node: { color: "#3178c6", name: "TypeScript" } },
              ],
            },
          },
          {
            name: "repo-other-langs",
            languages: {
              edges: [
                { size: 20, node: { color: "#f00", name: "Java" } },
                { size: 10, node: { color: "#0f0", name: "Cobol" } },
                { size: 15, node: { color: "#00f", name: "Python" } },
              ],
            },
          },
          {
            name: "repo-hidden",
            languages: {
              edges: [{ size: 1000, node: { color: "#dea584", name: "Rust" } }],
            },
          },
        ],
      },
    },
  },
};

const createResponse = () => ({
  end: vi.fn(),
  setHeader: vi.fn(),
});

beforeEach(() => {
  vi.stubEnv("CACHE_SECONDS", "");
  vi.stubEnv("GIST_WHITELIST", "");
  vi.stubEnv("POSTGRES_URL", "");
  vi.stubEnv("WHITELIST", "");

  mock.onPost("https://api.github.com/graphql").reply(200, data_langs);
});

afterEach(() => {
  mock.reset();
  vi.unstubAllEnvs();
  // modules may cache environment variables, so we need to reset them
  vi.resetModules();
});

describe("Test /api/top-langs contract", () => {
  it("should match the public happy-path response snapshot", async () => {
    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

    const req = {
      headers: {},
      url: "/api/top-langs?username=anuraghazra",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public many-params response snapshot", async () => {
    mock.onPost("https://api.github.com/graphql").reply(200, data_langs);

    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

    const params = new URLSearchParams({
      username: "anuraghazra",
      hide: "javascript,HTML",
      hide_title: "true",
      hide_border: "true",
      card_width: "420",
      title_color: "123456",
      text_color: "abcdef",
      bg_color: "0f172a",
      layout: "compact",
      langs_count: "3",
      exclude_repo: "repo-hidden",
      size_weight: "0.5",
      count_weight: "1",
      role: "OWNER,COLLABORATOR",
      disable_animations: "true",
      stats_format: "bytes",
    });

    const req = {
      headers: {},
      url: `/api/top-langs?${params.toString()}`,
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      graphqlRequest: mock.history.post[0].data,
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public missing-username response snapshot", async () => {
    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

    const req = {
      headers: {},
      url: "/api/top-langs",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should render error card in same theme as requested card", async () => {
    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

    const req = {
      headers: {},
      url: "/api/top-langs?theme=merko",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public blacklisted-username response snapshot", async () => {
    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

    const req = {
      headers: {},
      url: "/api/top-langs?username=renovate-bot",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the private non-whitelisted username response snapshot", async () => {
    vi.stubEnv("WHITELIST", "anuraghazra");

    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

    const req = {
      headers: {},
      url: "/api/top-langs?username=martin-mfg",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the private missing-username response snapshot", async () => {
    vi.stubEnv("WHITELIST", "anuraghazra");

    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

    const req = {
      headers: {},
      url: "/api/top-langs",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });
});
