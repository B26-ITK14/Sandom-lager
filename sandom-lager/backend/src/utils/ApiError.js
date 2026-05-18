/*
    * ApiError.js
    * Custom API error class carrying HTTP status codes and messages.
    * Is used throughout the backend to standardize error handling and responses.
    * Author: Andreas Skaarberg
*/
// A custom error class for API errors, allowing us to include an HTTP status code and a message.
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;