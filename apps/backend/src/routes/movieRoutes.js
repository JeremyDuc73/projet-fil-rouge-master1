import { Router } from 'express';
import * as movieController from '../controllers/movieController.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import { uploadPoster } from '../config/multer.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { tmdbIdParam } from '../validators/common.js';
import {
    createMovieRules,
    listMoviesQuery,
    movieIdParam,
    searchTmdbQuery,
    similarMoviesRules,
    updateMovieRules,
} from '../validators/movie.js';

const router = Router();

router.get('/', listMoviesQuery, validateRequest, movieController.getAllMovies);
router.get('/:id/similar', similarMoviesRules, validateRequest, movieController.getSimilarMovies);
router.get('/:id', movieIdParam, validateRequest, movieController.getMovieById);

router.post('/', authenticate, requireAdmin, ...createMovieRules, validateRequest, movieController.createMovie);
router.post('/import-tmdb', authenticate, requireAdmin, movieController.importTMDBMovies);
router.get('/tmdb/search', authenticate, requireAdmin, searchTmdbQuery, validateRequest, movieController.searchTMDBMovies);
router.post('/tmdb/:tmdbId', authenticate, requireAdmin, tmdbIdParam, validateRequest, movieController.importTMDBMovieById);
router.put('/:id', authenticate, requireAdmin, ...updateMovieRules, validateRequest, movieController.updateMovie);
router.delete('/:id', authenticate, requireAdmin, movieIdParam, validateRequest, movieController.deleteMovie);

router.post(
    '/:id/poster',
    authenticate,
    requireAdmin,
    movieIdParam,
    validateRequest,
    uploadPoster.single('poster'),
    movieController.uploadPoster
);

export default router;
