const { v4: uuidv4 } = require('uuid');
const { reinsertionTimeout, debug } = require('../config/config');
const { isEmpty } = require('../utils/object');

const queue = [];
const pending = {};

// If the message exists in pending, removes it and reinserts it as the first of the queue
const reinsertMessage = message => {
  const { messageId } = message;

  // Searches the message in pending
  if (pending[`${messageId}`]) {
    // Reinserts the message as the first of the queue
    queue.unshift(message);

    // Deletes the message from pending
    delete pending[`${messageId}`];

    if (debug) console.log(`${messageId} reinserted after timeout`);
  }
};

// Add an object to the queue with a generated unique ID.
const enqueue = body => {
  // If there is no body, return null
  if (isEmpty(body)) return null;

  // Create a unique ID for the message
  const messageId = uuidv4();

  // Add the message to the queue with the ID
  queue.push({ ...body, messageId });

  // Return the ID
  return messageId;
};

// Remove the first selected amount of messages from the queue
// Add the messages to a pending object by its ID
// For each removed message set a timeout to reinsert it in the queue in the same order
const dequeue = body => {
  const { amount } = body;

  // If the field amount does not exist in the body return null
  if (amount === undefined) return null;

  // Dequeue the first "amount" of messages
  // Splice is faster than shift when there is a large amount of elements in the queue
  const result = queue.splice(0, amount);

  // Add the messages to the pending object
  // Set a reinsertion timeout in reverse order to keep the current message order
  for (let i = result.length - 1; i >= 0; i--) {
    const message = result[i];
    pending[`${message.messageId}`] = message;
    setTimeout(() => reinsertMessage(message), reinsertionTimeout);
  }

  return result;
}

// Remove a message from the pending list
const acknowledge = body => {
  const { messageId } = body;

  // If there is no messageId in the body, return null
  if (!messageId) return null

  // If the message has already been reinserted in the queue, return false
  if (!pending[`${messageId}`]) return false;

  // Delete the message from the pending object
  delete pending[`${messageId}`];

  return true;
};

module.exports = { acknowledge, dequeue, enqueue };
