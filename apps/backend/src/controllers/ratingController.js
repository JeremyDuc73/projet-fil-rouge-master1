import ratingService from '../services/ratingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addOrUpdateRating = asyncHandler(async (req, res) => {
    const rating = await ratingService.addOrUpdateRating(
        req.user.id,
        req.params.movieId,
        req.body
    );

    res.status(rating.created_at === rating.updated_at ? 201 : 200).json({
        success: true,
        data: rating
    });
});

export const deleteRating = asyncHandler(async (req, res) => {
    await ratingService.deleteRating(req.user.id, req.params.movieId);

    res.json({
        success: true,
        message: 'Rating deleted successfully'
    });
});

export const getMovieRatings = asyncHandler(async (req, res) => {
    const options = {
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const ratings = await ratingService.getMovieRatings(req.params.movieId, options);

    res.json({
        success: true,
        data: ratings
    });
});

export const getMyRatings = asyncHandler(async (req, res) => {
    const options = {
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const ratings = await ratingService.getUserRatings(req.user.id, options);

    res.json({
        success: true,
        data: ratings
    });
});

export const getMyRatingForMovie = asyncHandler(async (req, res) => {
    const rating = await ratingService.getUserRating(req.user.id, req.params.movieId);

    res.json({
        success: true,
        data: rating
    });
});
