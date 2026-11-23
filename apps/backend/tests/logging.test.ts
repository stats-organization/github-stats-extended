import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

//declare variables of the same type as the exports from the logging files
let requestLogging: typeof import("../src/common/logging.js").requestLogging;
let logger: typeof import("@stats-organization/github-readme-stats-core").logger;
const output = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

beforeEach(async () => {
  vi.resetModules();
  for (const level of ["log", "error", "warn", "info", "debug"] as const) {
    output[level].mockClear();
    vi.spyOn(console, level).mockImplementation(output[level]);
  }
  ({ requestLogging } = await import("../src/common/logging.js"));
  ({ logger } = await import("@stats-organization/github-readme-stats-core"));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Request logging", () => {
  it("includes the unmodified URL in console and core logs, including every stack trace line", async () => {
    const url =
      "/api/?username=octocat&theme=dark&title=Hello%20world&hide=stars&hide=issues&code=test-code&user_key=test-key";
    const prefix = JSON.stringify({ requestId: "fly-request-123", url });

    await requestLogging(
      { originalUrl: url, headers: { "fly-request-id": "fly-request-123" } },
      undefined,
      async () => {
        console.log("direct %d", 42);
        logger.log("core");
        await Promise.resolve();
        logger.error(new Error("failure\nsecond line"));
        console.warn("warning");
        console.info("info");
        console.debug("debug");
      },
    );

    expect(output.log.mock.calls).toEqual([
      [`${prefix} direct 42`],
      [`${prefix} core`],
    ]);
    expect(output.warn).toHaveBeenCalledWith(`${prefix} warning`);
    expect(output.info).toHaveBeenCalledWith(`${prefix} info`);
    expect(output.debug).toHaveBeenCalledWith(`${prefix} debug`);
    expect(output.error).toHaveBeenCalledWith(`${prefix} Error: failure`);
    expect(output.error).toHaveBeenCalledWith(`${prefix} second line`);
    for (const [line] of output.error.mock.calls) {
      expect(line).toEqual(expect.stringContaining(`${prefix} `));
    }
  });

  it("isolates overlapping asynchronous requests and restores system context afterward", async () => {
    const { promise: secondStarted, resolve: releaseFirst } =
      Promise.withResolvers<undefined>();

    await Promise.all([
      requestLogging(
        { originalUrl: "/first", headers: { "fly-request-id": "first" } },
        undefined,
        async () => {
          await secondStarted;
          logger.log("first completed");
        },
      ),
      requestLogging(
        { originalUrl: "/second", headers: { "fly-request-id": "second" } },
        undefined,
        async () => {
          console.log("second started");
          releaseFirst(undefined);
          await Promise.resolve();
          console.log("second completed");
        },
      ),
    ]);

    expect(output.log.mock.calls).toEqual([
      ['{"requestId":"second","url":"/second"} second started'],
      ['{"requestId":"first","url":"/first"} first completed'],
      ['{"requestId":"second","url":"/second"} second completed'],
    ]);
    console.log("outside request");
    expect(output.log).toHaveBeenLastCalledWith(
      '{"source":"system"} outside request',
    );
  });

  it("generates a request ID and retains context in work scheduled after middleware returns", async () => {
    const { promise: finished, resolve } = Promise.withResolvers<undefined>();

    requestLogging(
      { originalUrl: "/api?username=octocat", headers: {} },
      undefined,
      () => {
        setTimeout(() => {
          logger.log("after response");
          resolve(undefined);
        }, 0);
      },
    );
    await finished;

    expect(output.log).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\{"requestId":"[0-9a-f-]{36}","url":"\/api\?username=octocat"\} after response$/,
      ),
    );
  });
});
