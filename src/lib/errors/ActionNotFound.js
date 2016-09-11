'use strict';

// AbstractController::ActionNotFound \
// (The action 'action' could not be found for ExamplesController)
module.exports = class ActionNotFound extends Error {
  constructor(message) {
    super(message);
    this.name = 'ActionNotFound';
    this.message = message || 'ActionNotFound';
  }
};
