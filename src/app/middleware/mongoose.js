'use strict';

const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/express-template';
mongoose.Promise = global.Promise;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = mongoose;
