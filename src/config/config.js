const dotenv = require('dotenv');
const path = require('path');

// find the .env file path and load its content as environment variables
const envPath = path.join(__dirname, '.env.' + (process.env.NODE_ENV || 'development'));
const dotenvResult = dotenv.config({ path: envPath });
if (dotenvResult.error) {
  console.warn(`Warning: Could not read configuration file ${envPath}. Using default values.\n`);
}

// Get port from configuration or set default
const port = process.env.PORT || 8080;

// Swagger configuration
const swaggerConfig = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'WonderQ',
      version: '1.0.0',
      description: 'Simple queuing system'
    },
    servers: [{ url: `http://localhost:${port}/wonderq/api` }]
  },
  apis: ['src/api/routes.js']
};

module.exports = {
  debug: process.env.DEBUG === 'true',
  port,
  reinsertionTimeout: parseInt(process.env.REINSERTION_TIMEOUT, 10) || 20000,
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000,
  swaggerConfig
};
