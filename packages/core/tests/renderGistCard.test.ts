import { screen } from "@testing-library/dom";
import { cssToObject } from "@uppercod/css-to-object";
import { describe, expect, it } from "vitest";

import gistApi from "../src/api/gist.js";
import { renderGistCard } from "../src/cards/gist.js";
import type { GistData } from "../src/fetchers/types.js";
import { themes } from "../src/themes/index.js";

const data: GistData = {
  name: "test",
  nameWithOwner: "anuraghazra/test",
  description: "Small <b>test</b> repository with different Python programs.",
  language: "Python",
  starsCount: 163,
  forksCount: 19,
};

describe("test renderGistCard", () => {
  it("should render correctly", () => {
    document.body.innerHTML = renderGistCard(data);

    const header = document.querySelector(".header");

    expect(header).toHaveTextContent("test");
    expect(header).not.toHaveTextContent("anuraghazra");
    expect(document.querySelector(".description")).toHaveTextContent(
      // Between "Python" and "programs" there is a line break caused by: </tspan><tspan dy="1.2em" x="25">
      "Small <b>test</b> repository with different Pythonprograms.",
    );
    expect(screen.queryByTestId("starsCount")).toHaveTextContent("163");
    expect(screen.queryByTestId("forksCount")).toHaveTextContent("19");
    expect(screen.queryByTestId("lang-name")).toHaveTextContent("Python");
    expect(screen.queryByTestId("lang-color")).toHaveAttribute(
      "fill",
      "#3572A5",
    );
  });

  it("should display username in title if show_owner is true", () => {
    document.body.innerHTML = renderGistCard(data, { show_owner: true });
    const header = document.querySelector(".header");
    expect(header).toHaveTextContent("anuraghazra/test");
  });

  it("should trim header if name is too long", () => {
    document.body.innerHTML = renderGistCard({
      ...data,
      name: "some-really-long-repo-name-for-test-purposes",
    });
    const header = document.querySelector(".header");
    expect(header).toHaveTextContent("some-really-long-repo-name-for-test...");
  });

  it("should trim description if description is too long", () => {
    document.body.innerHTML = renderGistCard({
      ...data,
      description:
        "The quick brown fox jumps over the lazy dog is an English-language pangram—a sentence that contains all of the letters of the English alphabet",
    });
    const lines = document.querySelectorAll(".description tspan");
    expect(lines[0]).toHaveTextContent(
      "The quick brown fox jumps over the lazy dog is an",
    );
    expect(lines[1]).toHaveTextContent(
      "English-language pangram—a sentence that contains all of",
    );
  });

  it("should respect browser_rendering=true", () => {
    document.body.innerHTML = renderGistCard(
      {
        ...data,
        description:
          "The <b>quick</b> brown fox jumps over the lazy dog is an English-language pangram—a sentence that contains all of the letters of the English alphabet",
      },
      { browser_rendering: true },
    );
    // The full description stays in the DOM; the CSS line-clamp on the
    // foreignObject's inner div is what visually truncates the overflow.
    const description = document.querySelector<HTMLElement>(".description");
    expect(description).toHaveTextContent(
      "The <b>quick</b> brown fox jumps over the lazy dog is an English-language pangram—a sentence that contains all of the letters of the English alphabet",
    );
    expect(
      Number(description?.style.getPropertyValue("--lines")),
    ).toBeGreaterThan(0);
  });

  it("should not trim description if it is short", () => {
    document.body.innerHTML = renderGistCard({
      ...data,
      description: "Small text should not trim",
    });
    expect(document.querySelector(".description")).toHaveTextContent(
      "Small text should not trim",
    );
  });

  it("should render emojis in description", () => {
    document.body.innerHTML = renderGistCard({
      ...data,
      description: "This is a test gist description with :heart: emoji.",
    });
    expect(document.querySelector(".description")).toHaveTextContent(
      "This is a test gist description with ❤️ emoji.",
    );
  });

  it("should render custom colors properly", () => {
    const customColors = {
      title_color: "5a0",
      icon_color: "1b998b",
      text_color: "9991",
      bg_color: "252525",
    };

    document.body.innerHTML = renderGistCard(data, {
      ...customColors,
    });

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag?.innerHTML ?? "");

    const host = stylesObject[":host"];
    const headerClassStyles = host?.[".header "];
    const descClassStyles = host?.[".description "];
    const iconClassStyles = host?.[".icon "];

    const { title_color, text_color, icon_color } = customColors;

    expect(headerClassStyles?.["fill"]?.trim()).toBe(`#${title_color}`);
    expect(descClassStyles?.["fill"]?.trim()).toBe(`#${text_color}`);
    expect(iconClassStyles?.["fill"]?.trim()).toBe(`#${icon_color}`);
    expect(screen.queryByTestId("card-bg")).toHaveAttribute("fill", "#252525");
  });

  it("should render with all the themes", () => {
    Object.entries(themes).forEach(([name, themeData]) => {
      document.body.innerHTML = renderGistCard(data, {
        theme: name as keyof typeof themes,
      });

      const styleTag = document.querySelector("style");
      const stylesObject = cssToObject(styleTag?.innerHTML ?? "");

      const host = stylesObject[":host"];
      const headerClassStyles = host?.[".header "];
      const descClassStyles = host?.[".description "];
      const iconClassStyles = host?.[".icon "];

      const { title_color, text_color, icon_color, bg_color } = themeData;

      expect(headerClassStyles?.["fill"]?.trim()).toBe(`#${title_color}`);
      expect(descClassStyles?.["fill"]?.trim()).toBe(`#${text_color}`);
      expect(iconClassStyles?.["fill"]?.trim()).toBe(`#${icon_color}`);

      const backgroundElement = screen.queryByTestId("card-bg");
      const backgroundElementFill = backgroundElement?.getAttribute("fill");
      expect([`#${bg_color}`, "url(#gradient)"]).toContain(
        backgroundElementFill,
      );
    });
  });

  it("should render custom colors with themes", () => {
    document.body.innerHTML = renderGistCard(data, {
      title_color: "5a0",
      theme: "radical",
    });

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag?.innerHTML ?? "");

    const host = stylesObject[":host"];
    const headerClassStyles = host?.[".header "];
    const descClassStyles = host?.[".description "];
    const iconClassStyles = host?.[".icon "];

    expect(headerClassStyles?.["fill"]?.trim()).toBe("#5a0");
    expect(descClassStyles?.["fill"]?.trim()).toBe(
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

  it("should render custom colors with themes and fallback to default colors if invalid", () => {
    document.body.innerHTML = renderGistCard(data, {
      title_color: "invalid color",
      text_color: "invalid color",
      theme: "radical",
    });

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag?.innerHTML ?? "");

    const host = stylesObject[":host"];
    const headerClassStyles = host?.[".header "];
    const descClassStyles = host?.[".description "];
    const iconClassStyles = host?.[".icon "];

    // invalid overrides fall back to the default theme; the un-overridden
    // icon/bg come from the requested `radical` theme
    const { title_color, text_color } = themes.default;
    const { icon_color, bg_color } = themes.radical;

    expect(headerClassStyles?.["fill"]?.trim()).toBe(`#${title_color}`);
    expect(descClassStyles?.["fill"]?.trim()).toBe(`#${text_color}`);
    expect(iconClassStyles?.["fill"]?.trim()).toBe(`#${icon_color}`);
    expect(screen.queryByTestId("card-bg")).toHaveAttribute(
      "fill",
      `#${bg_color}`,
    );
  });

  it("should not render star count or fork count if either of the are zero", () => {
    document.body.innerHTML = renderGistCard({
      ...data,
      starsCount: 0,
    });

    expect(screen.queryByTestId("starsCount")).toBeNull();
    expect(screen.queryByTestId("forksCount")).toBeInTheDocument();

    document.body.innerHTML = renderGistCard({
      ...data,
      starsCount: 1,
      forksCount: 0,
    });

    expect(screen.queryByTestId("starsCount")).toBeInTheDocument();
    expect(screen.queryByTestId("forksCount")).toBeNull();

    document.body.innerHTML = renderGistCard({
      ...data,
      starsCount: 0,
      forksCount: 0,
    });

    expect(screen.queryByTestId("starsCount")).toBeNull();
    expect(screen.queryByTestId("forksCount")).toBeNull();
  });

  it("should render without rounding", () => {
    document.body.innerHTML = renderGistCard(data, {
      border_radius: 0,
    });
    expect(document.querySelector("rect")).toHaveAttribute("rx", "0");
    document.body.innerHTML = renderGistCard(data, {});
    expect(document.querySelector("rect")).toHaveAttribute("rx", "4.5");
  });

  it("should fallback to default description", () => {
    document.body.innerHTML = renderGistCard({
      ...data,
      description: null,
    });
    expect(document.querySelector(".description")).toHaveTextContent(
      "No description provided",
    );
  });
});

describe("test gist API", () => {
  it("should return permanent error for invalid color input", async () => {
    const result = await gistApi(
      // api handler accepts a partial options object at runtime
      { id: "abc123", title_color: "not-a-color" } as Parameters<
        typeof gistApi
      >[0],
    );

    expect(result.status).toBe("error - permanent");
    expect(result.content).toContain(
      `Invalid color input for parameter &#34;title_color&#34;`,
    );
  });
});
