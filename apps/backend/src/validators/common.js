import { param, query } from 'express-validator';
import { PAGINATION } from '../utils/constants.js';

export const idParam = param('id')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer');

export const movieIdParam = param('movieId')
    .isInt({ min: 1 })
    .withMessage('movieId must be a positive integer');

export const reviewIdParam = param('reviewId')
    .isInt({ min: 1 })
    .withMessage('reviewId must be a positive integer');

export const tmdbIdParam = param('tmdbId')
    .isInt({ min: 1 })
    .withMessage('tmdbId must be a positive integer');

export const paginationQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
        .withMessage(`limit must be between 1 and ${PAGINATION.MAX_LIMIT}`),
    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('offset must be a non-negative integer'),
];
