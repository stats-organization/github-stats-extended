---
title: Aligning Cards
---

By default, GitHub does not lay out the cards side by side. To do that, you can use such approaches:

## Stats and top languages cards

<!-- prettier-ignore -->
```html
<a href="https://github-stats-extended.vercel.app/api?username=anuraghazra">
  <img
    height="200"
    align="center"
    src="https://github-stats-extended.vercel.app/api?username=anuraghazra"
  />
</a>
<a href="https://github-stats-extended.vercel.app/api/top-langs?username=anuraghazra&layout=compact&langs_count=8&card_width=320">
  <img
    height="200"
    align="center"
    src="https://github-stats-extended.vercel.app/api/top-langs?username=anuraghazra&layout=compact&langs_count=8&card_width=320"
  />
</a>
```

<details>
<summary>👀 Show example</summary>

<div class="card-row">
  <a href="/api?username=anuraghazra">
    <img src="/api?username=anuraghazra" alt="Anurag's GitHub stats" />
  </a>
  <a href="/api/top-langs?username=anuraghazra&layout=compact&langs_count=8&card_width=320">
    <img src="/api/top-langs?username=anuraghazra&layout=compact&langs_count=8&card_width=320" alt="Top languages" />
  </a>
</div>

</details>

## Pinning repositories

```html
<a href="https://github.com/anuraghazra/github-readme-stats">
  <img
    align="center"
    src="https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats"
  />
</a>
<a href="https://github.com/anuraghazra/convoychat">
  <img
    align="center"
    src="https://github-stats-extended.vercel.app/api/pin/?username=anuraghazra&repo=convoychat"
  />
</a>
```

<details>
<summary>👀 Show example</summary>

<div class="card-row">
  <a href="https://github.com/anuraghazra/github-readme-stats">
    <img src="/api/pin?username=anuraghazra&repo=github-readme-stats" alt="Readme Card" />
  </a>
  <a href="https://github.com/anuraghazra/convoychat">
    <img src="/api/pin?username=anuraghazra&repo=convoychat" alt="Readme Card" />
  </a>
</div>

</details>
