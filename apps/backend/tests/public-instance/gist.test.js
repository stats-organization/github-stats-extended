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
  happy_path_gist_data,
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

  graphqlRequests = mockGraphQL(happy_path_gist_data);
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

describe("Test /api/gist contract", () => {
  it("should match the public happy-path response snapshot", async () => {
    const { default: router } = await import("../../router.js");

    const { req, res } = createRequestResponse("/api/gist?id=happy-gist-id");

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
      id: "happy-gist-id",
      title_color: "123456",
      icon_color_light: "ff00aa",
      icon_color_dark: "aa00ff",
      text_color_light: "ffabcd",
      text_color_dark: "abcdef",
      bg_color: "0f172a",
      border_radius: "12",
      border_color: "fedcba",
      show_owner: "true",
      disable_animations: "true",
    });

    const { req, res } = createRequestResponse(
      `/api/gist?${params.toString()}`,
    );

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      graphqlRequest: graphqlRequests[0],
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public missing-id response snapshot", async () => {
    const { default: router } = await import("../../router.js");

    const { req, res } = createRequestResponse("/api/gist");

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the private missing-id response snapshot", async () => {
    vi.stubEnv("GIST_WHITELIST", "allowed-gist-id");

    const { default: router } = await import("../../router.js");

    const { req, res } = createRequestResponse("/api/gist");

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });
});
