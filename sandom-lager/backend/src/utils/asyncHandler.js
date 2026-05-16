/*
  * asyncHandler.js
  * Utility to wrap async route handlers and forward errors to Express error middleware.
  * Author:
*/
// Utility function to wrap async route handlers and pass errors to Express error handling middleware
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;