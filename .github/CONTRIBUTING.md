# Contributing to GitHub Stats Extended

## Local Development

To build GitHub-Stats-Extended locally, run the following commands:

```bash
./vercel-preparation.sh
(cd ./backend/ && npm install)
(cd ./frontend/frontend/ && yarn install && yarn build-trends)
```

The easiest way to run and test the project is to deploy it to Vercel as described in the [deployment guide](../docs/deploy.md).

## Themes Contribution

We have stopped the addition of new themes to decrease maintenance efforts. If you are considering contributing your theme just because you are using it personally, then instead of adding it to our theme collection, you can use card [customization options](../docs/advanced_documentation.md#customization).

## Translations Contribution

GitHub-Stats-Extended supports multiple languages. If we are missing your language, you can contribute it! You can check the currently supported languages [here](../docs/advanced_documentation.md#available-locales).

To contribute your language you need to edit the [backend/src/translations.js](../backend/src/translations.js) file and add a new property to each object where the key is the language code in [ISO 639-1 standard](https://www.andiamo.co.uk/resources/iso-language-codes/) and the value is the translated string.

## Any contributions you make will be under the MIT Software License

In short, when you submit changes, your submissions are understood to be under the same [MIT License](https://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report issues/bugs using GitHub's issues

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/stats-organization/github-stats-extended/issues/new/choose). If there is already an open issue for your bug in the upstream repo [github-readme-stats](https://github.com/anuraghazra/github-readme-stats/issues) you don't need to report it here.

## Frequently Asked Questions (FAQs)

**Q:** How to hide Jupyter Notebook?

> **Ans:** &hide=jupyter%20notebook

**Q:** Language Card is incorrect

> **Ans:** Please read all the related issues/comments before opening any issues regarding language card stats:
>
> -   <https://github.com/anuraghazra/github-readme-stats/issues/136#issuecomment-665164174>
>
> -   <https://github.com/anuraghazra/github-readme-stats/issues/136#issuecomment-665172181>

**Q:** How to count private stats?

> see [here](../docs/fork.md#private-contributions-support)

### Feature Request

**Great Feature Requests** tend to have:

-   A quick idea summary
-   What & why do you want to add the specific feature
-   Additional context like images, links to resources to implement the feature, etc.
