/**
 * Global Error Handling Middleware
 * Centralizes error responses and logs them consistently.
 */
export const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = 'An unexpected error occurred. Please try again later.';
    let status = err.status || 'error';

    // Log the complete technical details on the server console ONLY (safe from external users)
    console.error('--- SECURITY/SYSTEM ERROR LOG ---');
    console.error('Time:', new Date().toISOString());
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('--------------------------------');

    // Handle Sequelize Unique Constraint and Validation Errors safely (hides DB structure)
    if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
        statusCode = 400;
        status = 'fail';
        
        if (err.errors && err.errors.length > 0) {
            const messages = err.errors.map(e => {
                const path = e.path ? e.path.toLowerCase() : '';
                const msg = e.message ? e.message.toLowerCase() : '';
                
                // User-friendly mapping fallbacks that do not disclose database schema
                if (path.includes('email') || msg.includes('email')) {
                    return 'An account with this email address already exists.';
                }
                if (path.includes('password') || msg.includes('password')) {
                    return 'Password does not meet the security requirements.';
                }
                if (path.includes('promo') || msg.includes('promo')) {
                    return 'This promo code already exists or is invalid.';
                }
                if (path.includes('team') || msg.includes('team')) {
                    return 'A member with this detail is already associated with the team.';
                }
                return 'The provided information is invalid or already in use.';
            });
            message = [...new Set(messages)].join(' ');
        } else {
            message = 'Validation failed. Please verify your entries.';
        }
    }
    
    // Handle Sequelize Connection Failures (hides MySQL server offline status)
    else if (err.name === 'SequelizeConnectionRefusedError' || err.name === 'SequelizeConnectionError') {
        statusCode = 503;
        status = 'error';
        message = 'The service is temporarily unavailable. Please try again later.';
    }
    
    // Handle JSON Web Token Errors (keeps it simple and abstract)
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        status = 'fail';
        message = 'Your session has expired. Please log in again.';
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        status = 'fail';
        message = 'Authentication failed. Please log in again.';
    }
    
    // Catch-all override for general 500 errors
    else if (statusCode === 500) {
        message = 'An unexpected error occurred. Please try again later.';
    }

    res.status(statusCode).json({
        success: false,
        status,
        message
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

