/*
  * asyncHandler.js
  * Utility to wrap async route handlers and forward errors to Express error middleware.
  * Is used throughout the backend to simplify error handling in async functions.
  * Author: Andreas Skaarberg
*/
// Utility function to wrap async route handlers and pass errors to Express error handling middleware
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;