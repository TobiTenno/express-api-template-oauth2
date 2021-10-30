#!/bin/bash

curl --include --request POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -ne "an@example.email:an example password" | base64 --wrap 0)" \
  http://localhost:3000/users/login
