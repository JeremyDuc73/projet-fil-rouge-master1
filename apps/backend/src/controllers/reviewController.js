import reviewService from '../services/reviewService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createReview = asyncHandler(async (req, res) => {
    const review = await reviewService.createReview(
        req.user.id,
        req.params.movieId,
        req.body
    );

    res.status(201).json({
        success: true,
        data: review
    });
});

export const getMovieReviews = asyncHandler(async (req, res) => {
    const options = {
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        offset: req.query.offset ? parseInt(req.query.offset) : 0,
        sortBy: req.query.sortBy || 'recent'
    };

    const result = await reviewService.getMovieReviews(req.params.movieId, options);

    res.json({
        success: true,
        data: result
    });
});

export const getMyReviews = asyncHandler(async (req, res) => {
    const options = {
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const reviews = await reviewService.getUserReviews(req.user.id, options);

    res.json({
        success: true,
        data: reviews
    });
});

export const getMyReviewForMovie = asyncHandler(async (req, res) => {
    const review = await reviewService.getUserReviewForMovie(req.user.id, req.params.movieId);

    res.json({
        success: true,
        data: review
    });
});

export const updateReview = asyncHandler(async (req, res) => {
    const review = await reviewService.updateReview(
        req.params.reviewId,
        req.user.id,
        req.body
    );

    res.json({
        success: true,
        data: review
    });
});

export const deleteReview = asyncHandler(async (req, res) => {
    await reviewService.deleteReview(req.params.reviewId, req.user.id);

    res.json({
        success: true,
        message: 'Review deleted successfully'
    });
});
