#!/bin/bash

echo "${FIREBASE_SERVICE_ACCOUNT_KEY}" > /app/serviceAccountKey.json

pnpm oct-server --hostname=0.0.0.0 --port=${OCT_SERVER_PORT:-8100} &

pnpm start
