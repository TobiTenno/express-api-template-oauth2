'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

module.exports.connect = async () => {
  if (mongoose) await mongoose.disconnect();

  mongod = await MongoMemoryServer.create({
    version: '4.0.14',
  });

  return mongoose.connect(mongod.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports.close = async () => mongoose.disconnect();
