import userService from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMe = asyncHandler(async (req, res) => {
    const user = await userService.getUserProfile(req.user.id);

    res.json({
        success: true,
        data: user
    });
});

export const updateMe = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);

    res.json({
        success: true,
        data: user
    });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.updatePassword(req.user.id, currentPassword, newPassword);

    res.json({
        success: true,
        message: result.message
    });
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const filters = {
        search: req.query.search,
        role: req.query.role,
        sortBy: req.query.sortBy,
        order: req.query.order,
        page: req.query.page ? parseInt(req.query.page) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const result = await userService.getAllUsers(filters);

    res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
    });
});

export const getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.json({
        success: true,
        data: user
    });
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await userService.updateUserRole(req.params.id, role);

    res.json({
        success: true,
        data: user
    });
});

export const deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});
