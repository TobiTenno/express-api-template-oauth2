'use strict';

const logger = require('../../lib/logger')('API');

const errorHandler = (err, req, res, next) => {
  if (!err) return next();
  logger.debug(err);
  return res.status(err.status || 500).json({ error: err.message });
};

module.exports = errorHandler;
