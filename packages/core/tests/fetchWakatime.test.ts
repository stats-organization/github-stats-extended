import nock from "nock";
import { describe, expect, it } from "vitest";

import { CustomError } from "../src/common/error.js";
import {
  fetchWakatimeStats,
  isValidApiDomain,
} from "../src/fetchers/wakatime.js";

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

  it("should fetch WakaTime data from valid custom api_domain", async () => {
    const username = "anuraghazra";
    nock("https://wakapi.dev")
      .get(`/api/v1/users/${username}/stats?is_including_today=true`)
      .reply(200, wakaTimeData);

    const repo = await fetchWakatimeStats({
      username,
      api_domain: "wakapi.dev",
    });
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

  describe("SSRF Defense & api_domain validation", () => {
    const invalidDomains = [
      "localhost",
      "sub.localhost",
      "127.0.0.1",
      "127.0.0.2",
      "169.254.169.254",
      "10.0.0.1",
      "192.168.1.1",
      "172.16.0.1",
      "172.31.255.255",
      "0.0.0.0",
      "127.0.0.1.nip.io",
      "169.254.169.254.nip.io",
      "foo.10.0.0.1.sslip.io",
      "metadata.google.internal",
      "instance-data",
      "http://wakatime.com",
      "https://wakatime.com",
      "wakatime.com/path",
      "wakatime.com:8080",
      "wakatime.com@evil.com",
      "-bad-domain.com",
      "bad-domain-.com",
      "plainhostname",
    ];

    it.each(invalidDomains)(
      "should reject invalid or private domain: %s",
      async (invalidDomain) => {
        expect(isValidApiDomain(invalidDomain)).toBe(false);

        await expect(
          fetchWakatimeStats({ username: "user", api_domain: invalidDomain }),
        ).rejects.toThrow(CustomError);

        await expect(
          fetchWakatimeStats({ username: "user", api_domain: invalidDomain }),
        ).rejects.toMatchObject({
          type: CustomError.INVALID_API_DOMAIN,
        });
      },
    );

    const validDomains = [
      "wakatime.com",
      "wakatime.local",
      "wakapi.dev",
      "stats.custom-instance.org",
      "my-domain.co.uk",
      "wakatime.com/",
    ];

    it.each(validDomains)(
      "should accept valid public domain: %s",
      (validDomain) => {
        expect(isValidApiDomain(validDomain)).toBe(true);
      },
    );
  });
});
