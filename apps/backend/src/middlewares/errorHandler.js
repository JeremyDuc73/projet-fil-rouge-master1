import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    if (err.code === '23505') {
        error = new AppError('Resource already exists', 409);
    }

    if (err.code === '23503') {
        error = new AppError('Related resource not found', 404);
    }

    if (err.code === '22P02') {
        error = new AppError('Invalid data format', 400);
    }

    const statusCode = error.statusCode || 500;
    const message = error.isOperational ? error.message : 'Internal server error';

    logger.error(message, {
        statusCode,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
