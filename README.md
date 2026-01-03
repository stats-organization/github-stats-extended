<div align="center">
  <img src="docs/appIcon.svg" width="100px" alt="GitHub Readme Stats" />
  <h1>GitHub Stats Extended</h1>
  <p>Dynamically generate GitHub stats for your READMEs.</p>
<a href="https://github-stats-extended.vercel.app/api?username=anuraghazra"><img src="https://github-stats-extended.vercel.app/api?username=anuraghazra"></a>
</div>

This project is an [extended version](docs/fork.md) of [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). It generates [various stats cards](#card-types), e.g. about your GitHub contributions, your top languages, etc. You can [customize](#advanced-customization) the cards via multiple parameters.

# Table of Contents
- [Quick Start](#quick-start)
- [Card Types](#card-types)
- [Advanced Customization](#advanced-customization)
- [Self-Hosting](#self-hosting)
- [Acknowledgements](#acknowledgements)
- [Contributing](#contributing)

# Quick Start
- Copy and paste this into your markdown:
  ```markdown
  [![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra)](https://github.com/stats-organization/github-stats-extended)
  ```
- Change the `?username=` value to your GitHub username.
- Done!

-----------------------

As more comfortable alternative, use the [GitHub-Stats-Extended Wizard](https://github-stats-extended.vercel.app/frontend) to create your custom stats card. Copy the generated markdown code and paste it into your [GitHub profile README](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme#adding-a-profile-readme). Done!

# Card Types
- Show your GitHub statistics:

  ![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra)

- ...your top languages...:

  ![Top Langs](https://github-stats-extended.vercel.app/api/top-langs/?username=anuraghazra&langs_count=4)

- ...and development time:

  [![Harlok's WakaTime stats](https://github-stats-extended.vercel.app/api/wakatime?username=ffflabs&langs_count=6)](https://wakatime.com/@ffflabs)

- Pin more than 6 repos in your GitHub profile:

  [![Readme Card](https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats)](https://github.com/anuraghazra/github-readme-stats)

- Pin Gists in your GitHub profile:

  [![Gist Card](https://github-stats-extended.vercel.app/api/gist?id=bbfce31e0217a3689c8d961a356cb10d)](https://gist.github.com/Yizack/bbfce31e0217a3689c8d961a356cb10d)

- Customize all the cards:

  [![Anurag's GitHub stats](https://github-stats-extended.vercel.app/api/?username=anuraghazra&show_icons=true&theme=calm&rank_icon=github&include_all_commits=true&custom_title=Anurag's+Stats&disable_animations=true&number_format=long&show=prs_merged_percentage,prs_reviewed)](https://github-stats-extended.vercel.app/api/?username=anuraghazra&show_icons=true&theme=calm&rank_icon=github&include_all_commits=true&custom_title=Anurag's+Stats&disable_animations=true&number_format=long&show=prs_merged_percentage,prs_reviewed)

# Advanced Customization
The [GitHub-Stats-Extended Wizard](https://github-stats-extended.vercel.app/frontend) offers some essential customization options. For more advanced customization check out the [advanced documentation](docs/advanced_documentation.md).

# Acknowledgements
This project is based on [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). On top of their functionality I added several new features and improvements. See [Fork Information](docs/fork.md) for a list of changes. The frontend I added to the project is based on [GitHub Trends](https://github.com/avgupta456/github-trends). Big thanks to [@anuraghazra](https://github.com/anuraghazra), [@avgupta456](https://github.com/avgupta456), [@rickstaa](https://github.com/rickstaa), [@qwerty541](https://github.com/qwerty541) and everyone else who worked on these projects! ❤️

# Self-Hosting
Since the GitHub API only allows a limited number of requests per hour, the public instance of GitHub-Stats-Extended at https://github-stats-extended.vercel.app/api could possibly hit the rate limiter. If you host your own instance you do not have to worry about anything. Also, if you don't want to give my GitHub-Stats-Extended instance access to your private contributions but still want to include these contributions in your stats, you can simply host your own instance.

See [Deploy on your own](docs/deploy.md) for various deployment options.

# Contributing
Contributions are welcome!