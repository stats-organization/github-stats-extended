// @ts-check

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeSvg, wakaTimeData } from "../utils.js";

const mock = new MockAdapter(axios);

const wakaTimeProfileNotPublicData = {
  data: {
    viewer: {
      gist: null,
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

  mock
    .onGet(
      "https://wakatime.com/api/v1/users/anuraghazra/stats?is_including_today=true",
    )
    .reply(200, wakaTimeData);
});

afterEach(() => {
  mock.reset();
  vi.unstubAllEnvs();
  // modules may cache environment variables, so we need to reset them
  vi.resetModules();
});

describe("Test /api/wakatime contract", () => {
  it("should match the public happy-path response snapshot", async () => {
    const { default: router } = await import("../../router.js");

    const req = {
      headers: {},
      url: "/api/wakatime?username=anuraghazra",
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
    mock.reset(); // to verify api_domain param is working
    mock
      .onGet(
        "https://wakatime.local/api/v1/users/anuraghazra/stats?is_including_today=true",
      )
      .reply(200, wakaTimeData);

    const { default: router } = await import("../../router.js");

    const params = new URLSearchParams({
      username: "anuraghazra",
      title_color: "123456",
      text_color: "abcdef",
      bg_color: "0f172a",
      card_width: "620",
      custom_title: "a custom title",
      layout: "compact",
      langs_count: "3",
      hide: "other",
      api_domain: "wakatime.local",
      border_radius: "12",
      border_color: "fedcba",
      display_format: "percent",
      disable_animations: "true",
    });

    const req = {
      headers: {},
      url: `/api/wakatime?${params.toString()}`,
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public missing-username response snapshot", async () => {
    const { default: router } = await import("../../router.js");

    const req = {
      headers: {},
      url: "/api/wakatime",
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
    const { default: router } = await import("../../router.js");

    const req = {
      headers: {},
      url: "/api/wakatime?theme=merko",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public inaccessible-profile response snapshot", async () => {
    mock.reset();
    mock
      .onGet(
        "https://wakatime.com/api/v1/users/anuraghazra/stats?is_including_today=true",
      )
      .reply(200, wakaTimeProfileNotPublicData);

    const { default: router } = await import("../../router.js");

    const req = {
      headers: {},
      url: "/api/wakatime?username=anuraghazra",
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

    const { default: router } = await import("../../router.js");

    const req = {
      headers: {},
      url: "/api/wakatime?username=martin-mfg",
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

    const { default: router } = await import("../../router.js");

    const req = {
      headers: {},
      url: "/api/wakatime",
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
