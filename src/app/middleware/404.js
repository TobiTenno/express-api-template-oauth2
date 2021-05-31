'use strict';

module.exports = (request, response) => {
  response.status(404).json({ error: 'No route found' });
};
