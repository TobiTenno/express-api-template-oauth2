'use strict';

const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    index: {
      title: 'Express Template',
      environment: req.app.get('env'),
    },
  });
});

module.exports = router;
