'use strict';

const path = require('path');
const redoc = require('redoc-express');
const router = require('express').Router();

const cache = require('apicache').options({
  appendKey: (req) => `${req.platform}${req.language}` || '',
}).middleware;

const definition = require('../../scripts/swaggerDefinition');

router.use('/', require('./root'));

router.get('/docs/openapi.yaml',
  cache('24 hours'),
  (req, res) => res.sendFile(path.join(__dirname, '../../../', 'openapi.yaml')));
router.get('/docs', redoc({
  title: definition.info.title,
  specUrl: '/docs/openapi.yaml',
}));

router.use('/users', require('./users'));
router.use('/examples', require('./examples'));

module.exports = router;
