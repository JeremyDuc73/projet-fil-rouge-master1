import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import movieRoutes from './movieRoutes.js';
// import ratingRoutes from './ratingRoutes.js'; // DEPRECATED: Merged with reviews
import favoriteRoutes from './favoriteRoutes.js';
import watchlistRoutes from './watchlistRoutes.js';
import historyRoutes from './historyRoutes.js';
import reviewRoutes from './reviewRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/movies', movieRoutes);
// router.use('/ratings', ratingRoutes); // DEPRECATED: Use /reviews instead
router.use('/favorites', favoriteRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/history', historyRoutes);
router.use('/reviews', reviewRoutes);

export default router;
