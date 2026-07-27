# Run It Yourself

We cache generated cards for a few hours to avoid potential rate-limiting in the GitHub API or on Vercel. If you want to set your own cache duration or you want to include private contributions in your stats without granting our hosted version of GitHub-Stats-Extended access to your private contributions, you can run GitHub-Stats-Extended on your own.

GitHub Actions is the simplest setup with static SVGs stored in your repo but less frequent updates, while self-hosting GitHub-Stats-Extended on Vercel takes more work and can serve fresher stats (with caching).

## GitHub Action

With [github-readme-stats-action](https://github.com/stats-organization/github-readme-stats-action) you can generate static cards in your GitHub Actions workflow, commit them to your profile repository, and embed them directly from there. This avoids any per-request API calls.

Create `/.github/workflows/grs.yml` in your profile repo (`USERNAME/USERNAME`):

```yaml
name: Update README cards

on:
  schedule:
    - cron: "0 0 * * *" # Runs once daily at midnight
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v6

      - name: Generate stats card
        uses: stats-organization/github-readme-stats-action@v2
        with:
          card: stats
          options: username=${{ github.repository_owner }}&show_icons=true
          path: profile/stats.svg
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit cards
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add profile/*.svg
          git commit -m "Update README cards" || exit 0
          git push
```

Then embed from your [profile README](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme#adding-a-profile-readme):

```md
![Stats](./profile/stats.svg)
```

See more options and examples in the [GitHub Readme Stats Action README](https://github.com/stats-organization/github-readme-stats-action#readme).

## Self-hosted on Vercel

Running your own instance avoids public rate limits and gives you full control over caching, tokens, and private stats.

### First step: get your Personal Access Token (PAT)

For deploying your own instance of GitHub Stats Extended, you will need to create a GitHub Personal Access Token (PAT). Below are the steps to create one and the scopes you need to select for both classic and fine-grained tokens.

Selecting the right scopes for your token is important in case you want to display private contributions on your cards.

#### Classic token

* Go to [Account -> Settings -> Developer Settings -> Personal access tokens -> Tokens (classic)](https://github.com/settings/tokens).
    * Click on `Generate new token -> Generate new token (classic)`.
    * Scopes to select:
        * repo
        * read:user
    * Click on `Generate token` and copy it.

#### Fine-grained token

> [!WARNING]\
> This limits the scope of commits to public repositories only.

* Go to [Account -> Settings -> Developer Settings -> Personal access tokens -> Fine-grained tokens](https://github.com/settings/personal-access-tokens).
    * Click on `Generate new token -> Generate new token`.
    * Enter a token name
    * Select an expiration date
    * Select `All repositories`
    * Scopes to select under `Permissions`:
        * Commit statuses: read-only
        * Contents: read-only
        * Issues: read-only
        * Metadata: read-only (added automatically when selecting above scopes)
        * Pull requests: read-only
    * Click on `Generate token` and copy it.

### On Vercel

Click on the deploy button to get started!

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/stats-organization/github-stats-extended&root-directory=apps/backend)

<b>Recommended: Step-by-step guide on setting up your own Vercel instance</b>

1. Go to [vercel.com](https://vercel.com/).
2. Click on `Log in`.
    ![](https://files.catbox.moe/pcxk33.png)
3. Sign in with GitHub by pressing `Continue with GitHub`.
    ![](https://files.catbox.moe/b9oxey.png)
4. Sign in to GitHub and allow access to all repositories if prompted.
5. Fork this repo.
6. Go back to your [Vercel dashboard](https://vercel.com/dashboard).
7. To import a project, click the `Add New...` button and select the `Project` option.
    ![](https://files.catbox.moe/3n76fh.png)
8. Search for the forked Git Repository and import it by clicking the `Import` button.
9. Create a Personal Access Token (PAT) as described in the [previous section](#first-step-get-your-personal-access-token-pat).
10. Add the PAT as an environment variable named `PAT_1` (as shown).
    ![](https://files.catbox.moe/0yclio.png)
    Note: For enhanced security, you can add a variable as a sensitive variable. To do this:
    1. Go to `Environment Variables` in `Project Settings`, then choose `Add Environment Variable`.
       ![](https://files.catbox.moe/heprjw.jpg)
    2. Uncheck `Deployment` from `Environments`
       ![](https://files.catbox.moe/tiqgd0.jpg)
    3. Now you can make the variable `Sensitive` by checking the checkbox.
       ![](https://files.catbox.moe/mla5no.jpg)
11. As `Root directory` select the `apps/backend` folder.
12. Click deploy, and you're good to go. See your domains to use the API!
13. optional: add an SQL database; by using e.g. the ["Nile" integration](https://vercel.com/marketplace/nile) or by manually setting the environment variable `POSTGRES_URL`
14. optional: [create your own OAuth App](https://github.com/settings/developers) and set environment variables `OAUTH_REDIRECT_URI`, `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` on Vercel accordingly
15. optional: set the environment variable `TURBO_PLATFORM_ENV_DISABLED` to `true` to disable the build-time warning from [turbo](https://turborepo.dev/) about environment variables missing from "turbo.json" - This warning is not relevant in our project.

### Available environment variables

GitHub Stats Extended provides several environment variables that can be used to customize the behavior of your self-hosted instance. These include:

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Supported values</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>CACHE_SECONDS</code></td>
      <td>Sets the cache duration in seconds for the generated cards. This variable takes precedence over the default cache timings for the public instance. If this variable is not set, the default cache duration is 24 hours (86,400 seconds).</td>
      <td>Any positive integer or <code>0</code> to disable caching</td>
    </tr>
    <tr>
      <td><code>UPDATE_AFTER_HOURS</code></td>
      <td>Sets the duration in hours after which the server <a href="fork.md#improved-performance-and-latency">proactively regenerates</a> a previously requested card. Defaults to 11 hours.</td>
      <td>Any int or float</td>
    </tr>
    <tr>
      <td><code>DELETE_AFTER_HOURS</code></td>
      <td>Sets the duration in hours after which the server stops <a href="fork.md#improved-performance-and-latency">proactively regenerating</a> a previously requested card if it hasn't been requested again in the meantime. Defaults to 8 days, i.e. 192 hours.</td>
      <td>Any int or float</td>
    </tr>
    <tr>
      <td><code>WHITELIST</code></td>
      <td>A comma-separated list of GitHub usernames that are allowed to access your instance. If this variable is not set, all usernames are allowed.</td>
      <td>Comma-separated GitHub usernames</td>
    </tr>
    <tr>
      <td><code>GIST_WHITELIST</code></td>
      <td>A comma-separated list of GitHub Gist IDs that are allowed to be accessed on your instance. If this variable is not set, all Gist IDs are allowed.</td>
      <td>Comma-separated GitHub Gist IDs</td>
    </tr>
    <tr>
      <td><code>EXCLUDE_REPO</code></td>
      <td>A comma-separated list of repositories that will be excluded from stats and top languages cards on your instance. This allows repository exclusion without exposing repository names in public URLs. This enhances privacy for self-hosted instances that include private repositories in stats cards.</td>
      <td>Comma-separated repository names</td>
    </tr>
    <tr>
      <td><code>FETCH_MULTI_PAGE_STARS</code></td>
      <td>Enables fetching all starred repositories for accurate star counts, especially for users with more than 100 repositories. This may increase response times and API points usage, so it is limited to 10 fetches - i.e. 1000 repos - on the public instance.</td>
      <td><code>true</code> or <code>false</code> or a maximum number of fetches</td>
    </tr>
  </tbody>
</table>

See [the Vercel documentation](https://vercel.com/docs/concepts/projects/environment-variables) on adding these environment variables to your Vercel instance.

> [!WARNING]
> Please remember to redeploy your instance after making any changes to the environment variables so that the updates take effect. The changes will not be applied to the previous deployments.

### Keep your fork up to date

You can keep your fork, and thus your private Vercel instance up to date with the upstream using GitHub's [Sync Fork button](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork). You can also use the [pull](https://github.com/wei/pull) package created by [@wei](https://github.com/wei) to automate this process.

As a prerequisite, GitHub has to know that your personal GitHub-Stats-Extended repo is a fork of https://github.com/stats-organization/github-stats-extended. This only works if you follow the "Step-by-step guide on setting up your own Vercel instance" above, instead of clicking the Vercel "Deploy" button above.