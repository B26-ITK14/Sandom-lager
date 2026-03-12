// Centralized error handling middleware for Express
function errorHandler(err, req, res, next) {

    console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
    console.error(err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
}

module.exports = errorHandler;