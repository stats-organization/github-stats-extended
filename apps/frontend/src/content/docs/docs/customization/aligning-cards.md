---
title: Aligning Cards
---

By default, GitHub does not lay out the cards side by side. To do that, you can use such approaches:

## Stats and top languages cards

<!-- prettier-ignore -->
```html
<a href="https://github-stats-extended.vercel.app/api?username=anuraghazra">
  <picture>
    <source
      srcset="https://github-stats-extended.vercel.app/api?username=anuraghazra&theme=dark_github"
      media="(prefers-color-scheme: dark)"
    />
    <img height="200" align="center" src="https://github-stats-extended.vercel.app/api?username=anuraghazra&theme=light_github" />
  </picture>
</a>
<a href="https://github-stats-extended.vercel.app/api/top-langs?username=anuraghazra&layout=compact&langs_count=8&card_width=320">
  <picture>
    <source
      srcset="https://github-stats-extended.vercel.app/api/top-langs?username=anuraghazra&layout=compact&langs_count=8&card_width=320&theme=dark_github"
      media="(prefers-color-scheme: dark)"
    />
    <img height="200" align="center" src="https://github-stats-extended.vercel.app/api/top-langs?username=anuraghazra&layout=compact&langs_count=8&card_width=320&theme=light_github" />
  </picture>
</a>
```

<details>
<summary>👀 Show example</summary>

<div class="card-row">
  <a href="/api?username=anuraghazra">
    <img class="card-preview-light" src="/api?username=anuraghazra&theme=light_github" alt="Anurag's GitHub stats" />
    <img class="card-preview-dark" src="/api?username=anuraghazra&theme=dark_github" alt="Anurag's GitHub stats" />
  </a>
  <a href="/api/top-langs?username=anuraghazra&layout=compact&langs_count=8&card_width=320">
    <img class="card-preview-light" src="/api/top-langs?username=anuraghazra&layout=compact&langs_count=8&card_width=320&theme=light_github" alt="Top languages" />
    <img class="card-preview-dark" src="/api/top-langs?username=anuraghazra&layout=compact&langs_count=8&card_width=320&theme=dark_github" alt="Top languages" />
  </a>
</div>

</details>

## Pinning repositories

<!-- prettier-ignore -->
```html
<a href="https://github.com/anuraghazra/github-readme-stats">
  <picture>
    <source
      srcset="https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats&theme=dark_github_repocard"
      media="(prefers-color-scheme: dark)"
    />
    <img
      align="center"
      src="https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats&theme=light_github_repocard"
    />
  </picture>
</a>
<a href="https://github.com/anuraghazra/convoychat">
  <picture>
    <source
      srcset="https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=convoychat&theme=dark_github_repocard"
      media="(prefers-color-scheme: dark)"
    />
    <img
      align="center"
      src="https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=convoychat&theme=light_github_repocard"
    />
  </picture>
</a>
```

<details>
<summary>👀 Show example</summary>

<div class="card-row">
  <a href="https://github.com/anuraghazra/github-readme-stats">
    <img class="card-preview-light" src="/api/pin?username=anuraghazra&repo=github-readme-stats&theme=light_github_repocard" alt="Readme Card" />
    <img class="card-preview-dark" src="/api/pin?username=anuraghazra&repo=github-readme-stats&theme=dark_github_repocard" alt="Readme Card" />
  </a>
  <a href="https://github.com/anuraghazra/convoychat">
    <img class="card-preview-light" src="/api/pin?username=anuraghazra&repo=convoychat&theme=light_github_repocard" alt="Readme Card" />
    <img class="card-preview-dark" src="/api/pin?username=anuraghazra&repo=convoychat&theme=dark_github_repocard" alt="Readme Card" />
  </a>
</div>

</details>
