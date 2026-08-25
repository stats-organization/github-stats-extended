---
title: Stats Card
---

The stats card shows a summary of your GitHub activity: stars earned, commits, pull requests, issues, contributions and an overall rank.

:::caution[Warning]
By default, the stats card only shows statistics like stars, commits, and pull requests from public repositories. To show private statistics on the stats card, [allow GitHub-Stats-Extended to access your private contributions](/frontend/docs/fork/#private-contributions-support) or [deploy your own instance](/frontend/docs/deploy/).
:::

:::note
Available ranks are S (top 1%), A+ (12.5%), A (25%), A- (37.5%), B+ (50%), B (62.5%), B- (75%), C+ (87.5%) and C (everyone). This ranking scheme is based on the [Japanese academic grading](https://wikipedia.org/wiki/Academic_grading_in_Japan) system. The global percentile is calculated as a weighted sum of percentiles for each statistic (number of commits, pull requests, reviews, issues, stars, and followers), based on the cumulative distribution function of the [exponential](https://wikipedia.org/wiki/exponential_distribution) and the [log-normal](https://wikipedia.org/wiki/Log-normal_distribution) distributions. The implementation can be investigated at [calculateRank.ts](https://github.com/stats-organization/github-stats-extended/blob/master/packages/core/src/calculateRank.ts). The circle around the rank shows 100 minus the global percentile.
:::

## Hiding individual stats

You can pass a query parameter `&hide=` to hide any specific stats with comma-separated values.

> Options: `&hide=stars,commits,prs,issues,contribs`

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&hide=contribs,prs)
```

## Showing additional individual stats

You can pass a query parameter `&show=` to show any specific additional stats with comma-separated values.

> Options: `&show=contributions,reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage,prs_authored,prs_commented,prs_reviewed,issues_authored,issues_commented`

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show=contributions,reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage,prs_authored,prs_commented,prs_reviewed,issues_authored,issues_commented)
```

:::note
`contributions` counts contributions across all years;
the `contribs` item under `&hide=` counts repositories contributed to.
:::

## Showing icons

To enable icons, you can pass `&show_icons=true` in the query param, like so:

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true)
```

## Filtering by repository and owner

To compute your stats for only a specific repository, you can pass a query parameter `&repo=<user_or_organization>/<repository>`. You can also specify a comma-separated list of multiple repositories, e.g. `&repo=userA/repositoryA,organizationB/repositoryB`. And you can select all repositories owned by specific organizations or users by providing a comma-separated list of owners via the `owner` query parameter, e.g. `&owner=userA,organizationB,organizationC`. The `repo` and `owner` filters are supported by the following items: `commits` (when used with `&include_all_commits=true`), `prs_authored`, `prs_commented`, `prs_reviewed`, `issues_authored` and `issues_commented`. Note that most of these items are not displayed by default, but [you can enable them individually](#showing-additional-individual-stats).

(Some of these mentioned items are similar to other items which are included by default, e.g. `issues_authored` is similar to `issues`. The difference is how these values are fetched - [via GraphQL or via REST API](https://github.com/anuraghazra/github-readme-stats/discussions/1770#number-of-commits-is-incorrect). The default items use GraphQL, but filtering by repository works better via REST API.)

Alternatively, you can use the `role` parameter to specify a comma-separated list of [roles](https://docs.github.com/en/graphql/reference/repos#enum-repositoryaffiliation). The stats will include all repositories in which the user has the specified role. By default, only repositories where the user is OWNER will be included, but you could e.g. set `&role=OWNER,ORGANIZATION_MEMBER,COLLABORATOR`. The `role` parameter is supported by all items except the following: `commits` (when used with `&include_all_commits=true`), `prs_authored`, `prs_commented`, `prs_reviewed`, `issues_authored` and `issues_commented`.

## Showing commits count for specified year

You can specify a year and fetch only the commits that were made in that year by passing `&commits_year=YYYY` to the parameter.

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&commits_year=2020)
```

## Options

You can customize the appearance and behavior of the stats card using the [common options](/frontend/docs/customization/common-options/) and the exclusive options listed in the table below.

