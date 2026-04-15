import { body, param } from 'express-validator';

export const categoryIdParam = param('id')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer');

export const createCategoryRules = [
    body('name').trim().notEmpty().isLength({ max: 100 }).withMessage('name is required'),
    body('slug')
        .trim()
        .notEmpty()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage('slug must be a lowercase slug (e.g. science-fiction)'),
];

export const updateCategoryRules = [
    categoryIdParam,
    body('name').optional().trim().notEmpty().isLength({ max: 100 }),
    body('slug')
        .optional()
        .trim()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage('slug must be a lowercase slug'),
];
