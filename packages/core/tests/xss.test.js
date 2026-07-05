import { describe, expect, it, vi } from "vitest";

import gistApi from "../src/api/gist.js";
import statsApi from "../src/api/index.js";
import pinApi from "../src/api/pin.js";
import topLangsApi from "../src/api/top-langs.js";
import wakatimeApi from "../src/api/wakatime.js";

vi.mock("../src/fetchers/gist.js", () => ({
  fetchGist: vi.fn().mockResolvedValue({
    name: "<script>alert('xss')</script>",
    nameWithOwner: "<script>alert('xss')</script>",
    description: "<script>alert('xss')</script>",
    language: "<script>alert('xss')</script>",
    starsCount: 163,
    forksCount: 19,
  }),
}));

vi.mock("../src/fetchers/repo.js", () => ({
  fetchRepo: vi.fn().mockResolvedValue({
    nameWithOwner: "<script>alert('xss')</script>",
    name: "<script>alert('xss')</script>",
    description: "<script>alert('xss')</script>",
    primaryLanguage: {
      color: "#2b7489",
      id: "<script>alert('xss')</script>",
      name: "<script>alert('xss')</script>",
    },
    starCount: 38000,
    forkCount: 100,
  }),
}));

vi.mock("../src/fetchers/stats.js", () => ({
  fetchStats: vi.fn().mockResolvedValue({
    name: "<script>alert('xss')</script>",
    totalStars: 100,
    totalCommits: 200,
    totalIssues: 300,
    totalPRs: 400,
    totalPRsMerged: 320,
    mergedPRsPercentage: 80,
    totalReviews: 50,
    totalDiscussionsStarted: 10,
    totalDiscussionsAnswered: 50,
    contributedTo: 500,
    rank: { level: "A+", percentile: 40 },
  }),
}));

vi.mock("../src/fetchers/top-languages.js", () => ({
  fetchTopLanguages: vi.fn().mockResolvedValue({
    HTML: { color: "#0f0", name: "<script>alert('xss')</script>", size: 200 },
    javascript: {
      color: "#0ff",
      name: "<script>alert('xss')</script>",
      size: 200,
    },
    css: { color: "#ff0", name: "css", size: 100 },
  }),
}));

vi.mock("../src/fetchers/wakatime.js", () => ({
  fetchWakatimeStats: vi.fn().mockResolvedValue({
    categories: [
      {
        digital: "22:40",
        hours: 22,
        minutes: 40,
        name: "Coding",
        percent: 100,
        text: "22 hrs 40 mins",
        total_seconds: 81643.570077,
      },
    ],
    editors: [
      {
        digital: "22:40",
        hours: 22,
        minutes: 40,
        name: "VS Code",
        percent: 100,
        text: "22 hrs 40 mins",
        total_seconds: 81643.570077,
      },
    ],
    languages: [
      {
        digital: "0:19",
        hours: 0,
        minutes: 19,
        name: "Other",
        percent: 1.43,
        text: "19 mins",
        total_seconds: 1170.434361,
      },
      {
        digital: "0:01",
        hours: 0,
        minutes: 1,
        name: "<script>alert('xss')</script>",
        percent: 0.1,
        text: "1 min",
        total_seconds: 83.293809,
      },
    ],
    operating_systems: [
      {
        digital: "22:40",
        hours: 22,
        minutes: 40,
        name: "Mac",
        percent: 100,
        text: "22 hrs 40 mins",
        total_seconds: 81643.570077,
      },
    ],
    is_coding_activity_visible: true,
    is_other_usage_visible: true,
    human_readable_daily_average: "4 hrs 28 mins",
    human_readable_total: "22 hrs 21 mins",
    range: "last_7_days",
    username: "<script>alert('xss')</script>",
  }),
}));

const xssPayloads = [
  "<script>alert('xss')</script>",
  "\"><script>alert('xss')</script>",
];

describe("XSS prevention - stats API", () => {
  const apiParamNames = [
    "repo",
    "owner",
    "hide",
    "hide_title",
    "hide_border",
    "card_width",
    "hide_rank",
    "show_icons",
    "include_all_commits",
    "commits_year",
    "line_height",
    "title_color",
    "ring_color",
    "icon_color",
    "text_color",
    "text_bold",
    "bg_color",
    "theme",
    "exclude_repo",
    "custom_title",
    "locale",
    "disable_animations",
    "border_radius",
    "number_format",
    "role",
    "number_precision",
    "border_color",
    "rank_icon",
    "show",
  ];

  const testCases = apiParamNames.flatMap((param) =>
    xssPayloads.map((payload) => [param, payload]),
  );

  it.each(testCases)(
    "should prevent XSS via %s (%s)",
    async (param, payload) => {
      const result = await statsApi({
        username: "user",
        [param]: payload,
      });

      document.body.innerHTML = result.content;
      const svg = document.querySelector("svg");
      expect(svg?.querySelector("script")).toBeNull();
    },
  );

  it.each(xssPayloads)(
    "should prevent XSS via username (%s)",
    async (_label, payload) => {
      const result = await statsApi({ username: payload });

      document.body.innerHTML = result.content;
      const svg = document.querySelector("svg");
      expect(svg?.querySelector("script")).toBeNull();
    },
  );
});

