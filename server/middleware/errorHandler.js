const createError = require('http-errors');

const errorHandler = (err, req, res, next) => 
{

    console.error('\n=== Error Handler ===');
    console.error('Time:', new Date().toLocaleString());
    console.error('URL:', req.originalUrl);
    console.error('Method:', req.method);
    console.error('Error:', err.message);
    
    if (err.stack) 
    {
        console.error('Stack:', err.stack);
    }
    console.error('=====================\n');
    
    if (!err.statusCode) 
    {
        err.statusCode = 500;
    }
    
    if (err.name === 'ValidationError') 
    {
        err.statusCode = 400;
        
        const messages = Object.values(err.errors).map(e => e.message);
        err.message = `Validation failed: ${messages.join('. ')}`;
    }
    
    if (err.code === 11000) 
    {
        err.statusCode = 409;
        const field = Object.keys(err.keyPattern)[0];
        err.message = `${field} already exists. Please use a different ${field}.`;
    }
    
    if (err.name === 'CastError') 
    {
        err.statusCode = 400;
        err.message = `Invalid ${err.path}: ${err.value}. Please provide a valid ID.`;
    }
    
    if (err.name === 'JsonWebTokenError') 
    {
        err.statusCode = 401;
        err.message = 'Invalid token. Please log in again.';
    }
    
    if (err.name === 'TokenExpiredError') 
    {
        err.statusCode = 401;
        err.message = 'Your session has expired. Please log in again.';
    }
    
    if (err instanceof ReferenceError) 
    {
        err.statusCode = 400;
        err.message = "A server error occurred. Please check your input.";
    }
    
    res.status(err.statusCode).json({
        success: false,
        status: err.statusCode,
        message: err.message || 'An unexpected error occurred',
        
        ...(process.env.NODE_ENV === 'development' && 
        { 
            stack: err.stack,
            details: err
        })
    });
};

const notFoundHandler = (req, res, next) => 
{
    next(createError(404, `Route not found: ${req.originalUrl}`));
};

module.exports = 
{
    errorHandler,
    notFoundHandler
};