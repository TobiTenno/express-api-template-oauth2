'use strict';

require('colors');
const { transports, createLogger, format } = require('winston');

const {
  combine, label, printf, colorize,
} = format;

const color = (scope) => {
  let scoped;
  /* istanbul ignore next */
  switch (scope.toUpperCase()) {
    case 'PROC':
      scoped = 'PROC'.magenta;
      break;
    default:
      scoped = scope.toUpperCase().red;
      break;
  }
  return scoped;
};

/**
 * Create a colorized scope
 * @param  {string} scope [description]
 * @returns {Object}       set up logger
 */
const setup = (scope) => {
  /* Logger setup */
  const transport = new transports.Console({ colorize: true });
  const logFormat = printf((info) => `[${info.label}] ${info.level}: ${info.message}`);
  const logger = createLogger({
    format: combine(
      colorize(),
      label({ label: color(scope) }),
      logFormat,
    ),
    transports: [transport],
  });
  logger.level = process.env.LOG_LEVEL || 'error';
  return logger;
};

module.exports = setup;
