'use strict';

/* eslint-disable func-names */

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

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
  throw new Error('Not Authorized');
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
  if (!this._password) {
    throw new Error('password lost');
  }

  const salt = bcrypt.genSaltSync(null);
  if (!salt) {
    throw new Error('no salt');
  }
  const digest = bcrypt.hashSync(this._password, salt);
  if (!digest) {
    throw new Error('no digest');
  }
  this.passwordDigest = digest;
  next();
});

User.methods.setPassword = function (password) {
  try {
    const salt = bcrypt.genSaltSync(null);
    const digest = bcrypt.hashSync(password, salt);
    this.passwordDigest = digest;
    this.save();
  } catch (e) {
    logger.error(e);
  }
};

module.exports = mongoose.model('User', User);
