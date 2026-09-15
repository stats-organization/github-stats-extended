---
title: GitHub Stats Extended
---

Dynamically generate GitHub stats for your READMEs.

![Anurag's GitHub stats](/api?username=anuraghazra)

GitHub-Stats-Extended is the [extended, actively maintained successor](/frontend/docs/fork/) of [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). It generates [various stats cards](#card-types) about your GitHub contributions, your top languages and more. You can [customize](/frontend/docs/customization/common-options/) the cards via multiple parameters.

## Quick Start

Copy and paste this into your markdown, then change the `?username=` value to your GitHub username:

```md
[![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra)](https://github.com/stats-organization/github-stats-extended)
```

As a more comfortable alternative, use the [card wizard](/frontend) to configure your card visually. Then copy the generated markdown into your [GitHub profile README](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme#adding-a-profile-readme).

## Migration from github-readme-stats

To migrate from [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) you only need to change the domain from `github-readme-stats.vercel.app` to `github-stats-extended.vercel.app`:

```diff
- https://github-readme-stats.vercel.app/api?username=octocat&theme=radical
+ https://github-stats-extended.vercel.app/api?username=octocat&theme=radical
```

GitHub-Stats-Extended aims to be fully compatible with github-readme-stats. For details see [Compatibility Notes](/frontend/docs/fork/#compatibility-notes).

## Card Types

- Show your GitHub statistics:

  ![Anurag's GitHub stats](/api?username=anuraghazra)

- ...your top languages...:

  ![Top Langs](/api/top-langs?username=anuraghazra&langs_count=4)

- ...and development time:

  [![Alan's WakaTime stats](/api/wakatime?username=alan&langs_count=6)](https://wakatime.com/@alan)

- Pin more than 6 repos in your GitHub profile:

  [![Readme Card](/api/pin?username=anuraghazra&repo=github-readme-stats)](https://github.com/anuraghazra/github-readme-stats)

- Pin Gists in your GitHub profile:

  [![Gist Card](/api/gist?id=bbfce31e0217a3689c8d961a356cb10d)](https://gist.github.com/Yizack/bbfce31e0217a3689c8d961a356cb10d)

- Customize all the cards:

  ![Anurag's GitHub stats](/api?username=anuraghazra&show_icons=true&theme=calm&rank_icon=github&include_all_commits=true&custom_title=Anurag's+Stats&disable_animations=true&number_format=long&show=prs_merged_percentage,prs_reviewed)

## Where to next

- [Cards](/frontend/docs/cards/stats/) — the options each card accepts.
- [Customization](/frontend/docs/customization/common-options/) — options every card shares, plus theming and locales.
- [Available Themes](/frontend/docs/customization/themes/) — the built-in themes, rendered as live examples.
- [Run It Yourself](/frontend/docs/deploy/) — GitHub Actions or a self-hosted Vercel deployment.
- [Fork Information](/frontend/docs/fork/) — what this project adds on top of github-readme-stats.

## Acknowledgements

This project is based on [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). The card wizard is based on [GitHub Trends](https://github.com/avgupta456/github-trends). Big thanks to [@anuraghazra](https://github.com/anuraghazra), [@avgupta456](https://github.com/avgupta456), [@rickstaa](https://github.com/rickstaa), [@qwerty541](https://github.com/qwerty541) and everyone else who worked on these projects! ❤️
