#!/bin/bash

# defensive error handling
set -euo pipefail

# move into the folder of this script
cd "$(dirname "$0")"

mkdir -p backend/.vercel/output/functions/api.func/
rsync -a --exclude '.vercel' backend/ backend/.vercel/output/functions/api.func/
cp -R backend/.vercel/output/functions/api.func/_dot_vercel_copy/output backend/.vercel/
cp -R backend frontend/frontend/src/backend/
