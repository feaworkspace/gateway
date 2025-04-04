#!/bin/bash

echo "${FIREBASE_SERVICE_ACCOUNT_KEY}" > /home/theia/workspace/server/serviceAccountKey.json

node /home/theia/workspace/server/index.mjs &
node /home/theia/applications/browser/lib/backend/main.js $@
