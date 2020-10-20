const health = () => {
  return {
    appName: 'WonderQ',
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  }
};

module.exports = { health };
