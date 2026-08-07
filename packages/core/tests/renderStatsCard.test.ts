import { screen } from "@testing-library/dom";
import { cssToObject } from "@uppercod/css-to-object";
import { describe, expect, it } from "vitest";

import statsApi from "../src/api/index.js";
import { renderStatsCard } from "../src/cards/stats.js";
import { CustomError } from "../src/common/error.js";
import type { StatsData } from "../src/fetchers/types.js";
import { themes } from "../src/themes/index.js";

const stats: StatsData = {
  name: "Anurag Hazra",
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
  totalPRsAuthored: 100,
  totalPRsCommented: 100,
  totalPRsReviewed: 100,
  totalIssuesAuthored: 100,
  totalIssuesCommented: 100,
  rank: { level: "A+", percentile: 40 },
};

describe("Test renderStatsCard", () => {
  it("should render correctly", () => {
    document.body.innerHTML = renderStatsCard(stats);

    expect(document.querySelector(".header")?.textContent).toBe(
      "Anurag Hazra's GitHub Stats",
    );

    expect(document.body.querySelector("svg")?.getAttribute("height")).toBe(
      "195",
    );
    expect(screen.getByTestId("stars").textContent).toBe("100");
    expect(screen.getByTestId("commits").textContent).toBe("200");
    expect(screen.getByTestId("issues").textContent).toBe("300");
    expect(screen.getByTestId("prs").textContent).toBe("400");
    expect(screen.getByTestId("contribs").textContent).toBe("500");
    expect(screen.queryByTestId("card-bg")).toBeInTheDocument();
    expect(screen.queryByTestId("rank-circle")).toBeInTheDocument();

    // Default hidden stats
    expect(screen.queryByTestId("reviews")).not.toBeInTheDocument();
    expect(screen.queryByTestId("discussions_started")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("discussions_answered"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("prs_merged")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("prs_merged_percentage"),
    ).not.toBeInTheDocument();
  });

  it("should have proper name apostrophe", () => {
    document.body.innerHTML = renderStatsCard({ ...stats, name: "Anil Das" });

    expect(document.querySelector(".header")?.textContent).toBe(
      "Anil Das' GitHub Stats",
    );

    document.body.innerHTML = renderStatsCard({ ...stats, name: "Felix" });

    expect(document.querySelector(".header")?.textContent).toBe(
      "Felix's GitHub Stats",
    );
  });

  it("should hide individual stats", () => {
    document.body.innerHTML = renderStatsCard(stats, {
      hide: ["issues", "prs", "contribs"],
    });

    expect(document.body.querySelector("svg")?.getAttribute("height")).toBe(
      "150",
    ); // height should be 150 because we clamped it.

    expect(screen.queryByTestId("stars")).toBeDefined();
    expect(screen.queryByTestId("commits")).toBeDefined();
    expect(screen.queryByTestId("issues")).toBeNull();
    expect(screen.queryByTestId("prs")).toBeNull();
    expect(screen.queryByTestId("contribs")).toBeNull();
    expect(screen.queryByTestId("reviews")).toBeNull();
    expect(screen.queryByTestId("discussions_started")).toBeNull();
    expect(screen.queryByTestId("discussions_answered")).toBeNull();
    expect(screen.queryByTestId("prs_merged")).toBeNull();
    expect(screen.queryByTestId("prs_merged_percentage")).toBeNull();
  });

  it("should show additional stats", () => {
    document.body.innerHTML = renderStatsCard(stats, {
      show: [
        "reviews",
        "discussions_started",
        "discussions_answered",
        "prs_merged",
        "prs_merged_percentage",
      ],
    });

    expect(document.body.querySelector("svg")?.getAttribute("height")).toBe(
      "320",
    );

    expect(screen.queryByTestId("stars")).toBeDefined();
    expect(screen.queryByTestId("commits")).toBeDefined();
    expect(screen.queryByTestId("issues")).toBeDefined();
    expect(screen.queryByTestId("prs")).toBeDefined();
    expect(screen.queryByTestId("contribs")).toBeDefined();
    expect(screen.queryByTestId("reviews")).toBeDefined();
    expect(screen.queryByTestId("discussions_started")).toBeDefined();
    expect(screen.queryByTestId("discussions_answered")).toBeDefined();
    expect(screen.queryByTestId("prs_merged")).toBeDefined();
    expect(screen.queryByTestId("prs_merged_percentage")).toBeDefined();
  });

  it("should hide_rank", () => {
    document.body.innerHTML = renderStatsCard(stats, { hide_rank: true });

    expect(screen.queryByTestId("rank-circle")).not.toBeInTheDocument();
  });

  it("should render with custom width set", () => {
    document.body.innerHTML = renderStatsCard(stats);
    expect(document.querySelector("svg")).toHaveAttribute("width", "450");

    document.body.innerHTML = renderStatsCard(stats, { card_width: 500 });
    expect(document.querySelector("svg")).toHaveAttribute("width", "500");
  });

  it("should render with custom width set and limit minimum width", () => {
    document.body.innerHTML = renderStatsCard(stats, { card_width: 1 });
    expect(document.querySelector("svg")).toHaveAttribute("width", "1");

    // Test default minimum card width without rank circle.
    document.body.innerHTML = renderStatsCard(stats, {
      card_width: 1,
      hide_rank: true,
    });
    expect(document.querySelector("svg")).toHaveAttribute("width", "1");

    // Test minimum card width with rank and icons.
    document.body.innerHTML = renderStatsCard(stats, {
      card_width: 1,
      hide_rank: true,
      show_icons: true,
    });
    expect(document.querySelector("svg")).toHaveAttribute("width", "1");

    // Test minimum card width with icons but without rank.
    document.body.innerHTML = renderStatsCard(stats, {
      card_width: 1,
      hide_rank: false,
      show_icons: true,
    });
    expect(document.querySelector("svg")).toHaveAttribute("width", "1");

    // Test minimum card width without icons or rank.
    document.body.innerHTML = renderStatsCard(stats, {
      card_width: 1,
      hide_rank: false,
      show_icons: false,
    });
    expect(document.querySelector("svg")).toHaveAttribute("width", "1");
  });

  it("should render default colors properly", () => {
    document.body.innerHTML = renderStatsCard(stats);

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag?.textContent ?? "");

    const host = stylesObject[":host"];
    const headerClassStyles = host?.[".header "];
    const statClassStyles = host?.[".stat "];
    const iconClassStyles = host?.[".icon "];

    expect(headerClassStyles?.["fill"]?.trim()).toBe("#2f80ed");
    expect(statClassStyles?.["fill"]?.trim()).toBe("#434d58");
    expect(iconClassStyles?.["fill"]?.trim()).toBe("#4c71f2");
    expect(screen.queryByTestId("card-bg")).toHaveAttribute("fill", "#fffefe");
  });

  it("should render custom colors properly", () => {
    const customColors = {
      title_color: "5a0",
      icon_color: "1b998b",
      text_color: "9991",
      bg_color: "252525",
    };

    document.body.innerHTML = renderStatsCard(stats, { ...customColors });

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag?.innerHTML ?? "");

    const host = stylesObject[":host"];
    const headerClassStyles = host?.[".header "];
    const statClassStyles = host?.[".stat "];
    const iconClassStyles = host?.[".icon "];

    const { title_color, text_color, icon_color } = customColors;

    expect(headerClassStyles?.["fill"]?.trim()).toBe(`#${title_color}`);
    expect(statClassStyles?.["fill"]?.trim()).toBe(`#${text_color}`);
    expect(iconClassStyles?.["fill"]?.trim()).toBe(`#${icon_color}`);
    expect(screen.queryByTestId("card-bg")).toHaveAttribute("fill", "#252525");
  });

  it("should render custom colors with themes", () => {
    document.body.innerHTML = renderStatsCard(stats, {
      title_color: "5a0",
      theme: "radical",
    });

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag?.innerHTML ?? "");

    const host = stylesObject[":host"];
    const headerClassStyles = host?.[".header "];
    const statClassStyles = host?.[".stat "];
    const iconClassStyles = host?.[".icon "];

    expect(headerClassStyles?.["fill"]?.trim()).toBe("#5a0");
    expect(statClassStyles?.["fill"]?.trim()).toBe(
      `#${themes.radical.text_color}`,
    );
    expect(iconClassStyles?.["fill"]?.trim()).toBe(
      `#${themes.radical.icon_color}`,
    );
    expect(screen.queryByTestId("card-bg")).toHaveAttribute(
      "fill",
      `#${themes.radical.bg_color}`,
    );
  });

  it("should render with all the themes", () => {
    Object.entries(themes).forEach(([name, themeData]) => {
      document.body.innerHTML = renderStatsCard(stats, {
        theme: name as keyof typeof themes,
      });

      const styleTag = document.querySelector("style");
      const stylesObject = cssToObject(styleTag?.innerHTML ?? "");

      const host = stylesObject[":host"];
      const headerClassStyles = host?.[".header "];
      const statClassStyles = host?.[".stat "];
      const iconClassStyles = host?.[".icon "];

      const { title_color, text_color, icon_color, bg_color } = themeData;

      expect(headerClassStyles?.["fill"]?.trim()).toBe(`#${title_color}`);
      expect(statClassStyles?.["fill"]?.trim()).toBe(`#${text_color}`);
      expect(iconClassStyles?.["fill"]?.trim()).toBe(`#${icon_color}`);
      const backgroundElement = screen.queryByTestId("card-bg");
      const backgroundElementFill = backgroundElement?.getAttribute("fill");
      expect([`#${bg_color}`, "url(#gradient)"]).toContain(
        backgroundElementFill,
      );
    });
  });

  it("should render custom colors with themes and fallback to default colors if invalid", () => {
    document.body.innerHTML = renderStatsCard(stats, {
      title_color: "invalid color",
      text_color: "invalid color",
      theme: "radical",
    });

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag?.innerHTML ?? "");

    const host = stylesObject[":host"];
    const headerClassStyles = host?.[".header "];
    const statClassStyles = host?.[".stat "];
    const iconClassStyles = host?.[".icon "];

    // invalid overrides fall back to the default theme; the un-overridden
    // icon/bg come from the requested `radical` theme
    const { title_color, text_color } = themes.default;
    const { icon_color, bg_color } = themes.radical;

    expect(headerClassStyles?.["fill"]?.trim()).toBe(`#${title_color}`);
    expect(statClassStyles?.["fill"]?.trim()).toBe(`#${text_color}`);
    expect(iconClassStyles?.["fill"]?.trim()).toBe(`#${icon_color}`);
    expect(screen.queryByTestId("card-bg")).toHaveAttribute(
      "fill",
      `#${bg_color}`,
    );
  });

  it("should render custom ring_color properly", () => {
    const customColors = {
      title_color: "5a0",
      ring_color: "0000ff",
      icon_color: "1b998b",
      text_color: "9991",
      bg_color: "252525",
    };

    document.body.innerHTML = renderStatsCard(stats, { ...customColors });

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag?.innerHTML ?? "");

    const host = stylesObject[":host"];
    const headerClassStyles = host?.[".header "];
    const statClassStyles = host?.[".stat "];
    const iconClassStyles = host?.[".icon "];
    const rankCircleStyles = host?.[".rank-circle "];
    const rankCircleRimStyles = host?.[".rank-circle-rim "];

    const { title_color, text_color, icon_color, ring_color } = customColors;

    expect(headerClassStyles?.["fill"]?.trim()).toBe(`#${title_color}`);
    expect(statClassStyles?.["fill"]?.trim()).toBe(`#${text_color}`);
    expect(iconClassStyles?.["fill"]?.trim()).toBe(`#${icon_color}`);
    expect(rankCircleStyles?.["stroke"]?.trim()).toBe(`#${ring_color}`);
    expect(rankCircleRimStyles?.["stroke"]?.trim()).toBe(`#${ring_color}`);
    expect(screen.queryByTestId("card-bg")).toHaveAttribute("fill", "#252525");
  });

  it("should render icons correctly", () => {
    document.body.innerHTML = renderStatsCard(stats, {
      show_icons: true,
    });

    const stars = screen.getByTestId("stars");
    expect(screen.queryAllByTestId("icon")[0]).toBeDefined();
    expect(stars).toBeDefined();
    // the label
    expect(stars.previousElementSibling).toHaveAttribute("x", "25");
  });

  it("should not have icons if show_icons is false", () => {
    document.body.innerHTML = renderStatsCard(stats, { show_icons: false });

    const stars = screen.getByTestId("stars");
    expect(screen.queryAllByTestId("icon")[0]).not.toBeDefined();
    expect(stars).toBeDefined();
    // the label
    expect(stars.previousElementSibling).not.toHaveAttribute("x");
  });

  it("should auto resize if hide_rank is true", () => {
    document.body.innerHTML = renderStatsCard(stats, {
      hide_rank: true,
    });

    expect(document.body.querySelector("svg")?.getAttribute("width")).toBe(
      "299.9666657447815",
    );
  });

  it("should auto resize if hide_rank is true & custom_title is set", () => {
    document.body.innerHTML = renderStatsCard(stats, {
      hide_rank: true,
      custom_title: "Hello world",
    });

    expect(document.body.querySelector("svg")?.getAttribute("width")).toBe(
      "287",
    );
  });

  it("should render translations", () => {
    document.body.innerHTML = renderStatsCard(stats, { locale: "cn" });
    expect(document.querySelector(".header")?.textContent).toBe(
      "Anurag Hazra 的 GitHub 统计数据",
    );
    expect(
      document.querySelector(
        'g[transform="translate(0, 0)"]>.stagger>.stat.bold',
      )?.textContent,
    ).toMatchInlineSnapshot(`"获标星数:"`);
    expect(
      document.querySelector(
        'g[transform="translate(0, 25)"]>.stagger>.stat.bold',
      )?.textContent,
    ).toMatchInlineSnapshot(`"累计提交总数 (去年):"`);
    expect(
      document.querySelector(
        'g[transform="translate(0, 50)"]>.stagger>.stat.bold',
      )?.textContent,
    ).toMatchInlineSnapshot(`"发起的 PR 总数:"`);
    expect(
      document.querySelector(
        'g[transform="translate(0, 75)"]>.stagger>.stat.bold',
      )?.textContent,
    ).toMatchInlineSnapshot(`"提出的 issue 总数:"`);
    expect(
      document.querySelector(
        'g[transform="translate(0, 100)"]>.stagger>.stat.bold',
      )?.textContent,
    ).toMatchInlineSnapshot(`"贡献的项目数（去年）:"`);
  });

  it("should render without rounding", () => {
    document.body.innerHTML = renderStatsCard(stats, { border_radius: 0 });
    expect(document.querySelector("rect")).toHaveAttribute("rx", "0");
    document.body.innerHTML = renderStatsCard(stats, {});
    expect(document.querySelector("rect")).toHaveAttribute("rx", "4.5");
  });

  it("should shorten values", () => {
    stats.totalCommits = 1999;

    document.body.innerHTML = renderStatsCard(stats);
    expect(screen.getByTestId("commits").textContent).toBe("2k");
    document.body.innerHTML = renderStatsCard(stats, { number_format: "long" });
    expect(screen.getByTestId("commits").textContent).toBe("1999");
    document.body.innerHTML = renderStatsCard(stats, { number_precision: 2 });
    expect(screen.getByTestId("commits").textContent).toBe("2.00k");
    document.body.innerHTML = renderStatsCard(stats, {
      number_format: "long",
      number_precision: 2,
    });
    expect(screen.getByTestId("commits").textContent).toBe("1999");
  });

  it("should render default rank icon with level A+", () => {
    document.body.innerHTML = renderStatsCard(stats, {
      rank_icon: "default",
    });
    const levelRankIcon = screen.getByTestId("level-rank-icon");
    expect(levelRankIcon).toBeDefined();
    expect(levelRankIcon.textContent.trim()).toBe("A+");
  });

  it("should render github rank icon", () => {
    document.body.innerHTML = renderStatsCard(stats, {
      rank_icon: "github",
    });
    expect(screen.queryByTestId("github-rank-icon")).toBeDefined();
  });

  it("should show the rank percentile", () => {
    document.body.innerHTML = renderStatsCard(stats, {
      rank_icon: "percentile",
    });
    const percentileTopHeader = screen.getByTestId("percentile-top-header");
    expect(percentileTopHeader).toBeDefined();
    expect(percentileTopHeader.textContent.trim()).toBe("Top");
    expect(screen.queryByTestId("rank-percentile-text")).toBeDefined();
    expect(screen.getByTestId("percentile-rank-value").textContent.trim()).toBe(
      stats.rank.percentile.toFixed(1) + "%",
    );
  });

  it("should throw error if all stats and rank icon are hidden", () => {
    expect(() =>
      renderStatsCard(stats, {
        hide: ["stars", "commits", "prs", "issues", "contribs"],
        hide_rank: true,
      }),
    ).toThrow(
      new CustomError(
        "Could not render stats card.",
        "Either stats or rank are required.",
      ),
    );
  });
});

describe("test stats API", () => {
  it("should return a permanent error for an invalid color parameter", async () => {
    const result = await statsApi(
      // api handler accepts a partial options object at runtime
      { username: "user", title_color: "not-a-color" } as Parameters<
        typeof statsApi
      >[0],
    );

    expect(result.status).toBe("error - permanent");
    expect(result.content).toContain(
      `Invalid color input for parameter &#34;title_color&#34;`,
    );
  });
});
