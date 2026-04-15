import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { paginationQuery } from '../validators/common.js';
import {
    createReviewRules,
    deleteReviewRules,
    movieReviewsListRules,
    myReviewForMovieRules,
    updateReviewRules,
} from '../validators/review.js';
import {
    createReview,
    getMovieReviews,
    getMyReviews,
    getMyReviewForMovie,
    updateReview,
    deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/movies/:movieId', movieReviewsListRules, validateRequest, getMovieReviews);

router.post('/movies/:movieId', authenticate, ...createReviewRules, validateRequest, createReview);
router.get('/me', authenticate, ...paginationQuery, validateRequest, getMyReviews);
router.get('/movies/:movieId/me', authenticate, ...myReviewForMovieRules, validateRequest, getMyReviewForMovie);
router.put('/:reviewId', authenticate, ...updateReviewRules, validateRequest, updateReview);
router.delete('/:reviewId', authenticate, ...deleteReviewRules, validateRequest, deleteReview);

export default router;
