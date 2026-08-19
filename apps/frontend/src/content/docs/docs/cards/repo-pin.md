---
title: Repo Pin Card
---

GitHub extra pins allow you to pin more than 6 repositories in your profile using a GitHub profile readme.

Yay! You are no longer limited to 6 pinned repositories.

## Usage

Copy-paste this code into your readme and change the links.

Endpoint: `api/pin?username=anuraghazra&repo=type-trident`

```md
[![Readme Card](https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=type-trident)](https://github.com/anuraghazra/type-trident)
```

## Options

You can customize the appearance and behavior of the pinned repository card using the [common options](/frontend/docs/customization/common-options/) and exclusive options listed in the table below.

| Name                      | Description                                                                                                                                                                                                                                      | Type                            | Default value      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ------------------ |
| `show_owner`              | Shows the repo's owner name.                                                                                                                                                                                                                     | boolean                         | `false`            |
| `browser_rendering`       | Compute text wrapping of repository description natively in the browser, instead of computing it server-side.                                                                                                                                    | boolean                         | `false`            |
| `description_lines_count` | Manually set the number of lines for the description. Specified value will be clamped between 1 and 3. If this parameter is not specified, the number of lines will be automatically adjusted according to the actual length of the description. | number                          | `null`             |
| `card_width`              | Sets the card's width manually.                                                                                                                                                                                                                  | number                          | `400px  (approx.)` |
| `show_icons`              | Shows icons near all stats enabled via `show`.                                                                                                                                                                                                   | boolean                         | `true`             |
| `line_height`             | Sets the line height between stats enabled via `show`.                                                                                                                                                                                           | integer                         | `22`               |
| `text_bold`               | Uses bold text for all stats enabled via `show`.                                                                                                                                                                                                 | boolean                         | `false`            |
| `number_format`           | Switches between two available formats for displaying the numbers for all stats enabled via `show`: `short` (i.e. `6.6k`) and `long` (i.e. `6626`).                                                                                              | enum                            | `short`            |
| `show`                    | Shows [additional items](/frontend/docs/cards/stats/#showing-additional-individual-stats) on stats card (i.e. `prs_authored`, `prs_commented`, `prs_reviewed`, `issues_authored` or `issues_commented`).                                         | string (comma-separated values) | `null`             |

## Demo

![Readme Card](https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats)

Use [show\_owner](#options) query option to include the repo's owner username:

![Readme Card](https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats&show_owner=true)

Use [show](#options) query option to display the user's contributions to the repository:

![Readme Card](https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats&show=prs_authored,prs_commented,prs_reviewed,issues_authored,issues_commented)

You can also specify the `repo` parameter in the form `<user_or_organization>/<repository>` to pin a repository from any user or organization, not just your own. This allows you to showcase repositories you contributed to, regardless of ownership.

![Readme Card](https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=statykjs/statyk&show_owner=true&show=prs_authored,prs_commented,prs_reviewed,issues_authored,issues_commented)
