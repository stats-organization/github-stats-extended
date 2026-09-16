import { screen } from "@testing-library/dom";
import { describe, expect, it } from "vitest";

import wakatimeApi from "../src/api/wakatime.js";
import { renderWakatimeCard } from "../src/cards/wakatime.js";

import { wakaTimeData } from "./fetchWakatime.test.js";

describe("Test Render WakaTime Card", () => {
  it("should render correctly", () => {
    const card = renderWakatimeCard(wakaTimeData.data);
    expect(card).toMatchSnapshot();
  });

  it("should render correctly with compact layout", () => {
    const card = renderWakatimeCard(wakaTimeData.data, { layout: "compact" });

    expect(card).toMatchSnapshot();
  });

  it("should render correctly with compact layout when langs_count is set", () => {
    const card = renderWakatimeCard(wakaTimeData.data, {
      layout: "compact",
      langs_count: 2,
    });

    expect(card).toMatchSnapshot();
  });

  it("should hide languages when hide is passed", () => {
    document.body.innerHTML = renderWakatimeCard(wakaTimeData.data, {
      hide: ["YAML", "Other"],
    });

    expect(screen.queryByTestId(/YAML/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId(/Other/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId(/TypeScript/i)).toBeInTheDocument();
  });

  it("should render translations", () => {
    document.body.innerHTML = renderWakatimeCard({}, { locale: "cn" });
    expect(document.querySelector(".header")).toHaveTextContent(
      "WakaTime 周统计",
    );
    expect(
      document.querySelector('g[transform="translate(0, 0)"]>text.stat.bold'),
    ).toHaveTextContent("WakaTime 用户个人资料未公开");
  });

  it("should render without rounding", () => {
    document.body.innerHTML = renderWakatimeCard(wakaTimeData.data, {
      border_radius: 0,
    });
    expect(document.querySelector("rect")).toHaveAttribute("rx", "0");
    document.body.innerHTML = renderWakatimeCard(wakaTimeData.data, {});
    expect(document.querySelector("rect")).toHaveAttribute("rx", "4.5");
  });

  it('should show "no coding activity this week" message when there has not been activity', () => {
    document.body.innerHTML = renderWakatimeCard(
      {
        ...wakaTimeData.data,
        languages: [],
      },
      {},
    );
    expect(document.querySelector(".stat")).toHaveTextContent(
      "No coding activity this week",
    );
  });

  it('should show "no coding activity this week" message when using compact layout and there has not been activity', () => {
    document.body.innerHTML = renderWakatimeCard(
      {
        ...wakaTimeData.data,
        languages: [],
      },
      {
        layout: "compact",
      },
    );
    expect(document.querySelector(".stat")).toHaveTextContent(
      "No coding activity this week",
    );
  });

  it("should render correctly with percent display format", () => {
    const card = renderWakatimeCard(wakaTimeData.data, {
      display_format: "percent",
    });
    expect(card).toMatchSnapshot();
  });

  it("should render correctly with gradient background", () => {
    const card = renderWakatimeCard(wakaTimeData.data, {
      theme: "ambient_gradient",
    });
    expect(card).toMatchSnapshot();
  });
});

describe("test wakatime API", () => {
  it("should return a permanent error for an invalid color parameter", async () => {
    const result = await wakatimeApi(
      // api handler accepts a partial options object at runtime
      {
        username: "user",
        title_color: "not-a-color",
      } as Parameters<typeof wakatimeApi>[0],
    );

    expect(result.status).toBe("error - permanent");
    expect(result.content).toContain(
      `Invalid color input for parameter &#34;title_color&#34;`,
    );
  });
});
