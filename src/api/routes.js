const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const { swaggerConfig } = require('../config/config');
const queueService = require('../services/queue');
const healthService = require('../services/health');
const { sendResponse } = require('../utils/response');

const api = express.Router();

const swaggerDocs = swaggerJsDoc(swaggerConfig);

// API documentation
api.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/**
 * @swagger
 * /messages:
 *  post:
 *    summary: Enqueue one message
 *    description: Use to add a message to the queue
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            minProperties: 1
 *            example: {key1: value1, key2: value2, key3: value3}
 *    responses:
 *      '200':
 *        description: Successful
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                messageId:
 *                  type: string
 *                  example: "627014c3-344b-4be9-b7a5-8bcf4a8a4d3c"
 *      '400':
 *        description: Error - The request body is empty
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: "Error: the request body is empty"
 *
 */
api.post('/messages', (req, res) => {
  const result = queueService.enqueue(req.body);

  if (!result) sendResponse(res, 400, { status: 'Error: the request body is empty' });
  else sendResponse(res, 200, { messageId: result });
});

/**
 * @swagger
 * /messages:
 *  put:
 *    summary: Dequeue one or more messages
 *    description: Get and remove one or more messages from the queue,
 *                 setting them as pending until they are manually acknowledged,
 *                 or until they are reinserted after some time passes
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              amount:
 *                type: integer
 *                example: 3
 *    responses:
 *      '200':
 *        description: Successful
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                messages:
 *                  type: array
 *                  example: [{key1: value1},{key2: value2},{key3: value3}]
 *      '400':
 *        description: Error - there is no amount field in the request body
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: "Error: missing amount field in the request body"
 *
 */
api.put('/messages', (req, res) => {
  const result = queueService.dequeue(req.body);

  if (!result) sendResponse(res, 400, { status: 'Error: missing "amount" field in the request body' });
  else sendResponse(res, 200, { messages: result });
});

/**
 * @swagger
 * /messages:
 *  delete:
 *    summary: Acknowledge a message
 *    description: Remove a message marked as pending, searching for it by its ID
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              messageId:
 *                type: string
 *                example: "627014c3-344b-4be9-b7a5-8bcf4a8a4d3c"
 *    responses:
 *      '200':
 *        description: Successful
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: "Success"
 *      '400':
 *        description: Error - there is no messageId field in the request body
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: "Error: missing messageId field in the request body"
 *      '410':
 *         description: Error - the message has been reinserted in the queue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Error: this message has been reinserted in the queue"
 *
 */
api.delete('/messages', (req, res) => {
  const result = queueService.acknowledge(req.body);

  if (result === null) sendResponse(res, 400, { status: 'Error: missing "messageId" field in the request body' });
  else if (result === false) sendResponse(res, 410, { status: 'Error: this message has been reinserted in the queue' });
  else sendResponse(res, 200, { status: 'Success' });
});

/**
 * @swagger
 * /health:
 *  get:
 *    summary: Health check
 *    description: Check the health and uptime of the service
 *    responses:
 *      '200':
 *        description: Healthy service
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              example: { appName: WonderQ, uptime: 40.21312, message: OK, timestamp: 1603219688538 }
 */
api.get('/health', (req, res) => sendResponse(res, 200, healthService.health()));

module.exports = api;
