// @ts-check

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeSvg } from "../utils.js";

const mock = new MockAdapter(axios);

const wakaTimeData = {
  data: {
    categories: [
      {
        digital: "22:40",
        hours: 22,
        minutes: 40,
        name: "Coding",
        percent: 100,
        text: "22 hrs 40 mins",
        total_seconds: 81643.570077,
      },
    ],
    daily_average: 16095,
    daily_average_including_other_language: 16329,
    days_including_holidays: 7,
    days_minus_holidays: 5,
    editors: [
      {
        digital: "22:40",
        hours: 22,
        minutes: 40,
        name: "VS Code",
        percent: 100,
        text: "22 hrs 40 mins",
        total_seconds: 81643.570077,
      },
    ],
    holidays: 2,
    human_readable_daily_average: "4 hrs 28 mins",
    human_readable_daily_average_including_other_language: "4 hrs 32 mins",
    human_readable_total: "22 hrs 21 mins",
    human_readable_total_including_other_language: "22 hrs 40 mins",
    id: "random hash",
    is_already_updating: false,
    is_coding_activity_visible: true,
    is_including_today: false,
    is_other_usage_visible: true,
    is_stuck: false,
    is_up_to_date: true,
    languages: [
      {
        digital: "0:19",
        hours: 0,
        minutes: 19,
        name: "Other",
        percent: 1.43,
        text: "19 mins",
        total_seconds: 1170.434361,
      },
      {
        digital: "0:01",
        hours: 0,
        minutes: 1,
        name: "TypeScript",
        percent: 0.1,
        text: "1 min",
        total_seconds: 83.293809,
      },
      {
        digital: "0:00",
        hours: 0,
        minutes: 0,
        name: "YAML",
        percent: 0.07,
        text: "0 secs",
        total_seconds: 54.975151,
      },
    ],
    operating_systems: [
      {
        digital: "22:40",
        hours: 22,
        minutes: 40,
        name: "Mac",
        percent: 100,
        text: "22 hrs 40 mins",
        total_seconds: 81643.570077,
      },
    ],
    percent_calculated: 100,
    range: "last_7_days",
    status: "ok",
    timeout: 15,
    total_seconds: 80473.135716,
    total_seconds_including_other_language: 81643.570077,
    user_id: "random hash",
    username: "anuraghazra",
    writes_only: false,
  },
};

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
    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

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

  it("should match the public missing-username response snapshot", async () => {
    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

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
    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

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

    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

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

    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

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

    const { default: router } =
      await import("../../.vercel/output/functions/api.func/router.js");

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
