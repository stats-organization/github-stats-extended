#!/bin/sh
set -e

# Replace build-time placeholders in the static frontend bundle with runtime environment variables
if [ -n "$OAUTH_CLIENT_ID" ]; then
  find apps/frontend/build -type f -name '*.js' \
    -exec sed -i "s/__OAUTH_CLIENT_ID__/$OAUTH_CLIENT_ID/g" {} +
fi

exec "$@"
