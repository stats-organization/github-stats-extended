// @ts-check

import { logger } from "@stats-organization/github-readme-stats-core";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
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

import { happy_path_gist_data, normalizeSvg } from "../utils.js";

const mock = new MockAdapter(axios);

const createResponse = () => ({
  end: vi.fn(),
  setHeader: vi.fn(),
});

beforeEach(() => {
  vi.stubEnv("CACHE_SECONDS", "");
  vi.stubEnv("GIST_WHITELIST", "");
  vi.stubEnv("POSTGRES_URL", "");
  vi.stubEnv("WHITELIST", "");

  mock
    .onPost("https://api.github.com/graphql")
    .reply(200, happy_path_gist_data);
});

beforeAll(() => {
  vi.spyOn(logger, "log").mockImplementation(() => {});
  vi.spyOn(logger, "error").mockImplementation(() => {});
});

afterEach(() => {
  mock.reset();
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

    const req = {
      headers: {},
      url: "/api/gist?id=happy-gist-id",
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
    const { default: router } = await import("../../router.js");

    const params = new URLSearchParams({
      id: "happy-gist-id",
      title_color: "123456",
      icon_color: "ff00aa",
      text_color: "abcdef",
      bg_color: "0f172a",
      border_radius: "12",
      border_color: "fedcba",
      show_owner: "true",
    });

    const req = {
      headers: {},
      url: `/api/gist?${params.toString()}`,
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

  it("should match the public missing-id response snapshot", async () => {
    const { default: router } = await import("../../router.js");

    const req = {
      headers: {},
      url: "/api/gist",
    };
    const res = createResponse();

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

    const req = {
      headers: {},
      url: "/api/gist",
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
