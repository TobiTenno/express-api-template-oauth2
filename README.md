# express-api-template-oauth2

Express API template on NestJS + TypeScript. Nest runs on Express under the hood —
structured modules, DI, and TypeScript without leaving the Express ecosystem.

Includes bearer-token auth, Mongoose models, rate limiting, OpenAPI docs, and
common middleware.

## Dependencies

Install with `npm install`.

- [`express`](https://expressjs.com/) (via `@nestjs/platform-express`)
- [`@nestjs/core`](https://nestjs.com/)
- [`mongoose`](http://mongoosejs.com/)

## Installation

1. Click the "Use this template" button on the root page of the repository
1. Replace all instances of `express-template` / `express-api-template-oauth2` with
   your app name. This includes `package.json`, debugger configs, and the MongoDB
   store name.
1. Install dependencies with `npm install`.
1. Set `SECRET_KEY` and `INITIALIZATION_VECTOR` in the environment (`.env` file or
   process manager of your choice).
1. Run the API server with `npm start`. For reload on change, use `npm run dev`.

For development and testing, set secrets from the repository root:

```sh
echo SECRET_KEY=$(openssl rand -base64 32 | tr -d '\n' | head -c 32) >>.env
echo INITIALIZATION_VECTOR=$(openssl rand -base64 16 | tr -d '\n' | head -c 16) >>.env
```

`SECRET_KEY` must be 32 bytes and `INITIALIZATION_VECTOR` must be 16 bytes (AES-256-CBC).

## Structure

Layered layout — controllers, services, and modules live in separate folders:

```
src/
  main.ts
  controllers/            # HTTP layer (Express routes via Nest)
  services/               # business logic
  modules/                # Nest module wiring (incl. app.module)
  dto/
  schemas/
  common/                 # filters, guards, decorators, utils
  types/
test/                     # Mocha + Chai specs
```

ESM TypeScript (`"type": "module"`) with extensionless relative imports
(`./modules/app.module`, not `./modules/app.module.js`). Runtime resolves them via
[`extensionless`](https://www.npmjs.com/package/extensionless).

## Tasks

- `npm run test` — run Mocha specs
- `npm run lint:fix` — auto-fix lint issues
- `npm run build` — compile TypeScript
- `npm run start:dev` / `npm run dev` — watch mode

## API

OpenAPI spec lives in [`openapi.yaml`](./openapi.yaml). Browse docs at `/docs` when
the server is running. Swagger UI is also available at `/meta/swagger`.

### Auth

- **Signup** `POST /users/signup` with `{ email, password }` or `{ credentials: { email, password } }`
- **Login** `POST /users/login` with HTTP Basic (`email:password`)
- **Bearer** subsequent requests use `Authorization: Bearer <token>` from login

### Gotchas

Updating virtual properties that have alternate validations/encodings/encryptions
(e.g. `password`) must use direct assignment and `save()`, not only
`findOneAndUpdate`.
