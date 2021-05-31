'use strict';

require('dotenv').load({
  silent: process.env.NODE_ENV === 'production', // don't log missing .env
});

const express = require('express');

const app = express();
const middleware = require('./middleware');
require('./middleware/mongoose');

middleware(app);

app.use(require('./controllers'));

app.use(require('./middleware/error-handler'));

app.use(express.static('./public'));
app.use(require('./middleware/404'));

app.set('port', process.env.PORT);

module.exports = app;
