#!/bin/bash

curl --include --request GET http://localhost:3001/users/$ID \
  --header "Authorization: Token token=$TOKEN"
