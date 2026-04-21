cd ../../
git clean ./apps -fx
pnpm run build:packages
pnpm --filter ./apps/backend/ --legacy deploy ./apps/deployment/
mv ./apps/deployment/node_modules/ ./apps/backend/node_modules/
./vercel-preparation.sh
