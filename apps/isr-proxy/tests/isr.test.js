// @ts-check

import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import handler, {
  CONTAINER_HOSTS,
  getUpstreamUrl,
} from "../.vercel/output/functions/isr.func/index.mjs";

const config = JSON.parse(
  readFileSync(
    new URL("../.vercel/output/config.json", import.meta.url),
    "utf8",
  ),
);

/**
 * Creates a fake request and response.
 *
 * @param {string} url Request URL.
 * @param {Record<string, string>} [headers] Request headers.
 * @returns {{ req: any, res: any }} Fake request and response.
 */
const createRequestResponse = (url, headers = {}) => ({
  req: {
    headers,
    url,
  },
  res: {
    end: vi.fn(),
    setHeader: vi.fn(),
  },
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("config.json", () => {
  it("uses the same container hosts as the ISR function", () => {
    const externalHosts = config.routes
      .filter((/** @type {any} */ r) => r.dest?.startsWith("https://"))
      .map((/** @type {any} */ r) => new URL(r.dest.replace("$1", "")).host);
    expect(externalHosts.toSorted()).toEqual(
      Object.values(CONTAINER_HOSTS).toSorted(),
    );
  });
});

describe("getUpstreamUrl", () => {
  it.each([
    ["", "/api"],
    ["pin", "/api/pin"],
    ["top-langs", "/api/top-langs"],
    ["gist", "/api/gist"],
    ["wakatime", "/api/wakatime"],
  ])("maps __card=%s to %s", (card, path) => {
    expect(
      getUpstreamUrl(`/isr?username=x&__card=${card}&__env=production`),
    ).toBe(`https://${CONTAINER_HOSTS.production}${path}?username=x`);
  });

  it("selects the preview container", () => {
    expect(getUpstreamUrl("/isr?username=x&__card=pin&__env=preview")).toBe(
      `https://${CONTAINER_HOSTS.preview}/api/pin?username=x`,
    );
  });

  it("forwards the client query string verbatim", () => {
    expect(
      getUpstreamUrl(
        "/isr?__card=&username=a%20b&hide=stars,commits&theme=&flag&__env=production",
      ),
    ).toBe(
      `https://${CONTAINER_HOSTS.production}/api?username=a%20b&hide=stars,commits&theme=&flag`,
    );
  });

  it("omits the query string if only internal parameters are present", () => {
    expect(getUpstreamUrl("/isr?__card=&__env=production")).toBe(
      `https://${CONTAINER_HOSTS.production}/api`,
    );
  });

  it.each([
    "/isr",
    "/isr?__card=pin",
    "/isr?__env=production",
    "/isr?__card=unknown&__env=production",
    "/isr?__card=pin&__env=unknown",
    "/isr?__card=toString&__env=production",
    "/isr?__card=pin&__env=constructor",
  ])("rejects %s", (url) => {
    expect(getUpstreamUrl(url)).toBeNull();
  });
});

describe("handler", () => {
  it("forwards x-bypass-store only and returns status and allowed response headers", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response("<svg></svg>", {
          status: 200,
          headers: {
            "content-type": "image/svg+xml",
            "cache-control": "max-age=36000, s-maxage=36000",
            pragma: "no-cache",
            expires: "Thu, 01 Jan 1970 00:00:00 GMT",
            etag: 'W/"abc"',
            "x-powered-by": "Express",
          },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { req, res } = createRequestResponse(
      "/isr?username=x&__card=pin&__env=production",
      {
        "x-bypass-store": "true",
        host: "github-stats-extended.vercel.app",
        cookie: "a=b",
      },
    );

    await handler(req, res);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://${CONTAINER_HOSTS.production}/api/pin?username=x`,
      { headers: { "x-bypass-store": "true" }, redirect: "error" },
    );
    expect(res.statusCode).toBe(200);
    expect(res.setHeader.mock.calls).toEqual([
      ["content-type", "image/svg+xml"],
      ["cache-control", "max-age=36000, s-maxage=36000"],
      ["pragma", "no-cache"],
      ["expires", "Thu, 01 Jan 1970 00:00:00 GMT"],
    ]);
    expect(res.end).toHaveBeenCalledOnce();
    expect(res.end.mock.calls[0][0].toString()).toBe("<svg></svg>");
  });

  it("passes through non-200 status codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Forbidden", { status: 403 })),
    );
    const { req, res } = createRequestResponse("/isr?__card=&__env=production");

    await handler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.end).toHaveBeenCalledOnce();
    expect(res.end.mock.calls[0][0].toString()).toBe("Forbidden");
  });

  it("returns 502 if the container is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("connection refused");
      }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { req, res } = createRequestResponse("/isr?__card=&__env=production");

    await handler(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("Bad Gateway");
  });

  it("returns 404 without calling the container for unknown cards", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { req, res } = createRequestResponse(
      "/isr?__card=nope&__env=production",
    );

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("Not Found");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
