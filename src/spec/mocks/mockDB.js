'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const mongod = new MongoMemoryServer();

module.exports.connect = async () => {
  await mongoose.disconnect();

  const uri = await mongod.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };

  return mongoose.connect(uri, mongooseOpts);
};

module.exports.close = () => {
  if (mongoose.connection.readyState === 1) return mongoose.disconnect();
  return null;
};
