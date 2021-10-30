'use strict';

const mongoose = require('mongoose');

/* istanbul ignore next */
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/express-template';
/* istanbul ignore next */
if (mongoose.connection.readyState < 1 && !process.env.CI) {
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

module.exports = mongoose;
