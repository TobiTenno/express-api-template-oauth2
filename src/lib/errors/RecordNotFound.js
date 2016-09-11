'use strict';

// ActiveRecord::RecordNotFound
module.exports = class RecordNotFound extends Error {
  constructor(message) {
    super(message);
    this.name = 'RecordNotFound';
    this.message = message || 'RecordNotFound';
    this.stack = (new Error()).stack;
  }
};
