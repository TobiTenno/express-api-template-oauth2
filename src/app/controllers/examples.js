'use strict';

const router = require('express').Router();
const ah = require('express-async-handler');

const Example = require('../models').example;

const authenticate = require('./concerns/authenticate');

// read all
router.get('/', ah(async (req, res) => {
  res.json(await Example.find());
}));

// create
router.post('/', authenticate, ah(async (req, res) => {
  const baseExample = {
    ...req.body,
    _owner: req.currentUser._id,
  };
  const example = await Example.create(baseExample);
  res.json(example);
}));

// read
router.get('/:id', ah(async (req, res) => {
  const example = await Example.findById(req.params.id);
  if (!example) {
    return res.status(404).json({ error: 'No example found' });
  }
  return res.json(example);
}));

// update
router.patch('/:id', authenticate, ah(async (req, res) => {
  const search = { _id: req.params.id, _owner: req.currentUser._id };
  const example = await Example.findOne(search);
  if (!example) {
    return res.status(404).json({ error: 'No example found' });
  }

  delete req.body._owner; // disallow owner reassignment.
  await example.updateOne(req.body);
  return res.status(200).end();
}));

// delete
router.delete('/:id', authenticate, ah(async (req, res) => {
  const search = { _id: req.params.id, _owner: req.currentUser._id };
  const example = await Example.findOne(search);
  if (!example) {
    return res.status(404).json({ error: 'No example found' });
  }

  await Example.deleteOne(search);
  return res.status(200).end();
}));

module.exports = router;
