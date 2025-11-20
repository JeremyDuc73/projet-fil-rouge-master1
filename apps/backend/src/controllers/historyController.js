import viewingHistoryService from '../services/viewingHistoryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const trackView = asyncHandler(async (req, res) => {
    const view = await viewingHistoryService.trackView(req.user.id, req.params.movieId);

    res.status(201).json({
        success: true,
        data: view
    });
});

export const getMyHistory = asyncHandler(async (req, res) => {
    const options = {
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const history = await viewingHistoryService.getUserHistory(req.user.id, options);

    res.json({
        success: true,
        data: history
    });
});

export const clearHistory = asyncHandler(async (req, res) => {
    const result = await viewingHistoryService.clearHistory(req.user.id);

    res.json({
        success: true,
        message: result.message,
        data: { deletedCount: result.deletedCount }
    });
});
