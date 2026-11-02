import nock from "nock";
import { describe, expect, it } from "vitest";

import { fetchRepo } from "../src/fetchers/repo.js";

const data_repo = {
  repository: {
    name: "convoychat",
    stargazerCount: 38000,
    description: "Help us take over the world! React + TS + GraphQL Chat App",
    primaryLanguage: {
      color: "#2b7489",
      id: "MDg6TGFuZ3VhZ2UyODc=",
      name: "TypeScript",
    },
    forkCount: 100,
  },
};

const data_user = {
  data: {
    user: { repository: data_repo.repository },
    organization: null,
  },
};

const data_org = {
  data: {
    user: null,
    organization: { repository: data_repo.repository },
  },
};

describe("Test fetchRepo", () => {
  it("should fetch correct user repo", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, data_user);

    const repo = await fetchRepo("anuraghazra", "convoychat");

    expect(repo).toStrictEqual(data_repo.repository);
  });

  it("should fetch correct org repo", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, data_org);

    const repo = await fetchRepo("anuraghazra", "convoychat");
    expect(repo).toStrictEqual(data_repo.repository);
  });

  it("should throw error if user is found but repo is null", async () => {
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, { data: { user: { repository: null }, organization: null } });

    await expect(fetchRepo("anuraghazra", "convoychat")).rejects.toThrow(
      "User Repository Not found",
    );
  });

  it("should throw error if org is found but repo is null", async () => {
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, { data: { user: null, organization: { repository: null } } });

    await expect(fetchRepo("anuraghazra", "convoychat")).rejects.toThrow(
      "Organization Repository Not found",
    );
  });

  it("should throw error if both user & org data not found", async () => {
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, { data: { user: null, organization: null } });

    await expect(fetchRepo("anuraghazra", "convoychat")).rejects.toThrow(
      "Not found",
    );
  });

  it("should throw error if repository is private", async () => {
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, {
        data: {
          user: { repository: { ...data_repo, isPrivate: true } },
          organization: null,
        },
      });

    await expect(fetchRepo("anuraghazra", "convoychat")).rejects.toThrow(
      "User Repository Not found",
    );
  });
});
