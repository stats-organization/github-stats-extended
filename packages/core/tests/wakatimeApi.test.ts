import { describe, expect, it, vi } from "vitest";

import wakatimeApi from "../src/api/wakatime.js";

vi.mock("../src/fetchers/wakatime.js", async () => {
  const { wakaTimeData } = await import("./fixtures/wakatime.js");
  return {
    fetchWakatimeStats: vi.fn().mockResolvedValue(wakaTimeData.data),
  };
});

describe("wakatime API", () => {
  it("should parse hide_progress string 'false' as boolean false", async () => {
    const result = await wakatimeApi({
      username: "user",
      hide_progress: "false",
    } as unknown as Parameters<typeof wakatimeApi>[0]);

    expect(result).toMatchSnapshot();
  });

  it("should parse hide_progress string 'true' as boolean true", async () => {
    const result = await wakatimeApi({
      username: "user",
      hide_progress: "true",
    } as unknown as Parameters<typeof wakatimeApi>[0]);

    expect(result).toMatchSnapshot();
  });
});
