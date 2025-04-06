#!/bin/bash

echo "${FIREBASE_SERVICE_ACCOUNT_KEY}" > /app/serviceAccountKey.json

node /app/dist/server/index.mjs
