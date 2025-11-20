import authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);

    res.status(201).json({
        success: true,
        data: {
            user,
            accessToken,
            refreshToken
        }
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.json({
        success: true,
        data: {
            user,
            accessToken,
            refreshToken
        }
    });
});

export const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    res.json({
        success: true,
        data: { accessToken }
    });
});

export const logout = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});
