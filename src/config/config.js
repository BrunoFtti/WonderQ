const dotenv = require('dotenv');
const path = require('path');

// find the .env file path and load its content as environment variables
const envPath = path.join(__dirname, '.env.' + (process.env.NODE_ENV || 'development'));
const dotenvResult = dotenv.config({ path: envPath });
if (dotenvResult.error) {
  console.warn(`Warning: Could not read configuration file ${envPath}. Using default values.\n`);
}

module.exports = {
  port: process.env.PORT || 8080,
  reinsertionTimeout: parseInt(process.env.REINSERTION_TIMEOUT, 10) || 20000,
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000
};
