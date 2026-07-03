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

# Drop example resource from the app module
sed -i "/ExamplesModule/d" src/modules/app.module.ts
sed -i "/examples.module/d" src/modules/app.module.ts

# Move content
cp -R .github/template-cleanup/* .

# Cleanup example resource and template scaffolding
rm -rf \
  LICENSE \
  src/controllers/examples.controller.ts \
  src/services/examples.service.ts \
  src/modules/examples.module.ts \
  src/dto/create-example.dto.ts \
  src/dto/update-example.dto.ts \
  src/schemas/example.schema.ts \
  test/examples.spec.ts \
  .github/template-cleanup/ \
  .github/workflows/template-cleanup.yml \
  cleanup.sh
