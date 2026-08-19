# Contributing to GitHub Stats Extended

## Local Development

To set up the project GitHub-Stats-Extended locally, run the following commands:

```bash
pnpm install
pnpm run build:packages
pnpm run dev:frontend
```

The easiest way to run and test the project is to deploy it to Vercel as described in the [deployment guide](https://github-stats-extended.vercel.app/frontend/docs/deploy/).

## Tests

```bash
pnpm run test       # unit tests
pnpm run lint       # eslint
pnpm run typecheck  # tsc
```

The **Backend E2E test** in CI compares the cards your branch renders against the ones served by the preview deployment, which is still on the last commit merged to master.
So if your PR changes card output at all, that job goes red until the preview catches up.
It's marked `continue-on-error`, so it won't block your PR, but do open it and check the diff is only what you expected.

If the change to card markup was intentional, update the snapshots:

```bash
pnpm --filter ./packages/core/ run test:update:snapshot
pnpm --filter ./apps/backend/ run test:update:snapshot
```

## GraphQL Queries

The GraphQL queries live in `packages/core/src/graphql/queries/*.graphql`,
and their TypeScript types are generated from GitHub's published schema into `packages/core/src/graphql/generated/`.
Those generated files are committed, so if you change a query, regenerate them and include the result in your PR:

```bash
pnpm --filter ./packages/core/ run generate-graphql-types
```

CI runs `pnpm --filter ./packages/core/ run check-graphql-types`, which fails if the committed types no longer match the queries.
Never edit the generated files by hand — change the `.graphql` file and regenerate.

## Themes Contribution

We have stopped the addition of new themes to decrease maintenance efforts. If you are considering contributing your theme just because you are using it personally, then instead of adding it to our theme collection, you can use card [customization options](https://github-stats-extended.vercel.app/frontend/docs/customization/common-options/).

## Translations Contribution

GitHub-Stats-Extended supports multiple languages. If we are missing your language, you can contribute it! You can check the currently supported languages [here](https://github-stats-extended.vercel.app/frontend/docs/customization/locales/).

To contribute your language you need to edit the [packages/core/src/translations.ts](../packages/core/src/translations.ts) file and add a new property to each object where the key is the language code in [ISO 639-1 standard](https://www.andiamo.co.uk/resources/iso-language-codes/) and the value is the translated string.

## Any contributions you make will be under the MIT Software License

In short, when you submit changes, your submissions are understood to be under the same [MIT License](https://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report issues/bugs using GitHub's issues

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/stats-organization/github-stats-extended/issues/new/choose). If there is already an open issue for your bug in the upstream repo [github-readme-stats](https://github.com/anuraghazra/github-readme-stats/issues) you don't need to report it here.

## Feature Request

**Great Feature Requests** tend to have:

- A quick idea summary
- What & why do you want to add the specific feature
- Additional context like images, links to resources to implement the feature, etc.
