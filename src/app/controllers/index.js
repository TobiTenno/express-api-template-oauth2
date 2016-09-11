'use strict';

const router = require('express').Router();

router.use('/', require('./root'));
router.use('/users', require('./users'));
router.use('/examples', require('./examples'));

module.exports = router;
