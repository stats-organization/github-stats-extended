import { describe, expectTypeOf, it } from "vitest";

import type { RepoUserStats, RepositoryData } from "../src/fetchers/types.js";

describe("repo fetcher types", () => {
  it("should expose shared repo stats typing", () => {
    const stats: RepoUserStats = { totalPRsAuthored: 2 };

    const repoData: RepositoryData = {
      name: "convoychat",
      nameWithOwner: "anuraghazra/convoychat",
      isPrivate: false,
      isArchived: false,
      isTemplate: false,
      stargazerCount: 38000,
      description: "Help us take over the world!",
      primaryLanguage: {
        color: "#2b7489",
        id: "MDg6TGFuZ3VhZ2UyODc=",
        name: "TypeScript",
      },
      forkCount: 100,
      ...(stats.totalPRsAuthored === undefined
        ? {}
        : { totalPRsAuthored: stats.totalPRsAuthored }),
    };

    expectTypeOf(repoData.totalPRsAuthored).toEqualTypeOf<number | undefined>();
    expectTypeOf(repoData).toExtend<RepositoryData>();
  });
});
