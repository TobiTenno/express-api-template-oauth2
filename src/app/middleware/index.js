'use strict';

const bodyParser = require('body-parser');
const cors = require('cors');
const favicon = require('serve-favicon');
const fs = require('fs');
const path = require('path');
const swagger = require('swagger-stats');
const yaml = require('yaml');
const RateLimit = require('express-rate-limit');

require('./mongoose');

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080',
};

const swaggerOptions = {
  swaggerSpec: yaml.parse(fs.readFileSync(path.join(__dirname, '../../../', 'openapi.yaml'), 'utf8')),
  uriPath: '/meta/status',
};

// set up rate limiter: maximum of five requests per minute
const limiter = new RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
});

module.exports = (app) => {
  app.use(cors(corsOptions));
  app.use(favicon(path.join(__dirname, '../../', 'public', 'favicon.ico')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  /* istanbul ignore next */
  if (process.env.ENABLE_SWAGGER) app.use(swagger.getMiddleware(swaggerOptions));
  app.use(limiter);
};
