#!/bin/bash

# defensive error handling
set -euo pipefail

# move into the folder of this script
cd "$(dirname "$0")"

mkdir -p apps/backend/.vercel/output/functions/api.func/
# copying `backend` to `backend/.vercel/...` directly may cause problems
cp -R apps/backend/. apps/backend-copy/
# `shopt` includes dot-files in the `mv` operation
(shopt -s dotglob && mv apps/backend-copy/* apps/backend/.vercel/output/functions/api.func/)
cp -R apps/backend/.vercel/output/functions/api.func/_dot_vercel_copy/output apps/backend/.vercel/
rm -rf apps/backend/node_modules
du -hcs ./apps/backend/
cp -R apps/backend apps/frontend/src/backend/
