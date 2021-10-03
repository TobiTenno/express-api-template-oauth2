'use strict';

const router = require('express').Router();
const ah = require('express-async-handler');

const Example = require('../models').example;

const authenticate = require('./concerns/authenticate');

/**
 * @openapi
 * tags:
 *  - name: examples
 *    description: Example endpoints for learning
 * components:
 *   requestBodies:
 *     Example:
 *       description: Example body
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Example'
 *   schemas:
 *     Example:
 *       type: object
 *       properties:
 *         "_owner":
 *           type: string
 *           description: |
 *             Owner's user id.
 *         text:
 *           type: string
 */

/**
 * @openapi
 * /examples:
 *   get:
 *     tags:
 *       - examples
 *     summary: Get all examples
 *     description: ""
 *     operationId: getAllExample
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       "200":
 *         description: successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Example"
 *       "400":
 *         description: Invalid username supplied
 *       "404":
 *         description: User not found
 */
router.get('/', ah(async (req, res) => {
  res.json(await Example.find());
}));

/**
 * @openapi
 * /examples:
 *   post:
 *     tags:
 *       - examples
 *     summary: Make a new example object
 *     operationId: createExample
 *     requestBody:
 *       $ref: '#/components/requestBodies/Example'
 *     responses:
 *       200:
 *         description: Operation Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Example'
 */
router.post('/', authenticate, ah(async (req, res) => {
  const baseExample = {
    ...req.body,
    _owner: req.currentUser._id,
  };
  const example = await Example.create(baseExample);
  res.json(example);
}));

/**
 * @openapi
 * /examples/{id}:
 *   get:
 *     tags:
 *       - examples
 *     summary: Get a single example by id
 *     operationId: getExampleById
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The id of the example to be fetched
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Operation successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Example'
 */
router.get('/:id', ah(async (req, res) => {
  const example = await Example.findById(req.params.id);
  if (!example) {
    return res.status(404).json({ error: 'No example found' });
  }
  return res.json(example);
}));

/**
 * @openapi
 * /examples/{id}:
 *   patch:
 *     tags:
 *       - examples
 *     security:
 *       - BearerAuth: []
 *     summary: Modify an example
 *     requestBody:
 *       $ref: '#/components/requestBodies/Example'
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The id of the example to be fetched
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Operation successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Example'
 */
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

/**
 * @openapi
 * /examples/{id}:
 *   delete:
 *     tags:
 *       - examples
 *     summary: Delete an example
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/Example'
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The id of the example to be fetched
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Operation successful
 */
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
