# Running with Docker

The backend can run as a standalone HTTP server inside a container, so you can
host the cards anywhere instead of relying on Vercel. This is useful for
self-hosting, air-gapped environments, or local testing.

## What the image does

The image builds the `core` package and runs `apps/backend/express.js`, which
starts an HTTP server that answers the same routes as the Vercel deployment
(`/api`, `/api/pin`, `/api/top-langs`, `/api/gist`, `/api/wakatime`, and the
status/auth endpoints). The server listens on `0.0.0.0` and reads the `PORT`
variable, falling back to `9000`.

A database is **optional**. Without `POSTGRES_URL`, all database-backed features
(request analytics, `repeat-recent`, the authenticate / user-access flow) are
skipped and card rendering works normally.

## Requirements

- Docker (with BuildKit, the default in current Docker versions).
- At least one GitHub personal access token, exposed as `PAT_1`. Additional
  tokens (`PAT_2`, `PAT_3`, ...) spread the requests across the GitHub API rate
  limit.

## Quick start (Docker)

Build the image:

```bash
docker build -t github-stats-extended:local .
```

Run it:

```bash
docker run --rm -p 9000:9000 -e PAT_1=ghp_your_token github-stats-extended:local
```

Then request a card:

```bash
curl "http://localhost:9000/api?username=anuraghazra"
```

## Quick start (Docker Compose)

Cards only, no database:

```bash
PAT_1=ghp_your_token docker compose up backend
```

With the bundled Postgres (enables analytics and the auth endpoints):

```bash
PAT_1=ghp_your_token docker compose --profile with-db up
```

## Configuration

All configuration is passed through environment variables.

| Variable                 | Required | Description                                                        |
| ------------------------ | -------- | ------------------------------------------------------------------ |
| `PAT_1`, `PAT_2`, ...     | Yes      | GitHub personal access tokens. At least one is required.           |
| `PORT`                   | No       | HTTP port. Defaults to `9000`.                                     |
| `POSTGRES_URL`           | No       | Postgres connection string. Unset means the app runs without a DB. |
| `WHITELIST`              | No       | Comma-separated list of allowed usernames.                         |
| `GIST_WHITELIST`         | No       | Comma-separated list of allowed gist ids.                          |
| `EXCLUDE_REPO`           | No       | Comma-separated list of repositories to exclude.                   |
| `FETCH_MULTI_PAGE_STARS` | No       | Enables multi-page star counting.                                  |

## Health check

The image ships a `HEALTHCHECK` that polls `/api/status/up`. You can inspect it
with `docker ps` (the `STATUS` column shows `healthy` once the server is up).

## Future: static SVG generation

The image is structured so a static-generation mode can be added later as an
alternative command, without changing the build stages. Such a mode would render
cards to `.svg` files that can be served by any static file host.
