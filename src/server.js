'use strict';

require('dotenv').load({
  silent: process.env.NODE_ENV === 'production', // don't log missing .env
});

const express = require('express');

const app = express();
const debug = require('debug')('express-template:server');
const http = require('http');
const middleware = require('./app/middleware');
const logger = require('./lib/logger')();
require('./app/middleware/mongoose');

middleware(app);

app.use(require('./app/controllers'));

app.use(express.static('./public'));

app.use(require('./app/middleware/404'));

/**
 * Normalize a port into a number, string, or false.
 * @param {string|number} val potentially non-normalized port number
 * @returns {number} normalized port number
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  return port >= 0 ? port : (Number.isNaN(port) ? val : false);
};

/*
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

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
    ? `Pipe ${port}`
    : `Port ${port}`;

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
  debug(`Listening on ${bind}`);
};

/*
 * Listen on provided port, on all network interfaces.
 */
server.on('error', onError);
server.on('listening', onListening);

server.listen(port);
