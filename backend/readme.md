<div align="center">
  <img src="appIcon.svg" width="100px" alt="GitHub Readme Stats" />
  <h1 style="font-size: 28px; margin: 10px 0;">GitHub Stats Extended</h1>
  <p>Dynamically generate GitHub stats for your READMEs.</p>
<img src="https://github-readme-stats-phi-jet-58.vercel.app/api?username=anuraghazra">
</div>
<br>
This project is an [extended version](docs/fork.md) of [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). It generates <ins>various stats cards</ins>, e.g. about your GitHub contributions, your top languages, etc. You can <ins>customize</ins> the cards via multiple parameters.

# Table of Contents
- Quick Start
- Card Types
- Advanced Customization
- Self-Hosting
- Acknowledgement
- Contributing
- Features

# Quick Start
Use the [GitHub-Stats-Extended Wizard](https://monorepo-test-backend-seven.vercel.app/frontend) to create your custom stats card. Copy the generated markdown code and paste it into your [GitHub profile README](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme#adding-a-profile-readme). Done!

# Card Types
- Show your GitHub statistics:

  ![Anurag's GitHub stats](https://github-readme-stats-phi-jet-58.vercel.app/api?username=anuraghazra)

- ...your top languages...:

  ![Top Langs](https://github-readme-stats-phi-jet-58.vercel.app/api/top-langs/?username=anuraghazra&langs_count=4)

- ...and development time:

  ![Harlok's WakaTime stats](https://github-readme-stats-phi-jet-58.vercel.app/api/wakatime?username=ffflabs&langs_count=6)

- Pin more than 6 repos in your GitHub profile:

  [![Readme Card](https://github-readme-stats-phi-jet-58.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats)](https://github.com/anuraghazra/github-readme-stats)

- Pin Gists in your GitHub profile:

  ![Gist Card](https://github-readme-stats-phi-jet-58.vercel.app/api/gist?id=bbfce31e0217a3689c8d961a356cb10d)

- Customize all the cards:

  ![Anurag's GitHub stats](https://github-readme-stats-phi-jet-58.vercel.app/api/?username=anuraghazra&show_icons=true&theme=calm&rank_icon=github&include_all_commits=true&custom_title=Anurag's+Stats&disable_animations=true&number_format=long&show=prs_merged_percentage,prs_reviewed)

# Advanced Customization
The [GitHub-Stats-Extended Wizard](https://monorepo-test-backend-seven.vercel.app/frontend) offers some essential customization options. For more advanced customization check out the [advanced documentation](docs/advanced_documentation.md).

# Acknowledgement
This project is based on [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). On top of their functionality, I added several new features and improvements. See [TBD](docs/fork.md) for a full list of changes. The frontend I added to the project is based on [GitHub Trends](https://github.com/avgupta456/github-trends). Big thanks to @anuraghazra, @avgupta456, @rickstaa, @qwerty541 and everyone else who worked on these projects! ❤️

# Self-Hosting
Since the GitHub API only allows a limited number of requests per hour, my public instance of GitHub-Stats-Extended could possibly hit the rate limiter. If you host your own instance you do not have to worry about anything. Also, if you don't want to give my GitHub-Stats-Extended instance access to your private contributions but still want to include these contributions in your stats, you can simply host your own instance.

See [Deploy on your own instance](docs/deploy.md) for various deployment options.

# Contributing
Contributions are welcome!