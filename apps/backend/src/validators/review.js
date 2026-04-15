import { body, param, query } from 'express-validator';

const reviewTextChain = body('reviewText')
    .optional()
    .isString()
    .trim()
    .custom((value) => {
        if (value === undefined || value === null || value === '') return true;
        if (value.length < 10) throw new Error('Review text must be at least 10 characters long');
        if (value.length > 1000) throw new Error('Review text must not exceed 1000 characters');
        return true;
    });

export const movieReviewsListRules = [
    param('movieId').isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('sortBy').optional().isIn(['recent', 'oldest', 'rating_high', 'rating_low']),
];

export const createReviewRules = [
    param('movieId').isInt({ min: 1 }),
    body('rating').isInt({ min: 1, max: 5 }),
    reviewTextChain,
];

export const myReviewForMovieRules = [param('movieId').isInt({ min: 1 })];

export const updateReviewRules = [
    param('reviewId').isInt({ min: 1 }),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    reviewTextChain,
];

export const deleteReviewRules = [param('reviewId').isInt({ min: 1 })];