| Name                     | Description                                                                                                                                                                                                                                                                                                                                                            | Type                            | Default value                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------- |
| `hide`                   | Hides the [specified items](#hiding-individual-stats) from stats.                                                                                                                                                                                                                                                                                                      | string (comma-separated values) | `null`                              |
| `hide_title`             | Hides the title of your stats card.                                                                                                                                                                                                                                                                                                                                    | boolean                         | `false`                             |
| `card_width`             | Sets the card's width manually.                                                                                                                                                                                                                                                                                                                                        | number                          | `500px  (approx.)`                  |
| `hide_rank`              | Hides the rank and automatically resizes the card width.                                                                                                                                                                                                                                                                                                               | boolean                         | `false`                             |
| `rank_icon`              | Shows alternative rank icon (i.e. `github`, `percentile` or `default`).                                                                                                                                                                                                                                                                                                | enum                            | `default`                           |
| `show_icons`             | Shows icons near all stats.                                                                                                                                                                                                                                                                                                                                            | boolean                         | `false`                             |
| `include_all_commits`    | Count total commits instead of just the current year commits.                                                                                                                                                                                                                                                                                                          | boolean                         | `false`                             |
| `line_height`            | Sets the line height between text.                                                                                                                                                                                                                                                                                                                                     | integer                         | `25`                                |
| `exclude_repo`           | Excludes specified repositories. Affects only the count for "Total Stars Earned".                                                                                                                                                                                                                                                                                      | string (comma-separated values) | `null`                              |
| `repo`                   | Count only stats from the specified repositories. Affects only [certain items](#filtering-by-repository-and-owner).                                                                                                                                                                                                                                                    | string (comma-separated values) | `null`                              |
| `owner`                  | Count only stats from the specified organizations or users. Affects only [certain items](#filtering-by-repository-and-owner).                                                                                                                                                                                                                                          | string (comma-separated values) | `null`                              |
| `role`                   | Include repositories where the user has one of the specified [roles](https://docs.github.com/en/graphql/reference/repos#enum-repositoryaffiliation) (OWNER, ORGANIZATION_MEMBER, COLLABORATOR).                                                                                                                                                                        | string (comma-separated values) | `OWNER`                             |
| `custom_title`           | Sets a custom title for the card.                                                                                                                                                                                                                                                                                                                                      | string                          | `<username> GitHub Stats`           |
| `text_bold`              | Uses bold text.                                                                                                                                                                                                                                                                                                                                                        | boolean                         | `true`                              |
| `disable_animations`     | Disables all animations in the card.                                                                                                                                                                                                                                                                                                                                   | boolean                         | `false`                             |
| `ring_color`<sup>1</sup> | Color of the rank circle.                                                                                                                                                                                                                                                                                                                                              | string (hex color)              | `2f80ed`                            |
| `number_format`          | Switches between two available formats for displaying the card values: `short` (i.e. `6.6k`) and `long` (i.e. `6626`).                                                                                                                                                                                                                                                 | enum                            | `short`                             |
| `number_precision`       | Enforce the number of digits after the decimal point for `short` number format. Must be an integer between 0 and 2. Will be ignored for `long` number format.                                                                                                                                                                                                          | integer (0, 1 or 2)             | `null`                              |
| `show`                   | Shows [additional items](#showing-additional-individual-stats) on the stats card (i.e. `contributions`, `reviews`, `discussions_started`, `discussions_answered`, `prs_merged` or `prs_merged_percentage`. And the following, which support the `repo` and `owner` filters: `prs_authored`, `prs_commented`, `prs_reviewed`, `issues_authored` or `issues_commented`). | string (comma-separated values) | `null`                              |
| `commits_year`           | Filters and counts only commits made in the specified year.                                                                                                                                                                                                                                                                                                            | integer _(YYYY)_                | `<current year> (one year to date)` |

<sup>1</sup>: Supports light and dark mode via `ring_color_light` and `ring_color_dark`.

:::caution[Warning]
Custom title should be URI-escaped, as specified in [Percent Encoding](https://en.wikipedia.org/wiki/Percent-encoding) (i.e: `Anurag's GitHub Stats` should become `Anurag%27s%20GitHub%20Stats`). You can use [urlencoder.org](https://www.urlencoder.org/) to help you do this automatically.
:::

:::note
When hide\_rank=`true`, the minimum card width is 270 px + the title length and padding.
:::
