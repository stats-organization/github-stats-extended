#!/bin/bash

# defensive error handling
set -euo pipefail

# move into the folder of this script
cd "$(dirname "$0")"

mkdir -p apps/backend/.vercel/output/functions/api.func/
# copying `backend` to `backend/.vercel/...` directly may cause problems
cp -RP apps/backend/. apps/backend-copy/
# `shopt` includes dot-files in the `mv` operation
(shopt -s dotglob && mv apps/backend-copy/* apps/backend/.vercel/output/functions/api.func/)
cp -RP apps/backend/.vercel/output/functions/api.func/_dot_vercel_copy/output apps/backend/.vercel/
rm -rf apps/deployment
pnpm install
pnpm build:frontend
# serve the built app at `/frontend`, matching the Vite `base` its assets are requested under
mkdir -p apps/backend/.vercel/output/static/frontend/
cp -RP apps/frontend/build/. apps/backend/.vercel/output/static/frontend/
# serve the same app at `/frontend/docs`, where it renders the docs instead of the wizard
mkdir -p apps/backend/.vercel/output/static/frontend/docs/
cp -P apps/frontend/build/index.html apps/backend/.vercel/output/static/frontend/docs/index.html
