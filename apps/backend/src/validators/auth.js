import { body } from 'express-validator';

export const registerRules = [
    body('email').trim().notEmpty().isEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('firstname').trim().notEmpty().isLength({ max: 100 }).withMessage('firstname is required (max 100 chars)'),
    body('lastname').trim().notEmpty().isLength({ max: 100 }).withMessage('lastname is required (max 100 chars)'),
];

export const loginRules = [
    body('email').trim().notEmpty().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

export const refreshRules = [
    body('refreshToken').trim().notEmpty().withMessage('refreshToken is required'),
];
