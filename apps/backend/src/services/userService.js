import userRepository from '../repositories/userRepository.js';
import authService from './authService.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';

class UserService {
    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        delete user.password;
        return user;
    }

    async getUserProfile(id) {
        const user = await this.getUserById(id);
        const stats = await userRepository.getUserStats(id);
        return { ...user, stats };
    }

    async updateProfile(id, data) {
        const user = await this.getUserById(id);

        if (data.email && data.email !== user.email) {
            const existing = await userRepository.findByEmail(data.email);
            if (existing) {
                throw new ConflictError('Email already in use');
            }
        }

        const updated = await userRepository.updateProfile(id, data);
        delete updated.password;
        return updated;
    }

    async updatePassword(id, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            throw new ValidationError('Current and new password are required');
        }

        if (newPassword.length < 6) {
            throw new ValidationError('Password must be at least 6 characters');
        }

        const user = await userRepository.findById(id);
        if (!user) {
            throw new NotFoundError('User');
        }

        const isValid = await authService.comparePassword(currentPassword, user.password);
        if (!isValid) {
            throw new ValidationError('Current password is incorrect');
        }

        const hashedPassword = await authService.hashPassword(newPassword);
        await userRepository.updatePassword(id, hashedPassword);

        return { message: 'Password updated successfully' };
    }

    async getAllUsers(filters = {}) {
        return await userRepository.findAllWithFilters(filters);
    }

    async updateUserRole(id, role) {
        const validRoles = ['user', 'premium', 'admin', 'super_admin'];
        
        if (!validRoles.includes(role)) {
            throw new ValidationError(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }

        const user = await this.getUserById(id);
        const updated = await userRepository.update(id, { role });
        delete updated.password;
        return updated;
    }

    async deleteUser(id) {
        const user = await this.getUserById(id);
        await userRepository.delete(id);
        return user;
    }
}

export default new UserService();
