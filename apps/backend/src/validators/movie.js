import { body, param, query } from 'express-validator';
import { MOVIE_SORT_FIELDS, PAGINATION } from '../utils/constants.js';

const SORT_VALUES = Object.values(MOVIE_SORT_FIELDS);

export const listMoviesQuery = [
    query('page').optional().isInt({ min: 1 }),
    query('limit')
        .optional()
        .isInt({ min: 1, max: PAGINATION.MAX_LIMIT }),
    query('min_rating').optional().isFloat({ min: 0, max: 10 }),
    query('sortBy').optional().isIn(SORT_VALUES),
    query('order').optional().isIn(['asc', 'ASC', 'desc', 'DESC']),
    query('category').optional().isString().trim(),
    query('search').optional().isString().trim(),
    query('source').optional().isIn(['custom', 'tmdb']),
];

export const similarMoviesRules = [
    param('id').isInt({ min: 1 }).withMessage('Invalid movie id'),
    query('limit').optional().isInt({ min: 1, max: 50 }),
];

export const movieIdParam = param('id').isInt({ min: 1 }).withMessage('Invalid movie id');

const parsePositiveInt = (v) => {
    if (typeof v === 'number' && Number.isInteger(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') return parseInt(v, 10);
    return NaN;
};

export const createMovieRules = [
    body('title').trim().notEmpty().isLength({ max: 255 }).withMessage('title is required (max 255 chars)'),
    body('description').optional({ values: 'null' }).isString(),
    // JSON envoie souvent des nombres ; validator.isInt() attend une string — message générique « Invalid value ».
    body('release_date')
        .optional({ checkFalsy: true })
        .custom((v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v)))
        .withMessage('release_date must be YYYY-MM-DD'),
    body('duration')
        .optional({ checkFalsy: true })
        .custom((v) => {
            const n = parsePositiveInt(v);
            return Number.isInteger(n) && n >= 1 && n <= 1000;
        })
        .withMessage('duration must be an integer between 1 and 1000'),
    body('poster_url').optional({ values: 'null' }).isString().isLength({ max: 500 }),
    body('backdrop_url').optional({ values: 'null' }).isString().isLength({ max: 500 }),
    body('categoryIds').optional().isArray(),
    body('categoryIds.*')
        .custom((v) => {
            const n = parsePositiveInt(v);
            return Number.isInteger(n) && n >= 1;
        })
        .withMessage('each category id must be a positive integer'),
];

export const updateMovieRules = [
    movieIdParam,
    body('title').optional().trim().notEmpty().isLength({ max: 255 }),
    body('description').optional({ values: 'null' }).isString(),
    body('release_date')
        .optional({ checkFalsy: true })
        .custom((v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v)))
        .withMessage('release_date must be YYYY-MM-DD'),
    body('duration')
        .optional({ checkFalsy: true })
        .custom((v) => {
            const n = parsePositiveInt(v);
            return Number.isInteger(n) && n >= 1 && n <= 1000;
        })
        .withMessage('duration must be an integer between 1 and 1000'),
    body('poster_url').optional({ values: 'null' }).isString().isLength({ max: 500 }),
    body('backdrop_url').optional({ values: 'null' }).isString().isLength({ max: 500 }),
    body('categoryIds').optional().isArray(),
    body('categoryIds.*')
        .custom((v) => {
            const n = parsePositiveInt(v);
            return Number.isInteger(n) && n >= 1;
        })
        .withMessage('each category id must be a positive integer'),
];

export const searchTmdbQuery = [
    query('q').trim().notEmpty().withMessage('Query parameter q is required'),
];
