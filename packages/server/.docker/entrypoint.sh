#!/bin/bash

node /home/theia/workspace/server/index.mjs &
node /home/theia/applications/browser/lib/backend/main.js $@
