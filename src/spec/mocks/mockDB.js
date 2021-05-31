'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const mongod = new MongoMemoryServer();

module.exports.connect = async () => {
  if (mongoose.connection) mongoose.disconnect();

  const uri = await mongod.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };

  return mongoose.connect(uri, mongooseOpts);
};

module.exports.close = () => {
  if (mongoose.connection) mongoose.disconnect();
};
