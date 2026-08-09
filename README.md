<div align="center">
  <img src="docs/appIcon.svg" width="100px" alt="GitHub Stats Extended Logo" />
  <h1>GitHub Stats Extended</h1>
  <p>Dynamically generate GitHub stats for your READMEs.</p>
<a href="https://github-stats-extended.vercel.app/api?username=anuraghazra"><img src="https://github-stats-extended.vercel.app/api?username=anuraghazra"></a>
</div>

This project is the [extended, actively maintained successor](docs/fork.md) of [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). It generates stats cards about your GitHub contributions, your top languages and more, all customizable through a large set of parameters.

## Quick Start

Copy and paste this into your markdown, then change the `?username=` value to your GitHub username:

```markdown
[![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra)](https://github.com/stats-organization/github-stats-extended)
```

As a more comfortable alternative, use the [card wizard](https://github-stats-extended.vercel.app/frontend) to configure your card visually and copy the generated markdown.

## Documentation

The full documentation is served by the deployment it describes, so every sample it shows is rendered by the version that is actually running:

**[github-stats-extended.vercel.app/frontend/docs](https://github-stats-extended.vercel.app/frontend/docs)**

- [Overview](docs/index.md) — card types, quick start and migration from github-readme-stats.
- [Advanced Customization](docs/advanced_documentation.md) — every parameter the cards accept.
- [Available Themes](packages/core/src/themes/README.md) — the built-in themes.
- [Run It Yourself](docs/deploy.md) — GitHub Actions or a self-hosted Vercel deployment.
- [Fork Information](docs/fork.md) — what this project adds on top of github-readme-stats.

## Acknowledgements

This project is based on [github-readme-stats](https://github.com/anuraghazra/github-readme-stats), and the card wizard on [GitHub Trends](https://github.com/avgupta456/github-trends). Big thanks to [@anuraghazra](https://github.com/anuraghazra), [@avgupta456](https://github.com/avgupta456), [@rickstaa](https://github.com/rickstaa), [@qwerty541](https://github.com/qwerty541) and everyone else who worked on these projects! ❤️

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](.github/CONTRIBUTING.md) to get started.
