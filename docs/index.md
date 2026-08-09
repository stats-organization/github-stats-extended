# GitHub Stats Extended

Dynamically generate GitHub stats for your READMEs.

GitHub-Stats-Extended is the [extended, actively maintained successor](fork.md) of [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). It generates stats cards about your GitHub contributions, your top languages and more, which you can [customize](advanced_documentation.md) through a large set of parameters.

<picture>
  <source
    srcset="https://github-stats-extended.vercel.app/api?username=anuraghazra&theme=dark_github"
    media="(prefers-color-scheme: dark)"
  />
  <img src="https://github-stats-extended.vercel.app/api?username=anuraghazra&theme=light_github" alt="Anurag's GitHub stats" />
</picture>

## Quick Start

Copy and paste this into your markdown, then change the `?username=` value to your GitHub username:

```md
[![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra)](https://github.com/stats-organization/github-stats-extended)
```

As a more comfortable alternative, use the [card wizard](https://github-stats-extended.vercel.app/frontend) to configure your card visually, then copy the generated markdown into your [GitHub profile README](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme#adding-a-profile-readme).

## Card Types

### Stats Card

<picture>
  <source
    srcset="https://github-stats-extended.vercel.app/api?username=anuraghazra&theme=dark_github"
    media="(prefers-color-scheme: dark)"
  />
  <img src="https://github-stats-extended.vercel.app/api?username=anuraghazra&theme=light_github" alt="Anurag's GitHub stats" />
</picture>

### Top Languages Card

<picture>
  <source
    srcset="https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&langs_count=4&theme=dark_github"
    media="(prefers-color-scheme: dark)"
  />
  <img src="https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&langs_count=4&theme=light_github" alt="Top Langs" />
</picture>

### WakaTime Card

<picture>
  <source
    srcset="https://github-stats-extended.vercel.app/api/wakatime?username=alan&langs_count=6&theme=dark_github"
    media="(prefers-color-scheme: dark)"
  />
  <img src="https://github-stats-extended.vercel.app/api/wakatime?username=alan&langs_count=6&theme=light_github" alt="Alan's WakaTime stats" />
</picture>

### Repo Card

<picture>
  <source
    srcset="https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats&theme=dark_github_repocard"
    media="(prefers-color-scheme: dark)"
  />
  <img src="https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats&theme=light_github_repocard" alt="Readme Card" />
</picture>

### Gist Card

<picture>
  <source
    srcset="https://github-stats-extended.vercel.app/api/gist?id=bbfce31e0217a3689c8d961a356cb10d&theme=dark_github_repocard"
    media="(prefers-color-scheme: dark)"
  />
  <img src="https://github-stats-extended.vercel.app/api/gist?id=bbfce31e0217a3689c8d961a356cb10d&theme=light_github_repocard" alt="Gist Card" />
</picture>

## Migration from github-readme-stats

To migrate from [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) you only need to change the domain from `github-readme-stats.vercel.app` to `github-stats-extended.vercel.app`:

```diff
- https://github-readme-stats.vercel.app/api?username=octocat&theme=radical
+ https://github-stats-extended.vercel.app/api?username=octocat&theme=radical
```

GitHub-Stats-Extended aims to be fully compatible with github-readme-stats. For details see [Compatibility Notes](fork.md#compatibility-notes).

## Where to next

- [Advanced Customization](advanced_documentation.md) — every parameter the cards accept.
- [Available Themes](../packages/core/src/themes/README.md) — the built-in themes, rendered as live samples.
- [Run It Yourself](deploy.md) — GitHub Actions or a self-hosted Vercel deployment.
- [Fork Information](fork.md) — what this project adds on top of github-readme-stats.

## Acknowledgements

This project is based on [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). The card wizard is based on [GitHub Trends](https://github.com/avgupta456/github-trends). Big thanks to [@anuraghazra](https://github.com/anuraghazra), [@avgupta456](https://github.com/avgupta456), [@rickstaa](https://github.com/rickstaa), [@qwerty541](https://github.com/qwerty541) and everyone else who worked on these projects! ❤️
