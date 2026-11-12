# ISR Proxy

A separate Vercel project that sits in front of the container deployment and caches cards in Vercel's durable [ISR cache](https://vercel.com/docs/incremental-static-regeneration). Without it, cards are only cached in Vercel's CDN cache, which evicts rarely requested entries within minutes.

## How requests are routed

`.vercel/output/config.json`:

- Card routes (`/api`, `/api/pin`, `/api/top-langs`, `/api/gist`, `/api/wakatime`, each with or without trailing slash) are proxied to the prerender function `/isr`, with `__card` and `__env` appended to the query string. The function (`.vercel/output/functions/isr.func/index.mjs`) fetches the card from the container deployment. ISR settings are in `.vercel/output/functions/isr.prerender-config.json`.
- Everything else is rewritten to the container unchanged (method, body, headers, query string).
- Requests to `github-stats-extended-preview.vercel.app` go to the preview container at `github-stats-extended-internal-preview.vercel.app`, all other hosts to the production container at `github-stats-extended-internal.vercel.app`.
  _These domains are hard-coded in this project. If you want to use the ISR proxy for different domains, replace all their occurrences in the code._
