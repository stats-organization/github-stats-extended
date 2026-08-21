---
title: Theming
---

With inbuilt themes, you can customize the look of the card without doing any [manual customization](/frontend/docs/customization/common-options/).

Use `&theme=THEME_NAME` parameter like so :

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=radical)
```

## All inbuilt themes

GitHub Stats Extended comes with several built-in themes (e.g. `dark`, `radical`, `merko`, `gruvbox`, `tokyonight`, `onedark`, `cobalt`, `synthwave`, `highcontrast`, `dracula`).

<img src="https://res.cloudinary.com/anuraghazra/image/upload/v1595174536/grs-themes_l4ynja.png" alt="GitHub Stats Extended Themes" width="600px"/>

You can look at a preview for [all available themes](/frontend/docs/customization/themes/) or checkout the [theme config file](https://github.com/stats-organization/github-stats-extended/blob/master/packages/core/src/themes/index.ts). Please note that we paused the addition of new themes to decrease maintenance efforts; all pull requests related to new themes will be closed.

## Responsive Card Theme

<picture>
  <source
    srcset="https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=dark"
    media="(prefers-color-scheme: dark)"
  />
  <img src="https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=default" alt="Anurag's GitHub stats" />
</picture>

Since GitHub will re-upload the cards and serve them from their [CDN](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-anonymized-urls), we can not infer the browser/GitHub theme on the server side. There are, however, four methods you can use to create dynamics themes on the client side.

### Use GitHub's new media feature (recommended)

You can use [GitHub's new media feature](https://github.blog/changelog/2022-05-19-specify-theme-context-for-images-in-markdown-beta/) in HTML to specify whether to display images for light or dark themes. This is done using the HTML `<picture>` element in combination with the `prefers-color-scheme` media feature.

<!-- prettier-ignore -->
```html
<picture>
  <source
    srcset="https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=dark"
    media="(prefers-color-scheme: dark)"
  />
  <!-- light mode -->
  <img src="https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true" />
</picture>
```

<details>
<summary>👀 Show example</summary>

<picture>
  <source
    srcset="https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=dark"
    media="(prefers-color-scheme: dark)"
  />
  <!-- light mode -->
  <img src="https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true" />
</picture>

</details>

### Use GitHub's theme context tag

You can use [GitHub's theme context](https://github.blog/changelog/2021-11-24-specify-theme-context-for-images-in-markdown/) tags to switch the theme based on the user GitHub theme automatically. This is done by appending `#gh-dark-mode-only` or `#gh-light-mode-only` to the end of an image URL. This tag will define whether the image specified in the markdown is only shown to viewers using a light or a dark GitHub theme:

```md
[![Anurag's GitHub stats-Dark](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=dark#gh-dark-mode-only)](https://github.com/stats-organization/github-stats-extended#gh-dark-mode-only)
[![Anurag's GitHub stats-Light](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=default#gh-light-mode-only)](https://github.com/stats-organization/github-stats-extended#gh-light-mode-only)
```

:::note
`#gh-dark-mode-only` and `#gh-light-mode-only` only work on GitHub. So there is no live example here.
:::

### Use the transparent theme

We have included a `transparent` theme that has a transparent background. This theme is optimized to look good on GitHub's dark and light default themes. You can enable this theme using the `&theme=transparent` parameter like so:

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=transparent)
```

<details>
<summary>👀 Show example</summary>

![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&theme=transparent)

</details>

### Add transparent alpha channel to a themes bg\_color

You can use the `bg_color` parameter to make any of [the available themes](/frontend/docs/customization/themes/) transparent. This is done by setting the `bg_color` to a color with a transparent alpha channel (i.e. `bg_color=00000000`):

```md
![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&bg_color=00000000)
```

<details>
<summary>👀 Show example</summary>

![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&show_icons=true&bg_color=00000000)

</details>
