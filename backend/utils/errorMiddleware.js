/**
 * Global Error Handling Middleware
 * Centralizes error responses and logs them consistently.
 */
export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error for the developer
    console.error('--- API ERROR ---');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('----------------');

    // Send response to user (Avoid leaking implementation details in production for 500 errors)
    const isProduction = process.env.NODE_ENV === 'production';
    const message = (isProduction && err.statusCode === 500)
        ? 'Internal Server Error'
        : (err.message || 'Internal Server Error');

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: message
    });
};

/**
 * Utility to catch async errors in controllers (avoid try-catch blocks)
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
