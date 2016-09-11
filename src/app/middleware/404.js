'use strict';

const HttpError = require('../../lib/errors/HttpError');

const notFound = (request, response, next) => {
  next(new HttpError(404));
};

module.exports = notFound;
