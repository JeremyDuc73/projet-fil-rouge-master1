import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import userRepository from '../repositories/userRepository.js';
import { UnauthorizedError, ConflictError, ValidationError } from '../utils/errors.js';

class AuthService {
    async hashPassword(password) {
        return bcrypt.hash(password, config.bcrypt.saltRounds);
    }

    async comparePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }

    generateAccessToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.accessExpiresIn
        });
    }

    generateRefreshToken(user) {
        const payload = {
            id: user.id,
            email: user.email
        };

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.refreshExpiresIn
        });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, config.jwt.secret);
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired token');
        }
    }

    async register(userData) {
        const { email, password, firstname, lastname } = userData;

        if (!email || !password || !firstname || !lastname) {
            throw new ValidationError('All fields are required');
        }

        if (password.length < 6) {
            throw new ValidationError('Password must be at least 6 characters');
        }

        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictError('Email already registered');
        }

        const hashedPassword = await this.hashPassword(password);

        const user = await userRepository.createUser({
            email,
            password: hashedPassword,
            firstname,
            lastname
        });

        delete user.password;

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        return { user, accessToken, refreshToken };
    }

    async login(email, password) {
        if (!email || !password) {
            throw new ValidationError('Email and password are required');
        }

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isPasswordValid = await this.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        delete user.password;

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        return { user, accessToken, refreshToken };
    }

    async refreshAccessToken(refreshToken) {
        if (!refreshToken) {
            throw new UnauthorizedError('Refresh token required');
        }

        const decoded = this.verifyToken(refreshToken);

        const user = await userRepository.findById(decoded.id);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        delete user.password;

        const accessToken = this.generateAccessToken(user);

        return { accessToken };
    }
}

export default new AuthService();
