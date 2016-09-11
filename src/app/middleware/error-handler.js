'use strict';

const debug = require('debug')('express-template:error-handler');

const errorHandler = (err, req, res) => {
  const errorResponse = {
    error: {
      message: err.message,
    },
  };

  // include stacktrace
  if (req.app.get('env') === 'development') {
    errorResponse.error.error = err;
    debug(errorResponse);
  }

  res.status(err.status || 500).json(errorResponse);
};

module.exports = errorHandler;