describe("XSS prevention - top-langs API", () => {
  const apiParamNames = [
    "hide",
    "hide_title",
    "hide_border",
    "card_width",
    "title_color",
    "text_color",
    "bg_color",
    "prog_bar_bg_color",
    "theme",
    "layout",
    "langs_count",
    "exclude_repo",
    "size_weight",
    "count_weight",
    "custom_title",
    "locale",
    "border_radius",
    "border_color",
    "role",
    "disable_animations",
    "hide_progress",
    "hide_values",
    "stats_format",
  ];

  const testCases = apiParamNames.flatMap((param) =>
    xssPayloads.map((payload) => [param, payload]),
  );

  it.each(testCases)(
    "should prevent XSS via %s (%s)",
    async (param, payload) => {
      const result = await topLangsApi({
        username: "user",
        [param]: payload,
      });

      document.body.innerHTML = result.content;
      const svg = document.querySelector("svg");
      expect(svg?.querySelector("script")).toBeNull();
    },
  );

  it.each(xssPayloads)(
    "should prevent XSS via username (%s)",
    async (_label, payload) => {
      const result = await topLangsApi({ username: payload });

      document.body.innerHTML = result.content;
      const svg = document.querySelector("svg");
      expect(svg?.querySelector("script")).toBeNull();
    },
  );
});

describe("XSS prevention - pin API", () => {
  const apiParamNames = [
    "username",
    "hide_border",
    "title_color",
    "icon_color",
    "text_color",
    "bg_color",
    "card_width",
    "theme",
    "show_owner",
    "browser_rendering",
    "show",
    "show_icons",
    "number_format",
    "text_bold",
    "line_height",
    "locale",
    "border_radius",
    "border_color",
    "description_lines_count",
  ];

  const testCases = apiParamNames.flatMap((param) =>
    xssPayloads.map((payload) => [param, payload]),
  );

  it.each(testCases)(
    "should prevent XSS via %s (%s)",
    async (param, payload) => {
      const result = await pinApi({
        repo: "repo",
        [param]: payload,
      });

      document.body.innerHTML = result.content;
      const svg = document.querySelector("svg");
      expect(svg?.querySelector("script")).toBeNull();
    },
  );

  it.each(xssPayloads)(
    "should prevent XSS via username (%s)",
    async (_label, payload) => {
      const result = await pinApi({ repo: payload });

      document.body.innerHTML = result.content;
      const svg = document.querySelector("svg");
      expect(svg?.querySelector("script")).toBeNull();
    },
  );
});

describe("XSS prevention - gist API", () => {
  const apiParamNames = [
    "title_color",
    "icon_color",
    "text_color",
    "bg_color",
    "theme",
    "locale",
    "border_radius",
    "border_color",
    "show_owner",
    "browser_rendering",
    "hide_border",
  ];

  const testCases = apiParamNames.flatMap((param) =>
    xssPayloads.map((payload) => [param, payload]),
  );

  it.each(testCases)(
    "should prevent XSS via %s (%s)",
    async (param, payload) => {
      const result = await gistApi({
        id: "test-id",
        [param]: payload,
      });

      document.body.innerHTML = result.content;
      const svg = document.querySelector("svg");
      expect(svg?.querySelector("script")).toBeNull();
    },
  );

  it.each(xssPayloads)(
    "should prevent XSS via id (%s)",
    async (_label, payload) => {
      const result = await gistApi({ id: payload });

      document.body.innerHTML = result.content;
      const svg = document.querySelector("svg");
      expect(svg?.querySelector("script")).toBeNull();
    },
  );
});

describe("XSS prevention - wakatime API", () => {
  const apiParamNames = [
    "title_color",
    "icon_color",
    "hide_border",
    "card_width",
    "line_height",
    "text_color",
    "bg_color",
    "theme",
    "hide_title",
    "hide_progress",
    "custom_title",
    "locale",
    "layout",
    "langs_count",
    "hide",
    "api_domain",
    "border_radius",
    "border_color",
    "display_format",
    "disable_animations",
  ];

  const testCases = apiParamNames.flatMap((param) =>
    xssPayloads.map((payload) => [param, payload]),
  );

  it.each(testCases)(
    "should prevent XSS via %s (%s)",
    async (param, payload) => {
      const result = await wakatimeApi({
        username: "user",
        [param]: payload,
      });

      document.body.innerHTML = result.content;
      const svg = document.querySelector("svg");
      expect(svg?.querySelector("script")).toBeNull();
    },
  );

  it.each(xssPayloads)(
    "should prevent XSS via username (%s)",
    async (_label, payload) => {
      const result = await wakatimeApi({ username: payload });

      document.body.innerHTML = result.content;
      const svg = document.querySelector("svg");
      expect(svg?.querySelector("script")).toBeNull();
    },
  );
});
