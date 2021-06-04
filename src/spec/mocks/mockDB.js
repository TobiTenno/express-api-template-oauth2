'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const mongod = new MongoMemoryServer({
  version: '4.0.14',
});

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

module.exports.close = async () => mongoose.disconnect();
