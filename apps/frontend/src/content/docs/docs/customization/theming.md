---
title: Theming
---

With inbuilt themes, you can customize the look of the card without doing any [manual customization](/frontend/docs/customization/common-options/).

Pass `&theme=THEME_NAME`:

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=radical)
```

## All inbuilt themes

GitHub Stats Extended comes with several built-in themes (e.g. `radical`, `merko`, `gruvbox`, `tokyonight`, `onedark`, `cobalt`, `synthwave`, `highcontrast`, `dracula`).

<img src="https://res.cloudinary.com/anuraghazra/image/upload/v1595174536/grs-themes_l4ynja.png" alt="GitHub Stats Extended Themes" width="600px"/>

:::tip
Use `light_github` and `dark_github` to match GitHub's own light and dark themes. For repository and gist cards use `light_github_repocard` and `dark_github_repocard`, which differ only in icon color.
:::

Preview [all available themes](/frontend/docs/customization/themes/) or read the [theme config file](https://github.com/stats-organization/github-stats-extended/blob/master/packages/core/src/themes/index.ts). We have paused the addition of new themes to reduce maintenance effort; pull requests adding one will be closed.

## Light and Dark Mode

![Anurag's GitHub stats](/api?username=anuraghazra&show_icons=true)

There are several ways to switch a card between modes on the client side.

### Use GitHub's media feature (recommended)

[GitHub's media feature](https://github.blog/changelog/2022-05-19-specify-theme-context-for-images-in-markdown-beta/) picks the image from a `<picture>` element using the `prefers-color-scheme` media query.

<!-- prettier-ignore -->
```html
<picture>
  <source
    srcset="https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=dark_github"
    media="(prefers-color-scheme: dark)"
  />
  <!-- light mode -->
  <img src="https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=light_github" />
</picture>
```

### Set light and dark mode in one card

`theme_light` / `theme_dark` and the `*_light` / `*_dark` color parameters put both modes in a single card URL, which then follows the viewer's browser or OS setting. See [Light & Dark Mode Parameters](#light--dark-mode-parameters) for the details.

This approach is not GitHub-specific, so it also works outside GitHub — including GitHub sponsorship pages, where the other approaches don't work.

:::note
GitHub serves the card from its [CDN](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-anonymized-urls), so a GitHub theme that differs from the browser/OS setting cannot be detected by this approach.
:::

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme_light=light_github&theme_dark=dark_github)
```

<details>
<summary>👀 Show example</summary>

![Anurag's GitHub stats](/api?username=anuraghazra&show_icons=true&theme_light=light_github&theme_dark=dark_github)

</details>

### Light & Dark Mode Parameters

These parameters style each mode separately.

**Priority (lowest → highest):**

- default theme
- `theme`
- `theme_light` / `theme_dark`
- general color parameters
- `*_light` / `*_dark` color parameters

For example:

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme_light=light_github&theme_dark=dark_github)
```

Parameter types can be mixed — for example a light and a dark theme, plus one fixed title color:

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme_light=light_github&theme_dark=dark_github&title_color=aabbcc)
```

### Use GitHub's theme context tag

Appending [`#gh-dark-mode-only` or `#gh-light-mode-only`](https://github.blog/changelog/2021-11-24-specify-theme-context-for-images-in-markdown/) to an image URL shows it only to viewers on that GitHub mode:

```md
[![Anurag's GitHub stats-Dark](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=dark_github#gh-dark-mode-only)](https://github.com/stats-organization/github-stats-extended#gh-dark-mode-only)
[![Anurag's GitHub stats-Light](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=light_github#gh-light-mode-only)](https://github.com/stats-organization/github-stats-extended#gh-light-mode-only)
```

### Use the transparent theme

The `transparent` theme has no background, so it sits well on GitHub's light and dark modes:

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=transparent)
```

<details>
<summary>👀 Show example</summary>

![Anurag's GitHub stats](/api?username=anuraghazra&show_icons=true&theme=transparent)

</details>

### Add transparent alpha channel to a themes bg\_color

Any of [the available themes](/frontend/docs/customization/themes/) turns transparent when `bg_color` carries an alpha channel (i.e. `bg_color=00000000`):

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&bg_color=00000000)
```

<details>
<summary>👀 Show example</summary>

<!-- set theme=default explicitly so rehypeCardImages.ts doesn't create a light and a dark version -->

![Anurag's GitHub stats](/api?username=anuraghazra&show_icons=true&bg_color=00000000&theme=default)

</details>
