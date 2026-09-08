/**
 * NestJS mongoose v12 uses `import * as mongoose from 'mongoose'` (ESM).
 * Under tsx, `mongoose.createConnection` can run with a Module Namespace as
 * `this`, so `nextConnectionId++` hits a getter-only property. Bind to the
 * real Mongoose singleton before Nest loads.
 */
import mongoose from 'mongoose';

const createConnection = mongoose.createConnection.bind(mongoose);
mongoose.createConnection = createConnection as typeof mongoose.createConnection;
