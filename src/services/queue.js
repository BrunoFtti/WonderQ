const { v4: uuidv4 } = require('uuid');
const { reinsertionTimeout, debug } = require('../config/config');
const { isEmpty } = require('../utils/object');

class Queue {
  constructor () {
    this.messages = [];
    this.pending = {};
  }

  // Remove the messages that are still in pending and add them at the start of the queue
  reinsertMessages (messageArray) {
    // Delete each message from pending if it is there, and keep the ones deleted
    const deletedMessages = messageArray.filter(msg => {
      if (this.pending[`${msg.messageId}`]) {
        // Delete the message from pending
        delete this.pending[`${msg.messageId}`];

        return true;
      }
      return false
    });

    // Insert the deleted messages at the start of the queue
    if (deletedMessages.length) {
      this.messages.unshift(...deletedMessages);
      if (debug) console.log(`${deletedMessages.length} messages reinserted after timeout`);
    }
  };

  // Reset the internal state
  clearQueue () {
    this.messages = [];
    this.pending = {};
  };

  // Add an object to the queue with a generated unique ID.
  enqueue (body) {
    // If there is no body, return null
    if (isEmpty(body)) return null;

    // Create a unique ID for the message
    const messageId = uuidv4();

    // Add the message to the queue with the ID
    this.messages.push({ ...body, messageId });

    // Return the ID
    return messageId;
  };

  // Remove the first selected amount of messages from the queue
  // Add these messages to pending individually using their IDs as keys
  // For each removed message set a timeout to reinsert it in the queue in the same order
  dequeue (body) {
    const { amount } = body;

    // If the field amount does not exist in the body return null
    if (amount === undefined) return null;

    // Dequeue the first "amount" of messages
    // Splice is faster than shift when there is a large amount of elements in the queue
    const result = this.messages.splice(0, amount);

    // Add the messages to pending
    // Set a reinsertion timeout in reverse order to keep the current message order
    for (let i = result.length - 1; i >= 0; i--) {
      const message = result[i];
      this.pending[`${message.messageId}`] = message;
    }

    setTimeout(() => this.reinsertMessages(result), reinsertionTimeout);

    return result;
  };

  // Remove a message from the pending list
  acknowledge (body) {
    const { messageId } = body;

    // If there is no messageId in the body, return null
    if (!messageId) return null

    // If the message has already been reinserted in the queue, return false
    if (!this.pending[`${messageId}`]) return false;

    // Delete the message from the pending object
    delete this.pending[`${messageId}`];

    return true;
  };
};

module.exports = new Queue();
