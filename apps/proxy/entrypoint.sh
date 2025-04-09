#!/bin/bash

echo "${FIREBASE_SERVICE_ACCOUNT_KEY}" > /app/serviceAccountKey.json

pnpm start
