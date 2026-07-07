import { CardType } from "./CardType";

/**
 * Immutable, per-card builders for the query-string suffix of a card URL.
 *
 * Each card type accepts a different set of query params, so there is one
 * builder class per card exposing only the params that card supports. Setters
 * return a new instance (immutable); {@link CardUrlBase.toString} produces the
 * relative suffix (e.g. `/top-langs?username=foo&langs_count=4`).
 *
 * Which card accepts which param:
 *
 * | param                   | STATS | TOP_LANGS | PIN | GIST | WAKATIME |
 * | ----------------------- | :---: | :-------: | :-: | :--: | :------: |
 * | username                |   ✓   |     ✓     |  ✓  |      |    ✓     |
 * | hide_title              |   ✓   |     ✓     |     |      |    ✓     |
 * | custom_title            |   ✓   |           |     |      |    ✓     |
 * | rank_icon               |   ✓   |           |     |      |          |
 * | show                    |   ✓   |           |     |      |          |
 * | show_icons              |   ✓   |           |     |      |          |
 * | include_all_commits     |   ✓   |           |     |      |          |
 * | hide_values             |       |     ✓     |     |      |          |
 * | layout                  |       |     ✓     |     |      |    ✓     |
 * | langs_count             |       |     ✓     |     |      |    ✓     |
 * | repo                    |       |           |  ✓  |      |          |
 * | description_lines_count |       |           |  ✓  |      |          |
 * | show_owner              |       |           |  ✓  |  ✓   |          |
 * | id (gist)               |       |           |     |  ✓   |          |
 * | display_format          |       |           |     |      |    ✓     |
 * | card_width              |       |           |     |      |    ✓     |
 * | theme                   |   ✓   |     ✓     |  ✓  |  ✓   |    ✓     |
 * | client                  |   ✓   |     ✓     |  ✓  |  ✓   |    ✓     |
 * | disable_animations      |   ✓   |     ✓     |  ✓  |  ✓   |    ✓     |
 */
abstract class CardUrlBase<S extends CardUrlBase<S>> {
  protected constructor(
    protected readonly params: ReadonlyMap<string, string>,
  ) {}

  /** Build a new instance of the concrete card builder. */
  protected abstract create(params: ReadonlyMap<string, string>): S;

  /** Path segment appended after `/api` (empty for the stats card). */
  protected abstract readonly path: string;

  /**
   * The single place that produces a new instance. Sets the param verbatim;
   * callers decide whether a param should be included (see `buildCardUrl`).
   */
  protected with(key: string, value: string | number | boolean): S {
    const next = new Map(this.params);
    next.set(key, String(value));
    return this.create(next);
  }

  // ---- universal setters (valid on every card) ----
  theme(v: string): S {
    return this.with("theme", v);
  }
  client(v: string): S {
    return this.with("client", v);
  }
  disableAnimations(v = true): S {
    return this.with("disable_animations", v);
  }

  /** Suggested download filename (without extension) for this card. */
  abstract filename(): string;

  /** Relative suffix, e.g. `/top-langs?username=foo&langs_count=4`. */
  toString(): string {
    const search = new URLSearchParams();
    for (const [k, v] of this.params) {
      search.set(k, v);
    }
    // URLSearchParams encodes spaces as `+`; normalize to `%20` for parity with
    // encodeURIComponent and universal query parsing.
    const qs = search.toString().replace(/\+/g, "%20");
    return `${this.path}${qs ? `?${qs}` : ""}`;
  }

  /**
   * Absolute URL the `<img>`/SvgInline loads. `host` is passed in so this
   * module stays free of the `window`-dependent constants.
   */
  toApiUrl(host: string): string {
    return `https://${host}/api${this.toString()}`;
  }
}

class StatsCardUrl extends CardUrlBase<StatsCardUrl> {
  protected readonly path = "";
  protected create(p: ReadonlyMap<string, string>) {
    return new StatsCardUrl(p);
  }
  static create() {
    return new StatsCardUrl(new Map());
  }

  filename() {
    return `${this.params.get("username") ?? ""}_card`;
  }

