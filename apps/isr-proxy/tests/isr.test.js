// @ts-check

import { readFileSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import handler, {
  CONTAINER_HOSTS,
  FLY_HOSTS,
  FLY_SHARE,
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

/**
 * Makes the handler route to fly.io (`true`) or to the Vercel container (`false`).
 *
 * @param {boolean} useFly Whether to route to fly.io.
 */
const routeToFly = (useFly) => {
  vi.spyOn(Math, "random").mockReturnValue(
    useFly ? FLY_SHARE - 0.01 : FLY_SHARE,
  );
};

beforeEach(() => {
  routeToFly(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("config.json", () => {
  it("uses the same hosts as the ISR function", () => {
    const externalHosts = config.routes
      .filter((/** @type {any} */ r) => r.dest?.startsWith("https://"))
      .map((/** @type {any} */ r) => new URL(r.dest.replace("$1", "")).host);
    const envs = /** @type {(keyof typeof CONTAINER_HOSTS)[]} */ (
      Object.keys(CONTAINER_HOSTS)
    );
    // Environments fully served by fly.io are rewritten to fly.io as well.
    const expectedHosts = envs.map((env) =>
      FLY_SHARE >= 1
        ? (FLY_HOSTS[env] ?? CONTAINER_HOSTS[env])
        : CONTAINER_HOSTS[env],
    );
    expect(externalHosts.toSorted()).toEqual(expectedHosts.toSorted());
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

  it("targets fly.io for production if requested", () => {
    expect(
      getUpstreamUrl("/isr?username=x&__card=pin&__env=production", true),
    ).toBe(`https://${FLY_HOSTS.production}/api/pin?username=x`);
  });

  it("returns no fly.io URL for preview", () => {
    expect(
      getUpstreamUrl("/isr?username=x&__card=pin&__env=preview", true),
    ).toBeNull();
  });

  it("rejects unknown environments also for fly.io", () => {
    expect(getUpstreamUrl("/isr?__card=pin&__env=unknown", true)).toBeNull();
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

  it.each([
    [false, 403],
    [false, 503],
    [true, 403],
    [true, 429],
  ])(
    "passes through status codes (useFly=%s, status=%s)",
    async (useFly, status) => {
      routeToFly(useFly);
      const fetchMock = vi.fn(
        async () => new Response("Upstream error", { status }),
      );
      vi.stubGlobal("fetch", fetchMock);
      const { req, res } = createRequestResponse(
        "/isr?__card=&__env=production",
      );

      await handler(req, res);

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(res.statusCode).toBe(status);
      expect(res.end).toHaveBeenCalledOnce();
      expect(res.end.mock.calls[0][0].toString()).toBe("Upstream error");
    },
  );

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

  it("routes production to fly.io for its share of the requests", async () => {
    routeToFly(true);
    const fetchMock = vi.fn(async () => new Response("<svg></svg>"));
    vi.stubGlobal("fetch", fetchMock);
    const { req, res } = createRequestResponse(
      "/isr?username=x&__card=pin&__env=production",
      { "x-bypass-store": "true" },
    );

    await handler(req, res);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      `https://${FLY_HOSTS.production}/api/pin?username=x`,
      { headers: { "x-bypass-store": "true" }, redirect: "error" },
    );
    expect(res.statusCode).toBe(200);
    expect(res.end.mock.calls[0][0].toString()).toBe("<svg></svg>");
  });

  it("always routes preview to the Vercel container", async () => {
    routeToFly(true);
    const fetchMock = vi.fn(async () => new Response("<svg></svg>"));
    vi.stubGlobal("fetch", fetchMock);
    const { req, res } = createRequestResponse(
      "/isr?username=x&__card=pin&__env=preview",
    );

    await handler(req, res);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      `https://${CONTAINER_HOSTS.preview}/api/pin?username=x`,
      { headers: {}, redirect: "error" },
    );
    expect(res.statusCode).toBe(200);
  });

  it("falls back to the Vercel container if fly.io is unreachable", async () => {
    routeToFly(true);
    const fetchMock = vi.fn(async (/** @type {string} */ url) => {
      if (url.startsWith(`https://${FLY_HOSTS.production}/`)) {
        throw new Error("connection refused");
      }
      return new Response("<svg></svg>");
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { req, res } = createRequestResponse(
      "/isr?username=x&__card=pin&__env=production",
    );

    await handler(req, res);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `https://${FLY_HOSTS.production}/api/pin?username=x`,
      `https://${CONTAINER_HOSTS.production}/api/pin?username=x`,
    ]);
    expect(res.statusCode).toBe(200);
    expect(res.end.mock.calls[0][0].toString()).toBe("<svg></svg>");
  });

  it.each([500, 502, 503, 504, 599])(
    "falls back to the Vercel container if fly.io returns HTTP %s",
    async (status) => {
      routeToFly(true);
      const fetchMock = vi.fn(async (/** @type {string} */ url) => {
        if (url.startsWith(`https://${FLY_HOSTS.production}/`)) {
          return new Response("Fly unavailable", {
            status,
            headers: {
              "content-type": "text/plain",
              "cache-control": "no-store",
            },
          });
        }
        return new Response("<svg></svg>", {
          headers: {
            "content-type": "image/svg+xml",
            "cache-control": "max-age=36000",
          },
        });
      });
      vi.stubGlobal("fetch", fetchMock);
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { req, res } = createRequestResponse(
        "/isr?username=x&__card=pin&__env=production",
        { "x-bypass-store": "true" },
      );

      await handler(req, res);

      expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
        `https://${FLY_HOSTS.production}/api/pin?username=x`,
        `https://${CONTAINER_HOSTS.production}/api/pin?username=x`,
      ]);
      expect(fetchMock).toHaveBeenLastCalledWith(
        `https://${CONTAINER_HOSTS.production}/api/pin?username=x`,
        { headers: { "x-bypass-store": "true" }, redirect: "error" },
      );
      expect(errorSpy).toHaveBeenCalledExactlyOnceWith(
        expect.stringContaining("falling back"),
        expect.objectContaining({ message: `fly.io returned HTTP ${status}` }),
      );
      expect(res.statusCode).toBe(200);
      expect(res.setHeader.mock.calls).toEqual([
        ["content-type", "image/svg+xml"],
        ["cache-control", "max-age=36000"],
      ]);
      expect(res.end).toHaveBeenCalledOnce();
      expect(res.end.mock.calls[0][0].toString()).toBe("<svg></svg>");
    },
  );

  it("returns 502 if both fly.io and the Vercel container are unreachable", async () => {
    routeToFly(true);
    const fetchMock = vi.fn(async () => {
      throw new Error("connection refused");
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { req, res } = createRequestResponse("/isr?__card=&__env=production");

    await handler(req, res);

    expect(fetchMock).toHaveBeenCalledTimes(2);
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
