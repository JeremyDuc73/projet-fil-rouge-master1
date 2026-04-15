import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

export const validateRequest = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const msg = result
            .array({ onlyFirstError: false })
            .map((e) => e.msg)
            .join(', ');
        return next(new ValidationError(msg));
    }
    next();
};
