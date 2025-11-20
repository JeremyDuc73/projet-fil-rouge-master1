import authService from '../services/authService.js';
import userRepository from '../repositories/userRepository.js';
import { UnauthorizedError } from '../utils/errors.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7);
        const decoded = authService.verifyToken(token);

        const user = await userRepository.findById(decoded.id);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        delete user.password;
        req.user = user;
        
        next();
    } catch (error) {
        next(error);
    }
};

export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new UnauthorizedError('Insufficient permissions'));
        }

        next();
    };
};

export const requireAdmin = requireRole(['admin', 'super_admin']);
