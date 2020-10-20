// Sends a response with the data and status provided
const sendResponse = (res, statusCode, data) => {
  // Checks if a response has already been sent
  if (res && !res.headersSent) {
    res.statusCode = statusCode;
    res.json(data);
  }
}

module.exports = sendResponse;
