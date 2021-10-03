'use strict';

const router = require('express').Router();

/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *       - Default
 *     summary: Get environment
 *     operationId: root
 *     responses:
 *       "200":
 *         description: successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 index:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 */
router.get('/', (req, res) => {
  res.json({
    index: {
      title: 'Express Template',
      environment: req.app.get('env'),
    },
  });
});

module.exports = router;
