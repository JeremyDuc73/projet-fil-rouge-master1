import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import {
    createReview,
    getMovieReviews,
    getMyReviews,
    getMyReviewForMovie,
    updateReview,
    deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Public routes
router.get('/movies/:movieId', getMovieReviews);

// Protected routes
router.post('/movies/:movieId', authenticate, createReview);
router.get('/me', authenticate, getMyReviews);
router.get('/movies/:movieId/me', authenticate, getMyReviewForMovie);
router.put('/:reviewId', authenticate, updateReview);
router.delete('/:reviewId', authenticate, deleteReview);

export default router;
