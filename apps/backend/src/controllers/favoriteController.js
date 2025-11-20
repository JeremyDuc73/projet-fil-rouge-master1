import favoriteService from '../services/favoriteService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addFavorite = asyncHandler(async (req, res) => {
    const result = await favoriteService.addFavorite(req.user.id, req.params.movieId);

    res.status(201).json({
        success: true,
        message: result.message,
        data: { isFavorite: result.isFavorite }
    });
});

export const removeFavorite = asyncHandler(async (req, res) => {
    const result = await favoriteService.removeFavorite(req.user.id, req.params.movieId);

    res.json({
        success: true,
        message: result.message,
        data: { isFavorite: result.isFavorite }
    });
});

export const getMyFavorites = asyncHandler(async (req, res) => {
    const options = {
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const favorites = await favoriteService.getUserFavorites(req.user.id, options);

    res.json({
        success: true,
        data: favorites
    });
});

export const checkFavorite = asyncHandler(async (req, res) => {
    const isFavorite = await favoriteService.isFavorite(req.user.id, req.params.movieId);

    res.json({
        success: true,
        data: { isFavorite }
    });
});
