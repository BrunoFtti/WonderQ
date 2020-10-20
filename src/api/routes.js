const express = require('express');
const queueService = require('../services/queue');
const health = require('../services/health');
const sendResponse = require('../utils/response');

const api = express.Router();

// Health
api.get('/health', (req, res) => {
  const result = health();
  sendResponse(res, 200, result);
});

// Queue
api.post('/enqueue', (req, res) => {
  const result = queueService.enqueue(req.body);

  if (!result) sendResponse(res, 400, { status: 'Error: the request body is empty' });
  else sendResponse(res, 200, { messageId: result });
});

// Dequeue
api.put('/dequeue', (req, res) => {
  const result = queueService.dequeue(req.body);

  if (!result) sendResponse(res, 400, { status: 'Error: missing "amount" in the request body' });
  else sendResponse(res, 200, { messages: result });
});

// Acknowledge processed messages
api.delete('/acknowledge', (req, res) => {
  const result = queueService.acknowledge(req.body);

  if (result === null) sendResponse(res, 400, { status: 'Error: missing "messageId" in the request body' });
  else if (result === false) sendResponse(res, 410, { status: 'Error: this message has been reinserted in the queue' });
  else sendResponse(res, 200, { status: 'Success' });
});

module.exports = api;
