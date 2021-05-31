#!/bin/bash

curl --include --request GET http://localhost:3001/users \
  --header "Authorization: Token token=$TOKEN"
