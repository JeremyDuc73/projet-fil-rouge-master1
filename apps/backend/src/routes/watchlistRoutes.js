import { Router } from 'express';
import * as watchlistController from '../controllers/watchlistController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.get('/', authenticate, watchlistController.getMyWatchlist);
router.get('/stats', authenticate, watchlistController.getWatchlistStats);
router.post('/:movieId', authenticate, watchlistController.addToWatchlist);
router.patch('/:movieId/status', authenticate, watchlistController.updateWatchlistStatus);
router.delete('/:movieId', authenticate, watchlistController.removeFromWatchlist);
router.get('/:movieId/check', authenticate, watchlistController.checkWatchlist);

export default router;
