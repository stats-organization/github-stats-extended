---
title: WakaTime Card
---

The WakaTime card shows how much time you have spent coding in each language, taken from your [WakaTime](https://wakatime.com) profile.

:::caution[Warning]
Please be aware that we currently only show data from WakaTime profiles that are public. You therefore have to make sure that **BOTH** `Display code time publicly` and `Display languages, editors, os, categories publicly` are enabled.
:::

:::caution[Warning]
In case you just created a new WakaTime account, then it might take up to 24 hours until your stats will become visible on the WakaTime card.
:::

Change the `?username=` value to your WakaTime username.

```md
[![Alan's WakaTime stats](https://github-stats-extended.vercel.app/api/wakatime?username=alan)](https://wakatime.com/@alan)
```

## Options

You can customize the appearance and behavior of the WakaTime card using the [common options](/frontend/docs/customization/common-options/) and exclusive options listed in the table below.

| Name                 | Description                                                                                                                                                | Type                            | Default value    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------- |
| `hide`               | Hides the languages specified from the card.                                                                                                               | string (comma-separated values) | `null`           |
| `hide_title`         | Hides the title of your card.                                                                                                                              | boolean                         | `false`          |
| `card_width`         | Sets the card's width manually.                                                                                                                            | number                          | `495`            |
| `line_height`        | Sets the line height between text.                                                                                                                         | integer                         | `25`             |
| `hide_progress`      | Hides the progress bar and percentage.                                                                                                                     | boolean                         | `false`          |
| `custom_title`       | Sets a custom title for the card.                                                                                                                          | string                          | `WakaTime Stats` |
| `layout`             | Switches between two available layouts `default` & `compact`.                                                                                              | enum                            | `default`        |
| `langs_count`        | Limits the number of languages on the card, defaults to all reported languages.                                                                            | integer                         | `null`           |
| `api_domain`         | Sets a custom API domain for the card, e.g. to use services like [Hakatime](https://github.com/mujx/hakatime) or [Wakapi](https://github.com/muety/wakapi) | string                          | `wakatime.com`   |
| `display_format`     | Sets the WakaTime stats display format. Choose `time` to display time-based stats or `percent` to show percentages.                                        | enum                            | `time`           |
| `disable_animations` | Disables all animations in the card.                                                                                                                       | boolean                         | `false`          |

:::caution[Warning]
Custom title should be URI-escaped, as specified in [Percent Encoding](https://en.wikipedia.org/wiki/Percent-encoding) (i.e: `WakaTime Stats` should become `WakaTime%20Stats`). You can use [urlencoder.org](https://www.urlencoder.org/) to help you do this automatically.
:::

## Demo

![Alan's WakaTime stats](/api/wakatime?username=alan)

![Alan's WakaTime stats](/api/wakatime?username=alan&card_width=315&hide_progress=true)

### Compact layout

![Alan's WakaTime stats](/api/wakatime?username=alan&layout=compact)
