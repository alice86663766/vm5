#!/bin/sh

echo "Starting node server: $NODE_ENV Mode"

if [ $NODE_ENV = "production" ]; then
  /nvm_run.sh npm start
elif [ $NODE_ENV = "development" ]; then
  cd /dashboard && /nvm_run.sh gulp live-server
elif [ $NODE_ENV = "test" ]; then
  /nvm_run.sh npm run test
elif [ $NODE_ENV = "autotest" ]; then
  /nvm_run.sh npm run autotest
fi
