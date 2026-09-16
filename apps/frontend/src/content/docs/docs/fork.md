---
title: Fork Information
---

This project is an actively maintained fork and extension of [github-readme-stats](https://github.com/anuraghazra/github-readme-stats).

## Key Differences

Compared to [github-readme-stats](https://github.com/anuraghazra/github-readme-stats), this project adds the following changes:

### Frontend for easy, visual configuration of cards

GitHub-Stats-Extended adds a frontend which allows users to visually configure stats cards. It is hosted at https://github-stats-extended.vercel.app/frontend.

![frontend screenshot](frontend-screenshot.png)

The frontend is based on [GitHub Trends](https://github.com/avgupta456/github-trends) by [@avgupta456](https://github.com/avgupta456).

### Aggregate stats across organizations

To include stars from repos which are not owned by you, but where you are a collaborator or organization member, add `&role=OWNER,ORGANIZATION_MEMBER,COLLABORATOR` to your stats card url. To include such repos in your language stats, you can also add the same parameter to your top languages card url.

See [here](/frontend/docs/cards/stats/#filtering-by-repository-and-owner) for full feature documentation.

The resolution of this most requested feature in github-readme-stats was [originally implemented](https://github.com/anuraghazra/github-readme-stats/issues/1#issuecomment-855681098) by [@developStorm](https://github.com/developStorm).

### Improved performance and latency

GitHub-Stats-Extended proactively precomputes and caches cards. This solves the problem where [cards wouldn't load on the first try](https://github.com/anuraghazra/github-readme-stats/issues/2603). It also gives GitHub-Stats-Extended more time while generating cards in the background, which allows it to fetch more repo data:

### Multi-page fetching for accurate star counts

GitHub-Stats-Extended fetches up to 1000 of your starred repositories to accurately compute your stars count. In github-readme-stats, this is limited to 100 repos because github-readme-stats doesn't have the above-mentioned performance improvements.

### Light and dark mode in a single card URL

GitHub-Stats-Extended adds parameters `theme_light`, `theme_dark` and the `*_light` / `*_dark` color variants (e.g. `title_color_light`), to specify both modes in one card URL. The card then follows the viewer's browser or OS setting.

```md
![Anuraghazra's GitHub stats](https://github-stats-extended.vercel.app/api?username=anuraghazra&theme_light=light_github&theme_dark=dark_github)
```

It works everywhere, including GitHub sponsorship pages, where the other light/dark approaches do not. See [Set light and dark mode in one card](/frontend/docs/customization/theming/#set-light-and-dark-mode-in-one-card) for the details.

### GitHub-themed light and dark themes

GitHub-Stats-Extended adds `light_github` and `dark_github` [themes](/frontend/docs/customization/themes/) that exactly match GitHub's own UI colors. For repo and gist cards use `light_github_repocard` and `dark_github_repocard`, which differ only in icon color.

### New contributions stat

GitHub-Stats-Extended adds an optional stat showing the number of [contributions](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference#what-counts-as-a-contribution) (commits, pull requests, issues, etc.) across all years of a user's history. Enable it with `&show=contributions`. Whether private contributions are counted depends on [your profile visibility settings](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/manage-visibility-settings-for-private-contributions-and-achievements#changing-the-visibility-of-your-private-contributions).

:::note
The pre-existing "Contributed to" stat counts repositories a user has contributed to, not contributions.
:::

### New options for "contributed-to" stats

GitHub-Stats-Extended adds an `all_time_contribs` stat that shows the number of repositories a user has contributed to across all years — not just the past year like the default `contribs` stat.
Enable it with [`&show=all_time_contribs`](/frontend/docs/cards/stats/#showing-additional-individual-stats).

GitHub-Stats-Extended also adds a parameter [`contribs_include_own_repos`](/frontend/docs/cards/stats/#options) to include the user's own repositories in the `contribs` and `all_time_contribs` stats.
By default, both stats exclude them and only count repositories owned by other users or organizations.

### Customization of top languages card

GitHub-Stats-Extended can show your top languages without any numbers via the `hide_values` parameter. And the new `prog_bar_bg_color` parameter sets the background color of progress bars, e.g. to transparent:

![Anuraghazra's top languages without numbers](/api/top-langs?username=anuraghazra&langs_count=4&hide_values=true&prog_bar_bg_color=0000)

### Private contributions support

GitHub-Stats-Extended can include private contributions in your stats cards. You no longer have to deploy your own instance for that. Just log into the [GitHub-Stats-Extended Wizard](/frontend) via the "GitHub Private Access" button (or click "Upgrade to Private Access" if already logged in). This will allow GitHub-Stats-Extended to see your private contributions.

### Display contributions to specific repositories or organizations

GitHub-Stats-Extended adds the ability to show contribution stats for specific repositories and organizations.

Especially for regular contributors in open source projects it might make sense to display an overview of their own contributions to these projects on their GitHub profile.

See [here](/frontend/docs/cards/stats/#filtering-by-repository-and-owner) for full feature documentation.

---

Anuraghazra's contributions to github-readme-stats:

![Anuraghazra's contributions to github-readme-stats](/api/pin?username=anuraghazra&repo=github-readme-stats&show=prs_authored,prs_commented,prs_reviewed,issues_authored,issues_commented)

Add `&show=prs_authored,prs_commented,prs_reviewed,issues_authored,issues_commented` to your repo card url to display your contributions to the pinned repository.

---

Anuraghazra's contributions to razorpay:

![Anuraghazra's contributions to razorpay](/api?username=anuraghazra&owner=razorpay&hide=prs,issues,stars,commits,contribs&show=prs_authored,prs_commented,prs_reviewed,issues_authored,issues_commented&hide_rank=true&custom_title=Anurag%27s%20contributions%20to%20razorpay&card_width=333)

Add `&repo=userA/repoA,orgB/repoB` or `&owner=userC,orgD` to your profile stats url to filter your contributions by repo or organization. (The screenshot above uses further customization options.)

### Other

GitHub-Stats-Extended adds various other, minor improvements. For example, the repo card now supports the `card_width` parameter.

## Why This Fork Exists

[github-readme-stats](https://github.com/anuraghazra/github-readme-stats) is a great project, which unfortunately saw its development slow down in the past years, with [highly requested features](https://github.com/anuraghazra/github-readme-stats/issues/1935) getting delayed for a long time.

One of the valued maintainers [wrote](https://github.com/anuraghazra/github-readme-stats/pull/3911#issuecomment-3377726545):

> I joined the project as collaborator in the middle of 2023 and there was just a few guys in the team while hundreds of PRs, issues and discussions pending to be reviewed.
>
> The volume is overwhelming for the small team, especially taking into account that right now I'm alone online and working only sometimes when I have a free hours, so it took some time to get to your PR.

So [@martin-mfg](https://github.com/martin-mfg) decided to fork the project, implement some of the highly requested features and make the enhanced project available to everyone. Since the initial release of this fork @martin-mfg joined forces with the maintainers of [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) and GitHub-Stats-Extended is now becoming the successor of github-readme-stats.

## Compatibility Notes

GitHub-Stats-Extended aims to be fully compatible with [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). Additional functionality introduced in this fork has to be explicitly enabled via some parameter.

So you can change an existing stats card url from [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) to GitHub-Stats-Extended simply by changing the domain from `github-readme-stats.vercel.app` to `github-stats-extended.vercel.app`. The card will look the same.

There is only one exception to this: GitHub-Stats-Extended improves line wrapping for multi-line gist and repository descriptions.
This should be an improvement for existing cards, but it still changes their appearance a bit.

Previously, line wrapping happened simply after 59 characters, with special handling for Chinese characters:

<img width="400" height="140" alt="character-based" src="https://github.com/user-attachments/assets/1cf7edba-7f6c-4a37-89d7-334cbe54f0f1" />

GitHub-Stats-Extended now takes the actual width of each character into account:

<img width="400" height="150" alt="new-server-side-calculation" src="https://github.com/user-attachments/assets/277b92df-b2a9-48be-bd2a-d28c1d6764c5" />
