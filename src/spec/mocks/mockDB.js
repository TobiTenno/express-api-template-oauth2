'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

module.exports.connect = async () => {
  if (mongoose) await mongoose.disconnect();

  mongod = await MongoMemoryServer.create({
    version: '4.0.14',
  });

  const uri = mongod.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };

  return mongoose.connect(uri, mongooseOpts);
};

module.exports.close = async () => mongoose.disconnect();
