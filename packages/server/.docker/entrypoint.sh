#!/bin/bash

node /home/theia/feaspace/server/index.mjs &
node /home/theia/applications/browser/lib/backend/main.js $@
