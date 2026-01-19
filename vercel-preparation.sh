#!/bin/bash

# defensive error handling
set -euo pipefail

# move into the folder of this script
cd "$(dirname "$0")"

mkdir -p backend/.vercel/output/functions/api.func/
# copying `backend` to `backend/.vercel/...` directly may cause problems
cp -R backend/. backend-copy/
# `shopt` includes dot-files in the `mv` operation
(shopt -s dotglob && mv backend-copy/* backend/.vercel/output/functions/api.func/)
cp -R backend/.vercel/output/functions/api.func/_dot_vercel_copy/output backend/.vercel/
cp -R backend frontend/frontend/src/backend/
