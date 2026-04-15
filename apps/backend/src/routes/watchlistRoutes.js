import { Router } from 'express';
import * as watchlistController from '../controllers/watchlistController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { movieIdParam, paginationQuery } from '../validators/common.js';
import { updateWatchlistStatusRules, watchlistStatusQuery } from '../validators/watchlist.js';

const router = Router();

router.get('/', authenticate, ...watchlistStatusQuery, ...paginationQuery, validateRequest, watchlistController.getMyWatchlist);
router.get('/stats', authenticate, watchlistController.getWatchlistStats);
router.post('/:movieId', authenticate, movieIdParam, validateRequest, watchlistController.addToWatchlist);
router.patch('/:movieId/status', authenticate, movieIdParam, ...updateWatchlistStatusRules, validateRequest, watchlistController.updateWatchlistStatus);
router.delete('/:movieId', authenticate, movieIdParam, validateRequest, watchlistController.removeFromWatchlist);
router.get('/:movieId/check', authenticate, movieIdParam, validateRequest, watchlistController.checkWatchlist);

export default router;
