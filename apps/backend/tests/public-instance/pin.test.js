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

import { data_user, normalizeSvg } from "../utils.js";

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

  mock.onPost("https://api.github.com/graphql").reply(200, data_user);
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

describe("Test /api/pin contract", () => {
  it("should match the public happy-path response snapshot", async () => {
    const { default: router } = await import("../../router.js");

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

  it("should match the public many-params response snapshot", async () => {
    mock.onPost("https://api.github.com/graphql").reply(200, data_user);
    mock
      .onGet(
        "https://api.github.com/search/issues?per_page=1&q=repo:anuraghazra/convoychat+author:anuraghazra+type:pr",
      )
      .reply(200, { total_count: 1234 });
    mock
      .onGet(
        "https://api.github.com/search/issues?per_page=1&q=repo:anuraghazra/convoychat+commenter:anuraghazra+-author:anuraghazra+type:pr",
      )
      .reply(200, { total_count: 2345 });
    mock
      .onGet(
        "https://api.github.com/search/issues?per_page=1&q=repo:anuraghazra/convoychat+reviewed-by:anuraghazra+-author:anuraghazra+type:pr",
      )
      .reply(200, { total_count: 3456 });
    mock
      .onGet(
        "https://api.github.com/search/issues?per_page=1&q=repo:anuraghazra/convoychat+author:anuraghazra+type:issue",
      )
      .reply(200, { total_count: 4567 });
    mock
      .onGet(
        "https://api.github.com/search/issues?per_page=1&q=repo:anuraghazra/convoychat+commenter:anuraghazra+-author:anuraghazra+type:issue",
      )
      .reply(200, { total_count: 5678 });

    const { default: router } = await import("../../router.js");

    const params = new URLSearchParams({
      username: "anuraghazra",
      repo: "convoychat",
      title_color: "123456",
      icon_color: "ff00aa",
      text_color: "abcdef",
      bg_color: "0f172a",
      card_width: "560",
      show_owner: "true",
      show: "prs_authored,prs_commented,prs_reviewed,issues_authored,issues_commented",
      show_icons: "false",
      number_format: "long",
      text_bold: "true",
      line_height: "30",
      border_radius: "12",
      border_color: "fedcba",
      description_lines_count: "1",
    });

    const req = {
      headers: {},
      url: `/api/pin?${params.toString()}`,
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

  it("should match the public missing-params response snapshot", async () => {
    const { default: router } = await import("../../router.js");

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
    const { default: router } = await import("../../router.js");

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
    const { default: router } = await import("../../router.js");

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

    const { default: router } = await import("../../router.js");

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

    const { default: router } = await import("../../router.js");

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
