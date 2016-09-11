# express-api-template-oauth2

A template for starting projects with `express` as an API. Includes
authentication and common middlewares.

## Dependencies

Install with `npm install`.

-   [`express`](http://expressjs.com/)
-   [`mongoose`](http://mongoosejs.com/)

At the beginning of each cohort, update the versions in
[`package.json`](package.json) by replace all versions with a glob (`*`) and
running `npm update --save && npm update --save-dev`. You may wish to test these
changes by deleting the `node_modules` directory and running `npm install`.
Fix any conflicts.

## Installation

1.  Click the "Use this template" button on the root page of the repository
1.  Replace all instances of `'express-template'` with your app name. This
    includes `package.json`, various debugger configurations, and the MongoDB
    store.
1.  Install dependencies with `npm install`.
1.  Set a SECRET_KEY in the environment (`.env` file or process manager of your choice).
1.  Run the API server with `npm start`. If you want your code to be reloaded on
    change, you should use `npm run dev` instead of
    `npm start`.

For development and testing, set the SECRET_KEY from the root of your
 repository using

```sh
echo SECRET_KEY=$(/usr/local/opt/openssl/bin/openssl rand -base64 66 | tr -d '\n') >>.env
```


## Structure

Dependencies are stored in [`package.json`](package.json).

Developers should store JavaScript files in [`src/app/controllers`](src/app/controllers)
 and [`src/app/models`](src/app/models).

Routes should follow express patterns for using index.js files in folders, such as `app.use('/examples', require('./examples'))` from [`src/app/controllers/index.js`](src/app/controllers/index.js)

## Tasks

Developers should run these often!

-   `npm run test`: Tests your code 
-   `npm run lint:fix`: Fixes any auto-fixable issues

## API

Use the included [`openapi.yaml`](./openapi.yaml) [OAS3](https://swagger.io/docs/specification/about/) specification file to document your API in a reproduceable manner. You can even make a documentation to make this easier to read with the open-source automated reference documentation tool provided by [redoc](https://github.com/Redocly/redoc).
