'use strict';

const http = require('http');

const app = require('./app');
const logger = require('./lib/logger')('PROC');

/*
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 * @param {Error} error an error to handle
 */
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${app.get('port')}`
    : `Port ${app.get('port')}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  logger.debug(`Listening on ${bind}`);
};

/*
 * Listen on provided port, on all network interfaces.
 */
server.on('error', onError);
server.on('listening', onListening);

server.listen(app.get('port'));
