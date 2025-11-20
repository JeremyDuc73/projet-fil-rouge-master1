import { Router } from 'express';
import * as favoriteController from '../controllers/favoriteController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.get('/', authenticate, favoriteController.getMyFavorites);
router.post('/:movieId', authenticate, favoriteController.addFavorite);
router.delete('/:movieId', authenticate, favoriteController.removeFavorite);
router.get('/:movieId/check', authenticate, favoriteController.checkFavorite);

export default router;
