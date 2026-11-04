// @ts-check

import { logger } from "@stats-organization/github-readme-stats-core";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createRequestResponse,
  data_langs,
  mockGraphQL,
  normalizeSvg,
} from "../utils.js";

/** @type {Array<string>} */
let graphqlRequests;

beforeEach(() => {
  vi.stubEnv("CACHE_SECONDS", "");
  vi.stubEnv("GIST_WHITELIST", "");
  vi.stubEnv("POSTGRES_URL", "");
  vi.stubEnv("WHITELIST", "");

  graphqlRequests = mockGraphQL(data_langs);
});

beforeAll(() => {
  vi.spyOn(logger, "log").mockImplementation(() => {});
  vi.spyOn(logger, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  // modules may cache environment variables, so we need to reset them
  vi.resetModules();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("Test /api/top-langs contract", () => {
  it("should match the public happy-path response snapshot", async () => {
    const { default: router } = await import("../../router.js");

    const { req, res } = createRequestResponse(
      "/api/top-langs?username=anuraghazra",
    );

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public many-params response snapshot", async () => {
    const { default: router } = await import("../../router.js");

    const params = new URLSearchParams({
      username: "anuraghazra",
      hide: "javascript,HTML",
      hide_title: "true",
      hide_border: "true",
      card_width: "420",
      title_color: "123456",
      text_color: "abcdef",
      bg_color: "0f172a",
      theme_dark: "cobalt",
      layout: "compact",
      langs_count: "3",
      exclude_repo: "repo-hidden",
      size_weight: "0.5",
      count_weight: "1",
      role: "OWNER,COLLABORATOR",
      disable_animations: "true",
      stats_format: "bytes",
    });

    const { req, res } = createRequestResponse(
      `/api/top-langs?${params.toString()}`,
    );

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      graphqlRequest: graphqlRequests[0],
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public missing-username response snapshot", async () => {
    const { default: router } = await import("../../router.js");

    const { req, res } = createRequestResponse("/api/top-langs");

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should render error card in same theme as requested card", async () => {
    const { default: router } = await import("../../router.js");

    const { req, res } = createRequestResponse("/api/top-langs?theme=merko");

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public blacklisted-username response snapshot", async () => {
    const { default: router } = await import("../../router.js");

    const { req, res } = createRequestResponse(
      "/api/top-langs?username=renovate-bot",
    );

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the private non-whitelisted username response snapshot", async () => {
    vi.stubEnv("WHITELIST", "anuraghazra");

    const { default: router } = await import("../../router.js");

    const { req, res } = createRequestResponse(
      "/api/top-langs?username=martin-mfg",
    );

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the private missing-username response snapshot", async () => {
    vi.stubEnv("WHITELIST", "anuraghazra");

    const { default: router } = await import("../../router.js");

    const { req, res } = createRequestResponse("/api/top-langs");

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });
});
