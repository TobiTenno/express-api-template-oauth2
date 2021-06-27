#!/bin/bash

export LC_CTYPE=C
export LANG=C

# Prepare variables
NAME="${GITHUB_REPOSITORY##*/}"

# Replace placeholders in the template-cleanup files
sed -i "s/%NAME%/$NAME/g" .github/template-cleanup/*
sed -i "s^%GITHUB_REPOSITORY%^$GITHUB_REPOSITORY^g" .github/template-cleanup/*

# Replace template artifact name in project files with $NAME
find . -type f -exec sed -i "s/express-api-template-oauth2/$NAME/ig" {} +
find . -type f -exec sed -i "s/express-api-template/$NAME/ig" {} +
find . -type f -exec sed -i "s/express-template/$NAME/ig" {} +

# Move content
cp -R .github/template-cleanup/* .

# Cleanup
rm -rf \
  LICENSE \
  src/app/controllers/examples.js \
  src/spec/example.spec.js \
  .github/template-cleanup/ \
  .github/workflows/template-cleanup.yml \
  cleanup.sh
