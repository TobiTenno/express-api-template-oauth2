'use strict';

const router = require('express').Router();
const ah = require('express-async-handler');

const Example = require('../models').example;

const authenticate = require('./concerns/authenticate');

// index
router.get('/', ah(async (req, res, next) => {
  try {
    const examples = await Example.find();
    res.json(examples);
  } catch (e) {
    next(e);
  }
}));

// show
router.get('/:id', ah(async (req, res) => {
  try {
    const example = await Example.findById(req.params.id);
    if (!example) {
      return res.status(404).json({ error: 'No example found' });
    }
    return res.json(example);
  } catch (e) {
    return res.status(500).json({ error: `Failed to find ${req.params.id}` });
  }
}));

router.post('/', authenticate, ah(async (req, res) => {
  const baseExample = Object.assign(req.body.example, {
    _owner: req.currentUser._id,
  });
  try {
    const example = await Example.create(baseExample);
    res.json({ example });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}));

router.patch('/:id', authenticate, ah(async (req, res) => {
  const search = { _id: req.params.id, _owner: req.currentUser._id };
  try {
    const example = await Example.findOne(search);
    if (!example) {
      return res.status(404).json({ error: 'No example found' });
    }

    delete req.body._owner; // disallow owner reassignment.
    await example.update(req.body.example);
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}));

router.delete('/:id', authenticate, ah(async (req, res) => {
  const search = { _id: req.params.id, _owner: req.currentUser._id };
  try {
    const example = await Example.findOne(search);
    if (!example) {
      return res.status(404).json({ error: 'No example found' });
    }

    await example.remove();
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}));

module.exports = router;
