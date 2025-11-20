import watchlistService from '../services/watchlistService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addToWatchlist = asyncHandler(async (req, res) => {
    const result = await watchlistService.addToWatchlist(req.user.id, req.params.movieId);

    res.status(201).json({
        success: true,
        message: result.message,
        data: { inWatchlist: result.inWatchlist }
    });
});

export const removeFromWatchlist = asyncHandler(async (req, res) => {
    const result = await watchlistService.removeFromWatchlist(req.user.id, req.params.movieId);

    res.json({
        success: true,
        message: result.message,
        data: { inWatchlist: result.inWatchlist }
    });
});

export const getMyWatchlist = asyncHandler(async (req, res) => {
    const options = {
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0,
        status: req.query.status // Filtrer par statut optionnel
    };

    const watchlist = await watchlistService.getUserWatchlist(req.user.id, options);

    res.json({
        success: true,
        data: watchlist
    });
});

export const checkWatchlist = asyncHandler(async (req, res) => {
    const inWatchlist = await watchlistService.isInWatchlist(req.user.id, req.params.movieId);

    res.json({
        success: true,
        data: { inWatchlist }
    });
});

export const updateWatchlistStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const result = await watchlistService.updateStatus(req.user.id, req.params.movieId, status);

    res.json({
        success: true,
        message: result.message,
        data: { status: result.status }
    });
});

export const getWatchlistStats = asyncHandler(async (req, res) => {
    const stats = await watchlistService.getWatchlistStats(req.user.id);

    res.json({
        success: true,
        data: stats
    });
});
