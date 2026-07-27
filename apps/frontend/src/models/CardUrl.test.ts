import { describe, expect, it } from "vitest";

import { CardType } from "./CardType";
import { cardUrl } from "./CardUrl";

describe("cardUrl", () => {
  it("maps each card type to its path", () => {
    expect(cardUrl(CardType.STATS).toString()).toBe("");
    expect(cardUrl(CardType.TOP_LANGS).toString()).toBe("/top-langs");
    expect(cardUrl(CardType.PIN).toString()).toBe("/pin");
    expect(cardUrl(CardType.GIST).toString()).toBe("/gist");
    expect(cardUrl(CardType.WAKATIME).toString()).toBe("/wakatime");
  });

  it("builds a suffix with params", () => {
    expect(
      cardUrl(CardType.TOP_LANGS).username("john").langsCount(4).toString(),
    ).toBe("/top-langs?username=john&langs_count=4");
  });

  it("derives a download filename per card", () => {
    expect(cardUrl(CardType.STATS).username("john").filename()).toBe(
      "john_card",
    );
    expect(cardUrl(CardType.TOP_LANGS).username("john").filename()).toBe(
      "john_card",
    );
    expect(cardUrl(CardType.PIN).repo("owner/repo1").filename()).toBe(
      "owner/repo1_card",
    );
    expect(cardUrl(CardType.GIST).gistId("abc").filename()).toBe("gist_card");
    expect(cardUrl(CardType.WAKATIME).username("waka").filename()).toBe(
      "waka_card",
    );
  });

  it("is immutable: setters return new instances", () => {
    const base = cardUrl(CardType.STATS).username("john");
    const withIcons = base.showIcons();

    expect(base.toString()).toBe("?username=john");
    expect(withIcons.toString()).toBe("?username=john&show_icons=true");
  });

  it("sets values verbatim (callers decide whether to include a param)", () => {
    // no dropping of empty/false — the value is set as given
    expect(cardUrl(CardType.STATS).username("").toString()).toBe("?username=");
  });

  it("encodes special characters", () => {
    // spaces as %20 (not +), commas as %2C
    expect(
      cardUrl(CardType.STATS)
        .username("john")
        .customTitle("My Stats")
        .toString(),
    ).toBe("?username=john&custom_title=My%20Stats");
    expect(
      cardUrl(CardType.STATS).username("john").show("a,b,c").toString(),
    ).toBe("?username=john&show=a%2Cb%2Cc");
  });

  it("builds an absolute api url with the given host", () => {
    expect(
      cardUrl(CardType.STATS)
        .username("john")
        .client("wizard")
        .toApiUrl("example.com"),
    ).toBe("https://example.com/api?username=john&client=wizard");
  });

  it("applies a theme via the universal setter", () => {
    expect(
      cardUrl(CardType.STATS).username("john").theme("github_dark").toString(),
    ).toBe("?username=john&theme=github_dark");
  });
});
