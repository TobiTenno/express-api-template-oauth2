#!/bin/bash

curl --include --request DELETE http://localhost:3001/users/logout \
  --header "Authorization: Token token=$TOKEN"
