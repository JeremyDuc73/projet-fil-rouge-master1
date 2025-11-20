import movieService from '../services/movieService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllMovies = asyncHandler(async (req, res) => {
    const filters = {
        category: req.query.category,
        min_rating: req.query.min_rating ? parseFloat(req.query.min_rating) : undefined,
        search: req.query.search,
        sortBy: req.query.sortBy,
        order: req.query.order,
        source: req.query.source,
        page: req.query.page ? parseInt(req.query.page) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const result = await movieService.getAllMovies(filters);

    res.json({
        success: true,
        data: result.movies,
        pagination: result.pagination
    });
});

export const getMovieById = asyncHandler(async (req, res) => {
    const movie = await movieService.getMovieById(req.params.id);

    res.json({
        success: true,
        data: movie
    });
});

export const createMovie = asyncHandler(async (req, res) => {
    const movie = await movieService.createMovie(req.body);

    res.status(201).json({
        success: true,
        data: movie
    });
});

export const updateMovie = asyncHandler(async (req, res) => {
    const movie = await movieService.updateMovie(req.params.id, req.body);

    res.json({
        success: true,
        data: movie
    });
});

export const deleteMovie = asyncHandler(async (req, res) => {
    await movieService.deleteMovie(req.params.id);

    res.json({
        success: true,
        message: 'Movie deleted successfully'
    });
});

export const importTMDBMovies = asyncHandler(async (req, res) => {
    const result = await movieService.importPopularMovies();

    res.json({
        success: true,
        imported: result.imported,
        skipped: result.skipped,
        message: `${result.imported} films importés, ${result.skipped} déjà existants`
    });
});

export const uploadPoster = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No file uploaded'
        });
    }

    const movie = await movieService.uploadPoster(req.params.id, req.file.filename);

    res.json({
        success: true,
        message: 'Poster uploaded successfully',
        data: {
            poster_url: movie.poster_url
        }
    });
});

export const searchTMDBMovies = asyncHandler(async (req, res) => {
    const query = req.query.q;
    
    if (!query) {
        return res.status(400).json({
            success: false,
            error: 'Query parameter is required'
        });
    }

    const results = await movieService.searchTmdbMovies(query);

    res.json({
        success: true,
        data: results
    });
});

export const importTMDBMovieById = asyncHandler(async (req, res) => {
    const tmdbId = parseInt(req.params.tmdbId);
    const movie = await movieService.importTmdbMovieById(tmdbId);

    res.status(201).json({
        success: true,
        data: movie,
        message: 'Film importé avec succès'
    });
});
