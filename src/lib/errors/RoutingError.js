'use strict';

// ActionController::RoutingError (uninitialized constant WhateversController):
module.exports = class RoutingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RoutingError';
    this.message = message || 'RoutingError';
  }
};
