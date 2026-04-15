import { Router } from 'express';
import * as favoriteController from '../controllers/favoriteController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { movieIdParam } from '../validators/common.js';

const router = Router();

router.get('/', authenticate, favoriteController.getMyFavorites);
router.post('/:movieId', authenticate, movieIdParam, validateRequest, favoriteController.addFavorite);
router.delete('/:movieId', authenticate, movieIdParam, validateRequest, favoriteController.removeFavorite);
router.get('/:movieId/check', authenticate, movieIdParam, validateRequest, favoriteController.checkFavorite);

export default router;
