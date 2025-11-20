import { Router } from 'express';
import * as movieController from '../controllers/movieController.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import { uploadPoster } from '../config/multer.js';

const router = Router();

router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

router.post('/', authenticate, requireAdmin, movieController.createMovie);
router.post('/import-tmdb', authenticate, requireAdmin, movieController.importTMDBMovies);
router.get('/tmdb/search', authenticate, requireAdmin, movieController.searchTMDBMovies);
router.post('/tmdb/:tmdbId', authenticate, requireAdmin, movieController.importTMDBMovieById);
router.put('/:id', authenticate, requireAdmin, movieController.updateMovie);
router.delete('/:id', authenticate, requireAdmin, movieController.deleteMovie);

router.post('/:id/poster', authenticate, requireAdmin, uploadPoster.single('poster'), movieController.uploadPoster);

export default router;
