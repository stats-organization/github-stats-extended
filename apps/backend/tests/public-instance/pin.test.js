// @ts-check

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeSvg } from "../utils.js";

const mock = new MockAdapter(axios);

const data_user = {
  data: {
    user: {
      repository: {
        username: "anuraghazra",
        name: "convoychat",
        stargazers: {
          totalCount: 38000,
        },
        description:
          "Help us take over the world! React + TS + GraphQL Chat App",
        primaryLanguage: {
          color: "#2b7489",
          id: "MDg6TGFuZ3VhZ2UyODc=",
          name: "TypeScript",
        },
        forkCount: 100,
        isTemplate: false,
      },
    },
    organization: null,
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

  mock.onPost("https://api.github.com/graphql").reply(200, data_user);
});

afterEach(() => {
  mock.reset();
  vi.unstubAllEnvs();
  // modules may cache environment variables, so we need to reset them
  vi.resetModules();
});

describe("Test /api/pin contract", () => {
  it("should match the public happy-path response snapshot", async () => {
    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

    const req = {
      headers: {},
      url: "/api/pin?username=anuraghazra&repo=convoychat",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public missing-params response snapshot", async () => {
    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

    const req = {
      headers: {},
      url: "/api/pin",
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
      url: "/api/pin?theme=merko",
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
      url: "/api/pin?username=renovate-bot&repo=convoychat",
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
      url: "/api/pin?username=martin-mfg",
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
      url: "/api/pin",
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
