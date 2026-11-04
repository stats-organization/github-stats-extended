import nock from "nock";
import { describe, expect, it } from "vitest";

import { fetchWakatimeStats } from "../src/fetchers/wakatime.js";

import { wakaTimeData } from "./fixtures/wakatime.js";

describe("WakaTime fetcher", () => {
  it("should fetch correct WakaTime data", async () => {
    const username = "anuraghazra";
    nock("https://wakatime.com")
      .get(`/api/v1/users/${username}/stats?is_including_today=true`)
      .reply(200, wakaTimeData);

    const repo = await fetchWakatimeStats({ username });
    expect(repo).toStrictEqual(wakaTimeData.data);
  });

  it("should throw error if username param missing", async () => {
    nock("https://wakatime.com")
      .get(/^\/api\//)
      .reply(404, wakaTimeData);

    // @ts-expect-error testing invalid input
    await expect(fetchWakatimeStats("noone")).rejects.toThrow(
      'Missing params "username" make sure you pass the parameters in URL',
    );
  });

  it("should throw error if username is not found", async () => {
    nock("https://wakatime.com")
      .get(/^\/api\//)
      .reply(404, wakaTimeData);

    await expect(fetchWakatimeStats({ username: "noone" })).rejects.toThrow(
      "Could not resolve to a User with the login of 'noone'",
    );
  });
});
