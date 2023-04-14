// try catch function to catch errors in async functions

module.exports = (func) => (req, res, next) => {
  Promise.resolve(func(req, res, next)).catch(next);
};

