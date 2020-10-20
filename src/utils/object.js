// Check if an object exists and if it's empty
const isEmpty = obj => !obj || (obj.constructor === Object && Object.keys(obj).length === 0);

module.exports = { isEmpty };
