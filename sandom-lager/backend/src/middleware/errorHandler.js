/*
    * errorHandler.js
    * Centralized error handling middleware for Express.
    * Author:
*/
// Centralized error handling middleware for Express
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;

    console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
    console.error({
        statusCode,
        name: err.name,
        code: err.code,
        message: err.message,
        detail: err.detail,
        stack: err.stack,
        userId: req.user?.id,
        authSub: req.auth?.sub,
        requestId: req.headers["x-request-id"] || null,
    });


    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
}

module.exports = errorHandler;