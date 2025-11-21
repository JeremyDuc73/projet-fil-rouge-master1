import movieRepository from '../repositories/movieRepository.js';
import categoryRepository from '../repositories/categoryRepository.js';
import tmdbService from './tmdbService.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class MovieService {
    async getAllMovies(filters) {
        return movieRepository.findAllWithFilters(filters);
    }

    async getMovieById(id) {
        const movie = await movieRepository.findByIdWithDetails(id);
        if (!movie) {
            throw new NotFoundError('Movie');
        }
        
        const stats = await movieRepository.getMovieStats(id);
        return { ...movie, stats };
    }

    async createMovie(data) {
        this.validateMovieData(data);

        if (data.categoryIds && data.categoryIds.length > 0) {
            await this.validateCategories(data.categoryIds);
        }

        const movieData = {
            title: data.title,
            description: data.description,
            release_date: data.release_date,
            duration: data.duration,
            poster_url: data.poster_url,
            backdrop_url: data.backdrop_url
        };

        const movie = await movieRepository.createWithCategories(
            movieData,
            data.categoryIds || []
        );

        return movie;
    }

    async updateMovie(id, data) {
        const movie = await movieRepository.findById(id);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        // Empêcher la modification des films TMDB
        if (movie.tmdb_id) {
            throw new ValidationError('Les films TMDB ne peuvent pas être modifiés');
        }

        if (data.categoryIds && data.categoryIds.length > 0) {
            await this.validateCategories(data.categoryIds);
        }

        const updated = await movieRepository.updateWithCategories(
            id,
            {
                title: data.title,
                description: data.description,
                release_date: data.release_date,
                duration: data.duration,
                poster_url: data.poster_url,
                backdrop_url: data.backdrop_url
            },
            data.categoryIds
        );

        return updated;
    }

    async deleteMovie(id) {
        const movie = await movieRepository.findById(id);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        await movieRepository.delete(id);
        return movie;
    }

    validateMovieData(data) {
        if (!data.title || data.title.trim().length === 0) {
            throw new ValidationError('Title is required');
        }

        if (data.title.length > 255) {
            throw new ValidationError('Title must be less than 255 characters');
        }

        if (data.duration && (data.duration < 1 || data.duration > 1000)) {
            throw new ValidationError('Duration must be between 1 and 1000 minutes');
        }

        if (data.release_date) {
            const date = new Date(data.release_date);
            if (isNaN(date.getTime())) {
                throw new ValidationError('Invalid release date format');
            }
        }
    }

    async validateCategories(categoryIds) {
        for (const categoryId of categoryIds) {
            const category = await categoryRepository.findById(categoryId);
            if (!category) {
                throw new ValidationError(`Category with ID ${categoryId} not found`);
            }
        }
    }

    async uploadPoster(movieId, filename) {
        const movie = await movieRepository.findById(movieId);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        const posterUrl = `/uploads/posters/${filename}`;
        
        const updated = await movieRepository.update(movieId, { poster_url: posterUrl });
        
        return updated;
    }

    async searchTmdbMovies(query) {
        try {
            const results = await tmdbService.searchMovies(query);
            
            // Filtrer les films déjà importés
            if (results.results && Array.isArray(results.results)) {
                const filteredResults = [];
                
                for (const movie of results.results) {
                    const existingMovie = await movieRepository.findByTmdbId(movie.id);
                    if (!existingMovie) {
                        filteredResults.push(movie);
                    }
                }
                
                results.results = filteredResults;
            }
            
            return results;
        } catch (error) {
            throw new Error('Failed to search TMDB movies: ' + error.message);
        }
    }

    async importTmdbMovieById(tmdbId) {
        try {
            // Vérifier si le film existe déjà
            const existingMovie = await movieRepository.findByTmdbId(tmdbId);
            if (existingMovie) {
                throw new ConflictError('Ce film est déjà dans la base de données');
            }

            // Récupérer les détails du film depuis TMDB
            const movieDetails = await tmdbService.getMovieDetails(tmdbId);
            if (!movieDetails) {
                throw new NotFoundError('Film non trouvé sur TMDB');
            }

            // Formater les données
            const movieData = tmdbService.formatMovieForDB(movieDetails, movieDetails);

            // Récupérer toutes les catégories
            const allCategories = await categoryRepository.findAll();

            // Mapper les genres TMDB vers les slugs de catégories
            const categorySlugs = tmdbService.mapGenresToCategorySlugs(movieDetails.genres?.map(g => g.id) || []);

            // Trouver les IDs des catégories correspondantes
            const categoryIds = categorySlugs
                .map(slug => allCategories.find(c => c.slug === slug)?.id)
                .filter(Boolean);

            // Créer le film avec ses catégories
            const createdMovie = await movieRepository.createWithCategories(movieData, categoryIds);

            return createdMovie;
        } catch (error) {
            throw error;
        }
    }

    async importPopularMovies() {
        try {
            // Récupérer les 200 films trending depuis TMDB
            const tmdbMovies = await tmdbService.getTop200TrendingMovies();
            
            // Récupérer toutes les catégories
            const allCategories = await categoryRepository.findAll();
            
            let imported = 0;
            let skipped = 0;

            for (const tmdbMovie of tmdbMovies) {
                // Vérifier si le film existe déjà (par tmdb_id)
                const existingMovie = await movieRepository.findByTmdbId(tmdbMovie.id);
                
                if (existingMovie) {
                    skipped++;
                    continue;
                }

                // Récupérer les détails du film (incluant la durée)
                const movieDetails = await tmdbService.getMovieDetails(tmdbMovie.id);
                
                // Formater les données du film
                const movieData = tmdbService.formatMovieForDB(tmdbMovie, movieDetails);
                
                // Mapper les genres TMDB vers les slugs de catégories
                const categorySlugs = tmdbService.mapGenresToCategorySlugs(tmdbMovie.genre_ids || []);
                
                // Trouver les IDs des catégories correspondantes
                const categoryIds = categorySlugs
                    .map(slug => allCategories.find(c => c.slug === slug)?.id)
                    .filter(Boolean);
                
                // Créer le film avec ses catégories
                await movieRepository.createWithCategories(movieData, categoryIds);
                imported++;
            }

            return { imported, skipped };
        } catch (error) {
            console.error('Error importing TMDB movies:', error);
            throw new Error('Failed to import movies from TMDB');
        }
    }

    async getSimilarMovies(movieId, limit = 6) {
        // Récupérer le film avec ses catégories
        const movie = await movieRepository.findByIdWithDetails(movieId);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        const similarMovies = [];
        const movieTitle = movie.title.toLowerCase();
        
        // Extraire le "nom de base" pour les séries (ex: "Harry Potter" de "Harry Potter et la Pierre Philosophale")
        const baseTitle = movieTitle
            .replace(/\s+(et|and|de|the|le|la|les|des|à|au|aux)\s+.*/gi, '') // Enlever "et la...", "and the..."
            .replace(/\s*:\s*.*/g, '') // Enlever tout après ":"
            .replace(/\s*-\s*.*/g, '') // Enlever tout après "-"
            .replace(/\s+\d+.*$/g, '') // Enlever les numéros à la fin
            .replace(/\s+(partie|part|chapter|chapitre|tome|volume|saison|season)\s+\d+.*$/gi, '')
            .trim();

        try {
            // 1. Chercher d'abord les films avec un titre similaire (même franchise)
            const allMoviesData = await movieRepository.findAllWithFilters({ 
                page: 1, 
                limit: 200 // Charger les 200 premiers films
            });
            const allMovies = allMoviesData.movies;
            
            for (const m of allMovies) {
                if (m.id === movieId) continue; // Skip le film actuel
                
                const otherTitle = m.title.toLowerCase();
                
                // Si le titre contient le "nom de base" → c'est de la même saga
                if (baseTitle.length > 3 && otherTitle.includes(baseTitle)) {
                    similarMovies.push(m);
                    if (similarMovies.length >= limit) {
                        return similarMovies;
                    }
                }
            }
            
            // 2. Compléter avec des films de la même catégorie
            if (similarMovies.length < limit && movie.categories && movie.categories.length > 0) {
                const categoryIds = movie.categories.map(c => c.id);
                
                for (const m of allMovies) {
                    if (m.id === movieId) continue;
                    if (similarMovies.find(sm => sm.id === m.id)) continue; // Déjà ajouté
                    
                    // Si le film partage au moins une catégorie
                    if (m.categories && m.categories.some(c => categoryIds.includes(c.id))) {
                        similarMovies.push(m);
                        if (similarMovies.length >= limit) {
                            break;
                        }
                    }
                }
            }
            
            return similarMovies;
        } catch (error) {
            console.error('Error fetching similar movies:', error);
            return [];
        }
    }
}

export default new MovieService();
