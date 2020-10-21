const queueService = require('./queue');
const { reinsertionTimeout } = require('../config/config');

// Creates a test message with dynamic content
const createTestMsg = name => {
  const result = {};
  result[`testKey${name}`] = `testValue${name}`;
  return result;
}

describe('Queue', () => {
  // Reset the queue internal state before every test
  beforeEach(() => queueService.clearQueue());

  describe('Enqueue', () => {
    test('One message', () => {
      const testMsg = createTestMsg();
      const messageId = queueService.enqueue(testMsg);

      // The message should be in the messages queue
      expect(queueService.messages[0]).toMatchObject({ ...testMsg, messageId });
    });

    test('Two messages', () => {
      const testMsg1 = createTestMsg(1);
      const testMsg2 = createTestMsg(2);

      const messageId1 = queueService.enqueue(testMsg1);
      const messageId2 = queueService.enqueue(testMsg2);

      // The first message enqueued should be the first one obtained
      expect(queueService.messages[0]).toMatchObject({ ...testMsg1, messageId: messageId1 });

      // The second message enqueued should be the second one obtained
      expect(queueService.messages[1]).toMatchObject({ ...testMsg2, messageId: messageId2 });
    });

    test('With an empty body', () => {
      const result = queueService.enqueue({});

      // The obtained value should be null
      expect(result).toBeNull();

      // The messages queue should still be empty
      expect(queueService.messages.length).toBe(0);
    });
  });

  describe('Dequeue', () => {
    test('One message in an empty queue', () => {
      // The obtained value should be an empty array
      expect(queueService.dequeue({ amount: 1 }).length).toBe(0);
    });

    test('Enqueue a message, then dequeue one', () => {
      const testMsg = createTestMsg();
      const messageId = queueService.enqueue(testMsg);
      const obtainedMessages = queueService.dequeue({ amount: 1 });

      // The obtained value should be an array containing the message enqueued
      expect(obtainedMessages[0]).toMatchObject({ ...testMsg, messageId });

      // The messages queue should now be empty
      expect(queueService.messages.length).toBe(0);

      // The message should still be in pending
      expect(queueService.pending[`${messageId}`]).toMatchObject({ ...testMsg, messageId });
    });

    test('Enqueue three messages, dequeue three individually', () => {
      const testMsg1 = createTestMsg(1);
      const testMsg2 = createTestMsg(2);
      const testMsg3 = createTestMsg(3);

      const messageId1 = queueService.enqueue(testMsg1);
      const messageId2 = queueService.enqueue(testMsg2);
      const messageId3 = queueService.enqueue(testMsg3);

      const obtainedMessages1 = queueService.dequeue({ amount: 1 });
      const obtainedMessages2 = queueService.dequeue({ amount: 1 });
      const obtainedMessages3 = queueService.dequeue({ amount: 1 });

      // The obtained messages should be in the correct order
      expect(obtainedMessages1[0]).toMatchObject({ ...testMsg1, messageId: messageId1 });
      expect(obtainedMessages2[0]).toMatchObject({ ...testMsg2, messageId: messageId2 });
      expect(obtainedMessages3[0]).toMatchObject({ ...testMsg3, messageId: messageId3 });
    });

    test('With an empty body, after enqueuing one message', () => {
      const testMsg = createTestMsg();
      const messageId = queueService.enqueue(testMsg);
      const result = queueService.dequeue({});

      // The obtained value should be null
      expect(result).toBeNull();

      // The message should still be in the messages queue
      expect(queueService.messages[0]).toMatchObject({ ...testMsg, messageId });

      // The message should not be in pending
      expect(queueService.pending[`${messageId}`]).toBeUndefined();
    });
  });

  describe('Enqueue and dequeue a message, then Acknowledge the message', () => {
    test('Before the reinsertion time has passed', () => {
      const messageId = queueService.enqueue(createTestMsg());
      queueService.dequeue({ amount: 1 });
      const ackResult = queueService.acknowledge({ messageId });

      // The obtained value should be true
      expect(ackResult).toBe(true);

      // The messages queue should be empty
      expect(queueService.messages.length).toBe(0);

      // The message should not be in pending
      expect(queueService.pending[`${messageId}`]).toBeUndefined();
    });

    test('After the reinsertion time has passed', () => {
      const testMsg = createTestMsg();
      const messageId = queueService.enqueue(testMsg);

      // Set fake timers so the test does not need to wait for the timeout of reinsertion
      jest.useFakeTimers();

      queueService.dequeue({ amount: 1 });

      // Fast-forward until all timers have been executed
      jest.runAllTimers();

      // Check that setTimeout has been called with the configured time
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), reinsertionTimeout);

      // Acknowledge the message
      const ackResult = queueService.acknowledge({ messageId });

      // The obtained value should be false
      expect(ackResult).toBe(false);

      // The message should still be in the queue
      expect(queueService.messages[0]).toMatchObject({ ...testMsg, messageId });

      // The message should not be in pending anymore
      expect(queueService.pending[`${messageId}`]).toBeUndefined();
    });
  });
});
