import { body, param, query } from 'express-validator';
import { PAGINATION } from '../utils/constants.js';

const USER_SORT = ['created_at', 'email', 'firstname', 'lastname', 'role'];

export const updateMeRules = [
    body('firstname').optional().trim().notEmpty().isLength({ max: 100 }),
    body('lastname').optional().trim().notEmpty().isLength({ max: 100 }),
    body('email').optional().trim().isEmail(),
];

export const updatePasswordRules = [
    body('currentPassword').notEmpty().withMessage('currentPassword is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('newPassword must be at least 6 characters'),
];

export const adminUserIdParam = param('id')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer');

export const updateUserRoleRules = [
    adminUserIdParam,
    body('role')
        .notEmpty()
        .isIn(['user', 'premium', 'admin', 'super_admin'])
        .withMessage('Invalid role'),
];

export const listUsersQuery = [
    query('page').optional().isInt({ min: 1 }),
    query('limit')
        .optional()
        .isInt({ min: 1, max: PAGINATION.MAX_LIMIT }),
    query('sortBy').optional().isIn(USER_SORT),
    query('order').optional().isIn(['asc', 'ASC', 'desc', 'DESC']),
    query('role').optional().isIn(['user', 'premium', 'admin', 'super_admin']),
    query('search').optional().isString().trim(),
];
