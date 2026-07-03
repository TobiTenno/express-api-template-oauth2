#!/bin/bash

curl --include --request DELETE http://localhost:3000/users/logout \
  --header "Authorization: Token token=$TOKEN"
