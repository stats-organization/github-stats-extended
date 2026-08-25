---
title: Theming
---

With inbuilt themes, you can customize the look of the card without doing any [manual customization](/frontend/docs/customization/common-options/).

Use `&theme=THEME_NAME` parameter like so :

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=radical)
```

## All inbuilt themes

GitHub Stats Extended comes with several built-in themes (e.g. `radical`, `merko`, `gruvbox`, `tokyonight`, `onedark`, `cobalt`, `synthwave`, `highcontrast`, `dracula`).

<img src="https://res.cloudinary.com/anuraghazra/image/upload/v1595174536/grs-themes_l4ynja.png" alt="GitHub Stats Extended Themes" width="600px"/>

We recommend using `light_github` for light mode and `dark_github` for dark mode. These themes match GitHub's default light and dark themes, ensuring that your stats card looks consistent with the rest of your profile. For repository cards and gist cards we recommend using `light_github_repocard` and `dark_github_repocard`, which use a different icon color.

You can look at a preview for [all available themes](/frontend/docs/customization/themes/) or checkout the [theme config file](https://github.com/stats-organization/github-stats-extended/blob/master/packages/core/src/themes/index.ts). Please note that we paused the addition of new themes to decrease maintenance efforts; all pull requests related to new themes will be closed.

## Light and Dark Mode

<img class="card-preview-light" src="/api?username=anuraghazra&show_icons=true&theme=light_github" alt="Anurag's GitHub stats" />
<img class="card-preview-dark" src="/api?username=anuraghazra&show_icons=true&theme=dark_github" alt="Anurag's GitHub stats" />

There are several methods you can use to create dynamic themes on the client side.

### Use GitHub's media feature (recommended)

You can use [GitHub's media feature](https://github.blog/changelog/2022-05-19-specify-theme-context-for-images-in-markdown-beta/) in HTML to specify which image to display in light or dark mode. This is done using the HTML `<picture>` element in combination with the `prefers-color-scheme` media feature.

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

Use the `theme_light` and `theme_dark` or `*_light` / `*_dark` color parameters to embed both modes in a single card URL. See [Light & Dark Mode Parameters](#light--dark-mode-parameters) below for full details. The card will then display in light mode or dark mode based on your browser / operating system settings.

This approach doesn't use any GitHub-specific features, so it works even when embedding the card outside of GitHub. Or on your GitHub sponsorship page, which doesn't support the other, GitHub-specific approaches.

However, unlike with the "media" feature or the theme context tag, if a user chooses a GitHub theme different from their browser/OS setting, the card will not be able to detect this. Since GitHub re-uploads the cards and serves them from their [CDN](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-anonymized-urls), we can not infer the GitHub theme with this approach, only the browser/OS theme.

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme_light=light_github&theme_dark=dark_github)
```

<details>
<summary>👀 Show example</summary>

![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme_light=light_github&theme_dark=dark_github)

</details>

### Use GitHub's theme context tag

You can use [GitHub's theme context](https://github.blog/changelog/2021-11-24-specify-theme-context-for-images-in-markdown/) tags to switch the theme based on the user's GitHub theme. This is done by appending `#gh-dark-mode-only` or `#gh-light-mode-only` to the end of an image URL. This tag will define whether the image specified in the markdown is only shown to viewers using a light or a dark GitHub theme:

```md
[![Anurag's GitHub stats-Dark](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=dark_github#gh-dark-mode-only)](https://github.com/stats-organization/github-stats-extended#gh-dark-mode-only)
[![Anurag's GitHub stats-Light](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=light_github#gh-light-mode-only)](https://github.com/stats-organization/github-stats-extended#gh-light-mode-only)
```

### Use the transparent theme

We have included a `transparent` theme that has a transparent background. This theme is optimized to look good on GitHub's dark and light default themes. You can enable this theme using the `&theme=transparent` parameter like so:

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=transparent)
```

<details>
<summary>👀 Show example</summary>

![Anurag's GitHub stats](/api?username=anuraghazra&show_icons=true&theme=transparent)

</details>

### Add transparent alpha channel to a themes bg\_color

You can use the `bg_color` parameter to make any of [the available themes](/frontend/docs/customization/themes/) transparent. This is done by setting the `bg_color` to a color with a transparent alpha channel (i.e. `bg_color=00000000`):

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&bg_color=00000000)
```

<details>
<summary>👀 Show example</summary>

![Anurag's GitHub stats](/api?username=anuraghazra&show_icons=true&bg_color=00000000)

</details>

## Light & Dark Mode Parameters

You can use the `theme_light`, `theme_dark`, and `*_light` / `*_dark` color parameters to customize the look of your card for different modes.

**Priority (lowest → highest):**

- default theme
- `theme`
- `theme_light` / `theme_dark`
- general color parameters
- `*_light` / `*_dark` color parameters

for example:

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme_light=light_github&theme_dark=dark_github)
```

You can mix different parameter types. For example, set a light theme and a dark theme, but choose a custom title color:

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme_light=light_github&theme_dark=dark_github&title_color=aabbcc)
```
