'use strict';

const bodyParser = require('body-parser');
const cors = require('cors');
const favicon = require('serve-favicon');
const fs = require('fs');
const path = require('path');
const swagger = require('swagger-stats');
const yaml = require('yaml');

require('./mongoose');

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080',
};

const swaggerOptions = {
  swaggerSpec: yaml.parse(fs.readFileSync(path.join(__dirname, '../../../', 'openapi.yaml'), 'utf8')),
  uriPath: '/meta/status',
};

module.exports = (app) => {
  app.use(cors(corsOptions));
  app.use(favicon(path.join(__dirname, '../../', 'public', 'favicon.ico')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  /* istanbul ignore next */
  if (process.env.ENABLE_SWAGGER) app.use(swagger.getMiddleware(swaggerOptions));
};