  username(v: string) {
    return this.with("username", v);
  }
  rankIcon(v: string) {
    return this.with("rank_icon", v);
  }
  hideTitle(v = true) {
    return this.with("hide_title", v);
  }
  customTitle(v: string) {
    return this.with("custom_title", v);
  }
  show(v: string) {
    return this.with("show", v);
  }
  showIcons(v = true) {
    return this.with("show_icons", v);
  }
  includeAllCommits(v = true) {
    return this.with("include_all_commits", v);
  }
}

class TopLangsCardUrl extends CardUrlBase<TopLangsCardUrl> {
  protected readonly path = "/top-langs";
  protected create(p: ReadonlyMap<string, string>) {
    return new TopLangsCardUrl(p);
  }
  static create() {
    return new TopLangsCardUrl(new Map());
  }

  filename() {
    return `${this.params.get("username") ?? ""}_card`;
  }

  username(v: string) {
    return this.with("username", v);
  }
  layout(v: string) {
    return this.with("layout", v);
  }
  hideTitle(v = true) {
    return this.with("hide_title", v);
  }
  langsCount(v: number) {
    return this.with("langs_count", v);
  }
  hideValues(v = true) {
    return this.with("hide_values", v);
  }
}

class PinCardUrl extends CardUrlBase<PinCardUrl> {
  protected readonly path = "/pin";
  protected create(p: ReadonlyMap<string, string>) {
    return new PinCardUrl(p);
  }
  static create() {
    return new PinCardUrl(new Map());
  }

  filename() {
    return `${this.params.get("repo") ?? ""}_card`;
  }

  username(v: string) {
    return this.with("username", v);
  }
  repo(v: string) {
    return this.with("repo", v);
  }
  showOwner(v = true) {
    return this.with("show_owner", v);
  }
  descriptionLines(v: number) {
    return this.with("description_lines_count", v);
  }
}

class GistCardUrl extends CardUrlBase<GistCardUrl> {
  protected readonly path = "/gist";
  protected create(p: ReadonlyMap<string, string>) {
    return new GistCardUrl(p);
  }
  static create() {
    return new GistCardUrl(new Map());
  }

  filename() {
    return "gist_card";
  }

  gistId(v: string) {
    return this.with("id", v);
  }
  showOwner(v = true) {
    return this.with("show_owner", v);
  }
}

class WakatimeCardUrl extends CardUrlBase<WakatimeCardUrl> {
  protected readonly path = "/wakatime";
  protected create(p: ReadonlyMap<string, string>) {
    return new WakatimeCardUrl(p);
  }
  static create() {
    return new WakatimeCardUrl(new Map());
  }

  filename() {
    return `${this.params.get("username") ?? ""}_card`;
  }

  username(v: string) {
    return this.with("username", v);
  }
  layout(v: string) {
    return this.with("layout", v);
  }
  hideTitle(v = true) {
    return this.with("hide_title", v);
  }
  customTitle(v: string) {
    return this.with("custom_title", v);
  }
  langsCount(v: number) {
    return this.with("langs_count", v);
  }
  displayFormat(v: string) {
    return this.with("display_format", v);
  }
  cardWidth(v: number) {
    return this.with("card_width", v);
  }
}

/** Any card-URL builder, regardless of card type (all share the universal API). */
export type CardUrlBuilder =
  StatsCardUrl | TopLangsCardUrl | PinCardUrl | GistCardUrl | WakatimeCardUrl;

/**
 * Create a card-URL builder typed to the given card, so only the params that
 * card supports are in scope (e.g. `cardUrl(CardType.GIST)` has no
 * `langsCount`).
 */
export function cardUrl(c: typeof CardType.STATS): StatsCardUrl;
export function cardUrl(c: typeof CardType.TOP_LANGS): TopLangsCardUrl;
export function cardUrl(c: typeof CardType.PIN): PinCardUrl;
export function cardUrl(c: typeof CardType.GIST): GistCardUrl;
export function cardUrl(c: typeof CardType.WAKATIME): WakatimeCardUrl;
export function cardUrl(c: CardType) {
  switch (c) {
    case CardType.STATS:
      return StatsCardUrl.create();
    case CardType.TOP_LANGS:
      return TopLangsCardUrl.create();
    case CardType.PIN:
      return PinCardUrl.create();
    case CardType.GIST:
      return GistCardUrl.create();
    case CardType.WAKATIME:
      return WakatimeCardUrl.create();
    default:
      c satisfies never;
      throw new Error(`unknown card type: ${c as string}`);
  }
}
