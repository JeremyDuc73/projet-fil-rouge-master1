import { body, query } from 'express-validator';

export const watchlistStatusQuery = [
    query('status').optional().isIn(['to_watch', 'watched', 'dropped']),
];

export const updateWatchlistStatusRules = [
    body('status')
        .notEmpty()
        .isIn(['to_watch', 'watched', 'dropped'])
        .withMessage('status must be to_watch, watched or dropped'),
];
