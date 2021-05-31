'use strict';

require('dotenv').load({ silent: true });

const express = require('express');

const app = express();

require('./middleware')(app);

app.use(require('./controllers'));

app.use(require('./middleware/error-handler'));

app.use(express.static('./public'));
app.use(require('./middleware/404'));

app.set('port', process.env.PORT);

module.exports = app;
