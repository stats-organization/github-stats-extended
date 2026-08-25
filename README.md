<div align="center">
  <img src="docs/appIcon.svg" width="100px" alt="GitHub Stats Extended Logo" />
  <h1>GitHub Stats Extended</h1>
  <p>Dynamically generate GitHub stats for your READMEs.</p>
<a href="https://github-stats-extended.vercel.app/api?username=anuraghazra"><img src="https://github-stats-extended.vercel.app/api?username=anuraghazra"></a>
</div>

GitHub-Stats-Extended is the [extended, actively maintained successor](docs/fork.md) of [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). It generates [various stats cards](#card-types) about your GitHub contributions, your top languages and more. You can [customize](#documentation) the cards via multiple parameters.

## Table of Contents

- [Quick Start](#quick-start)
- [Migration from github-readme-stats](#migration-from-github-readme-stats)
- [Card Types](#card-types)
- [Documentation](#documentation)
- [Acknowledgements](#acknowledgements)
- [Contributing](#contributing)

## Quick Start

Copy and paste this into your markdown, then change the `?username=` value to your GitHub username:

```md
[![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra)](https://github.com/stats-organization/github-stats-extended)
```

As a more comfortable alternative, use the [card wizard](https://github-stats-extended.vercel.app/frontend) to configure your card visually. Then copy the generated markdown into your [GitHub profile README](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme#adding-a-profile-readme).

## Migration from github-readme-stats

To migrate from [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) you only need to change the domain from `github-readme-stats.vercel.app` to `github-stats-extended.vercel.app`:

```diff
- https://github-readme-stats.vercel.app/api?username=octocat&theme=radical
+ https://github-stats-extended.vercel.app/api?username=octocat&theme=radical
```

GitHub-Stats-Extended aims to be fully compatible with github-readme-stats. For details see [Compatibility Notes](docs/fork.md#compatibility-notes).

## Card Types

- Show your GitHub statistics:

  ![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra)

- ...your top languages...:

  ![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&langs_count=4)

- ...and development time:

  [![Alan's WakaTime stats](https://github-stats-extended.vercel.app/api/wakatime?username=alan&langs_count=6)](https://wakatime.com/@alan)

- Pin more than 6 repos in your GitHub profile:

  [![Readme Card](https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats)](https://github.com/anuraghazra/github-readme-stats)

- Pin Gists in your GitHub profile:

  [![Gist Card](https://github-stats-extended.vercel.app/api/gist?id=bbfce31e0217a3689c8d961a356cb10d)](https://gist.github.com/Yizack/bbfce31e0217a3689c8d961a356cb10d)

- Customize all the cards:

  [![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api/?username=anuraghazra&show_icons=true&theme=calm&rank_icon=github&include_all_commits=true&custom_title=Anurag's+Stats&disable_animations=true&number_format=long&show=prs_merged_percentage,prs_reviewed)](https://github-stats-extended.vercel.app/api/?username=anuraghazra&show_icons=true&theme=calm&rank_icon=github&include_all_commits=true&custom_title=Anurag's+Stats&disable_animations=true&number_format=long&show=prs_merged_percentage,prs_reviewed)

## Documentation

The [card wizard](https://github-stats-extended.vercel.app/frontend) offers some essential customization options. For more advanced customization and other project info check out the [advanced documentation](docs/advanced_documentation.md).

## Acknowledgements

This project is based on [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). The card wizard is based on [GitHub Trends](https://github.com/avgupta456/github-trends). Big thanks to [@anuraghazra](https://github.com/anuraghazra), [@avgupta456](https://github.com/avgupta456), [@rickstaa](https://github.com/rickstaa), [@qwerty541](https://github.com/qwerty541) and everyone else who worked on these projects! ❤️

## Contributing

Contributions are welcome!
