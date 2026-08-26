---
title: Top Languages Card
---

The top languages card shows your most frequently used languages.

:::caution[Warning]
By default, the language card shows language results only from public repositories. To include languages used in private repositories, [allow GitHub-Stats-Extended to access your private contributions](/frontend/docs/fork/#private-contributions-support) or [deploy your own instance](/frontend/docs/deploy/).
:::

:::caution[Warning]
This card shows language usage only inside your own non-forked repositories, not depending on who the author of the commits is. It does not include your contributions into another users/organizations repositories. Currently there are no way to get this data from GitHub API. If you want this behavior to be improved you can support [this feature request](https://github.com/orgs/community/discussions/18230) created by [@rickstaa](https://github.com/rickstaa) inside GitHub Community.
:::

:::caution[Warning]
Currently this card shows data only about first 1000 repositories. This is because GitHub API limitations which cause downtimes of public instances (see [#1471](https://github.com/anuraghazra/github-readme-stats/issues/1471)). In future this behavior will be improved by releasing GitHub action or providing environment variables for user's own instances.
:::

## Usage

Copy-paste this code into your readme and change the links.

Endpoint: `api/top-langs?username=anuraghazra`

```md
[![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra)](https://github.com/stats-organization/github-stats-extended)
```

## Options

You can customize the appearance and behavior of the top languages card using the [common options](/frontend/docs/customization/common-options/) and exclusive options listed in the table below.

| Name                            | Description                                                                                                                                                                                     | Type                            | Default value                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------- |
| `hide`                          | Hides the [specified languages](#hide-individual-languages) from card.                                                                                                                          | string (comma-separated values) | `null`                                              |
| `hide_title`                    | Hides the title of your card.                                                                                                                                                                   | boolean                         | `false`                                             |
| `layout`                        | Switches between five available layouts `normal` & `compact` & `donut` & `donut-vertical` & `pie`.                                                                                              | enum                            | `normal`                                            |
| `card_width`                    | Sets the card's width manually.                                                                                                                                                                 | number                          | `300`                                               |
| `langs_count`                   | Shows more languages on the card, between 1-20.                                                                                                                                                 | integer                         | `5` for `normal` and `donut`, `6` for other layouts |
| `exclude_repo`                  | Excludes specified repositories.                                                                                                                                                                | string (comma-separated values) | `null`                                              |
| `role`                          | Include repositories where the user has one of the specified [roles](https://docs.github.com/en/graphql/reference/repos#enum-repositoryaffiliation) (OWNER, ORGANIZATION_MEMBER, COLLABORATOR). | string (comma-separated values) | `OWNER`                                             |
| `custom_title`                  | Sets a custom title for the card.                                                                                                                                                               | string                          | `Most Used Languages`                               |
| `disable_animations`            | Disables all animations in the card.                                                                                                                                                            | boolean                         | `false`                                             |
| `prog_bar_bg_color`<sup>1</sup> | Background color of the bars. (Applies only to `normal` layout.)                                                                                                                                | string (hex color)              | `#ddd`                                              |
| `hide_progress`                 | Uses the compact layout option, hides percentages, and removes the bars.                                                                                                                        | boolean                         | `false`                                             |
| `hide_values`                   | Hides language percentages or bytes while keeping the progress bars or chart.                                                                                                                   | boolean                         | `false`                                             |
| `size_weight`                   | Configures language stats algorithm (see [Language stats algorithm](#language-stats-algorithm)).                                                                                                | integer                         | `1`                                                 |
| `count_weight`                  | Configures language stats algorithm (see [Language stats algorithm](#language-stats-algorithm)).                                                                                                | integer                         | `0`                                                 |
| `stats_format`                  | Switches between two available formats for language's stats `percentages` and `bytes`.                                                                                                          | enum                            | `percentages`                                       |

<sup>1</sup>: Supports light and dark mode via `prog_bar_bg_color_light` and `prog_bar_bg_color_dark`.

:::caution[Warning]
Language names and custom title should be URI-escaped, as specified in [Percent Encoding](https://en.wikipedia.org/wiki/Percent-encoding) (i.e: `c++` should become `c%2B%2B`, `jupyter notebook` should become `jupyter%20notebook`, `Most Used Languages` should become `Most%20Used%20Languages`, etc.) You can use [urlencoder.org](https://www.urlencoder.org/) to help you do this automatically.
:::

## Language stats algorithm

We use the following algorithm to calculate the languages percentages on the language card:

```js
ranking_index = (byte_count ^ size_weight) * (repo_count ^ count_weight);
```

By default, only the byte count is used for determining the languages percentages shown on the language card (i.e. `size_weight=1` and `count_weight=0`). You can, however, use the `&size_weight=` and `&count_weight=` options to weight the language usage calculation. The values must be positive real numbers. [More details about the algorithm can be found here](https://github.com/anuraghazra/github-readme-stats/issues/1600#issuecomment-1046056305).

- `&size_weight=1&count_weight=0` - _(default)_ Orders by byte count.
- `&size_weight=0.5&count_weight=0.5` - _(recommended)_ Uses both byte and repo count for ranking
  - `&size_weight=0&count_weight=1` - Orders by repo count

```md
![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&size_weight=0.5&count_weight=0.5)
```

If the percentages still look wrong to you, these two comments cover most of the reasons why, and are worth reading before opening an issue:

- <https://github.com/anuraghazra/github-readme-stats/issues/136#issuecomment-665164174>
- <https://github.com/anuraghazra/github-readme-stats/issues/136#issuecomment-665172181>

## Exclude individual repositories

You can use the `&exclude_repo=repo1,repo2` parameter to exclude individual repositories.

```md
![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&exclude_repo=github-readme-stats,anuraghazra.github.io)
```

## Hide individual languages

You can use `&hide=language1,language2` parameter to hide individual languages.

```md
![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&hide=javascript,html)
```

Language names with spaces or symbols need to be [percent-encoded](#options), so Jupyter Notebook becomes `&hide=jupyter%20notebook` and C++ becomes `&hide=c%2B%2B`.

## Show more languages

You can use the `&langs_count=` option to increase or decrease the number of languages shown on the card. Valid values are integers between 1 and 20 (inclusive). By default it was set to `5` for `normal` & `donut` and `6` for other layouts.

```md
![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&langs_count=8)
```

## Compact Language Card Layout

You can use the `&layout=compact` option to change the card design.

```md
![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&layout=compact)
```

## Donut Chart Language Card Layout

You can use the `&layout=donut` option to change the card design.

```md
[![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&layout=donut)](https://github.com/stats-organization/github-stats-extended)
```

## Donut Vertical Chart Language Card Layout

You can use the `&layout=donut-vertical` option to change the card design.

```md
[![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&layout=donut-vertical)](https://github.com/stats-organization/github-stats-extended)
```

## Pie Chart Language Card Layout

You can use the `&layout=pie` option to change the card design.

```md
[![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&layout=pie)](https://github.com/stats-organization/github-stats-extended)
```

## Hide Progress Bars

You can use the `&hide_progress=true` option to hide the percentages and the progress bars (layout will be automatically set to `compact`).

```md
![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&hide_progress=true)
```

## Change format of language's stats

You can use the `&stats_format=bytes` option to display the stats in bytes instead of percentage.

```md
![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&stats_format=bytes)
```

## Demo

![Top Langs](/api/top-langs?username=anuraghazra)

### Compact layout

![Top Langs](/api/top-langs?username=anuraghazra&layout=compact)

### Donut Chart layout

[![Top Langs](/api/top-langs?username=anuraghazra&layout=donut)](/api/top-langs?username=anuraghazra&layout=donut)

### Donut Vertical Chart layout

[![Top Langs](/api/top-langs?username=anuraghazra&layout=donut-vertical)](/api/top-langs?username=anuraghazra&layout=donut-vertical)

### Pie Chart layout

[![Top Langs](/api/top-langs?username=anuraghazra&layout=pie)](/api/top-langs?username=anuraghazra&layout=pie)

### Hidden progress bars

[![Top Langs](/api/top-langs?username=anuraghazra&hide_progress=true)](/api/top-langs?username=anuraghazra&hide_progress=true)

### Display bytes instead of percentage

[![Top Langs](/api/top-langs?username=anuraghazra&stats_format=bytes)](/api/top-langs?username=anuraghazra&stats_format=bytes)
