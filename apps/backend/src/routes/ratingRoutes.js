import { Router } from 'express';
import * as ratingController from '../controllers/ratingController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.get('/me', authenticate, ratingController.getMyRatings);
router.get('/movies/:movieId', ratingController.getMovieRatings);
router.get('/movies/:movieId/me', authenticate, ratingController.getMyRatingForMovie);
router.post('/movies/:movieId', authenticate, ratingController.addOrUpdateRating);
router.delete('/movies/:movieId', authenticate, ratingController.deleteRating);

export default router;
