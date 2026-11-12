import nock from "nock";
import { afterEach, describe, expect, it } from "vitest";

import { createGraphQLFetcher, request } from "../src/common/http.js";
import { graphqlDocument } from "../src/graphql/graphqlDocument.js";

interface ViewerResult {
  viewer: { login: string };
}

const document = graphqlDocument<ViewerResult, { login: string }>(
  "query ($login: String!) { viewer: user(login: $login) { login } }",
);

describe("createGraphQLFetcher", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it("posts the query and variables with a bearer token", async () => {
    const scope = nock("https://api.github.com", {
      reqheaders: { authorization: "bearer TOKEN" },
    })
      .post("/graphql", {
        query: document.text,
        variables: { login: "octocat" },
      })
      .reply(200, { data: { viewer: { login: "octocat" } } });

    const fetcher = createGraphQLFetcher(document, "bearer");
    const res = await fetcher({ login: "octocat" }, "TOKEN");

    expect(res.data.data.viewer.login).toBe("octocat");
    expect(scope.isDone()).toBe(true);
  });

  it("supports the token authorization scheme", async () => {
    const scope = nock("https://api.github.com", {
      reqheaders: { authorization: "token TOKEN" },
    })
      .post("/graphql")
      .reply(200, { data: { viewer: { login: "octocat" } } });

    const fetcher = createGraphQLFetcher(document, "token");
    await fetcher({ login: "octocat" }, "TOKEN");

    expect(scope.isDone()).toBe(true);
  });

  it("surfaces GraphQL errors in the response payload", async () => {
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, { data: null, errors: [{ type: "RATE_LIMITED" }] });

    const fetcher = createGraphQLFetcher(document, "bearer");
    const res = await fetcher({ login: "octocat" }, "TOKEN");

    expect(res.data.errors).toEqual([{ type: "RATE_LIMITED" }]);
  });
});

describe("request", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it("posts an untyped GraphQL payload with the given headers", async () => {
    const scope = nock("https://api.github.com", {
      reqheaders: { authorization: "bearer TOKEN" },
    })
      .post("/graphql", { query: "{ rateLimit { limit } }", variables: {} })
      .reply(200, { data: { rateLimit: { limit: 5000 } } });

    const res = (await request(
      { query: "{ rateLimit { limit } }", variables: {} },
      { Authorization: "bearer TOKEN" },
    )) as { data: { data: { rateLimit: { limit: number } } } };

    expect(res.data.data.rateLimit.limit).toBe(5000);
    expect(scope.isDone()).toBe(true);
  });
});
