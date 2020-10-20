const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const routes = require('./api/routes');
const sendResponse = require('./utils/response');
const { port, requestTimeout } = require('./config/config');

const app = express();
app.use(cors());
app.use(morgan(':status - :method :url - :response-time ms'));
app.use(express.json());
app.use((req, res, next) => {
  res.setTimeout(requestTimeout, () => {
    console.warn('Request has timed out');
    sendResponse(res, 408, null);
  });
  next();
});

app.use('/wonderq/api/', routes);

app.listen(port, () => console.log(`Service running on port ${port}`));

module.exports = app;
