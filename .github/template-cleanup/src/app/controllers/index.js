'use strict';

const router = require('express').Router();

router.use('/', require('./root'));
router.use('/users', require('./users'));

module.exports = router;
