'use strict';

/* eslint-disable func-names */
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// eslint-disable-next-line no-unused-vars
const logger = require('../../lib/logger')('M-USER');

const User = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  token: {
    type: String,
    require: true,
  },
  passwordDigest: String,
}, {
  timestamps: true,
});

User.plugin(uniqueValidator);

User.methods.comparePassword = function (password) {
  const compared = bcrypt.compareSync(password, this.passwordDigest);
  if (compared) {
    return this.token;
  }
  const err = new Error('Not Authorized');
  err.status = 401;
  throw err;
};

/**
 * Set the virtual _password field for saving the user and generating a password digest
 * virtual handlers *must* be a function, not an arrow callback
 * @param  {string} password password to set to virtual field
 */
User.virtual('password').set(function (password) {
  this._password = password;
});

User.pre('save', function (next) {
  /* istanbul ignore else */
  if (this._password) {
    const salt = bcrypt.genSaltSync(null);
    /* istanbul ignore next */
    if (!salt) {
      throw new Error('no salt');
    }
    const digest = bcrypt.hashSync(this._password, salt);
    /* istanbul ignore next */
    if (!digest) {
      throw new Error('no digest');
    }
    this.passwordDigest = digest;
  }
  next();
});

module.exports = mongoose.model('User', User);
