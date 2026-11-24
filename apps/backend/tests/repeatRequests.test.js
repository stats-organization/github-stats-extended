import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock(import("pg"), () => {
  class Pool {
    query = queryMock;
  }

  return { Pool };
});

let startRepeatRequestsScheduler;

beforeAll(async () => {
  vi.stubEnv("POSTGRES_URL", "postgres://localhost:5432/test");
  vi.stubEnv("TOKEN_ENCRYPTION_KEY", Buffer.from("test").toString("base64"));

  ({ startRepeatRequestsScheduler } = await import("../src/repeatRequests.js"));
});

beforeEach(() => {
  queryMock.mockReset().mockResolvedValue({ rows: [], rowCount: 0 });
  vi.stubEnv("REPEAT_BASE_URL", undefined);
  vi.stubEnv("VERCEL_BRANCH_URL", undefined);
  vi.stubEnv("REPEAT_INTERVAL_MINUTES", undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("startRepeatRequestsScheduler", () => {
  it("should not run immediately on startup and default to 15 minutes", async () => {
    vi.useFakeTimers();
    vi.stubEnv("REPEAT_BASE_URL", "example.org");

    const stop = startRepeatRequestsScheduler();

    await vi.advanceTimersByTimeAsync(14 * 60_000);
    expect(queryMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(60_000);
    // deleteOldRequests + getRecentRequests
    expect(queryMock).toHaveBeenCalledTimes(2);

    stop();
  });

  it("should not schedule when REPEAT_BASE_URL and VERCEL_BRANCH_URL are unset", async () => {
    vi.useFakeTimers();

    const stop = startRepeatRequestsScheduler();
    await vi.advanceTimersByTimeAsync(60 * 60_000);
    stop();

    expect(queryMock).not.toHaveBeenCalled();
  });

  it("should not schedule when REPEAT_INTERVAL_MINUTES is 0", async () => {
    vi.useFakeTimers();
    vi.stubEnv("REPEAT_BASE_URL", "example.org");
    vi.stubEnv("REPEAT_INTERVAL_MINUTES", "0");

    const stop = startRepeatRequestsScheduler();
    await vi.advanceTimersByTimeAsync(60 * 60_000);
    stop();

    expect(queryMock).not.toHaveBeenCalled();
  });

  it("should run periodically at the configured interval and stop cleanly", async () => {
    vi.useFakeTimers();
    vi.stubEnv("REPEAT_BASE_URL", "example.org");
    vi.stubEnv("REPEAT_INTERVAL_MINUTES", "10");

    const stop = startRepeatRequestsScheduler();

    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(queryMock).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(queryMock).toHaveBeenCalledTimes(4);

    stop();
    await vi.advanceTimersByTimeAsync(30 * 60_000);
    expect(queryMock).toHaveBeenCalledTimes(4);
  });

  it("should wait for an in-flight run to finish before scheduling the next", async () => {
    vi.useFakeTimers();
    vi.stubEnv("REPEAT_BASE_URL", "example.org");
    vi.stubEnv("REPEAT_INTERVAL_MINUTES", "5");

    let resolveFirst;
    queryMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = () => resolve({ rows: [], rowCount: 0 });
        }),
    );

    const stop = startRepeatRequestsScheduler();

    await vi.advanceTimersByTimeAsync(5 * 60_000);
    expect(queryMock).toHaveBeenCalledTimes(1);

    // Even after another full interval, a second run should not start while the first is in flight
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(queryMock).toHaveBeenCalledTimes(1);

    resolveFirst();
    await vi.advanceTimersByTimeAsync(0);
    expect(queryMock).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(5 * 60_000);
    expect(queryMock).toHaveBeenCalledTimes(4);

    stop();
  });

  it("should continue scheduling after a failed run", async () => {
    vi.useFakeTimers();
    vi.stubEnv("REPEAT_BASE_URL", "example.org");
    vi.stubEnv("REPEAT_INTERVAL_MINUTES", "5");
    vi.spyOn(console, "error").mockImplementation(() => {});

    queryMock.mockRejectedValueOnce(new Error("boom"));

    const stop = startRepeatRequestsScheduler();

    await vi.advanceTimersByTimeAsync(5 * 60_000);
    expect(queryMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5 * 60_000);
    expect(queryMock).toHaveBeenCalledTimes(3);

    stop();
  });
});
