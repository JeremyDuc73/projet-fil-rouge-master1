import axios from 'axios';

class TMDBService {
    constructor() {
        this.apiKey = process.env.TMDB_API_KEY;
        this.baseURL = 'https://api.themoviedb.org/3';
        this.imageBaseURL = 'https://image.tmdb.org/t/p';
        
        // Mapping TMDB genres to our category slugs
        this.genreMapping = {
            28: 'action',           // Action
            12: 'action',           // Adventure → Action
            16: 'animation',        // Animation
            35: 'comedie',          // Comedy
            80: 'thriller',         // Crime → Thriller
            99: 'documentaire',     // Documentary
            18: 'drame',            // Drama
            10751: 'fantastique',   // Family → Fantastique
            14: 'fantastique',      // Fantasy
            36: 'drame',            // History → Drame
            27: 'horreur',          // Horror
            10402: 'comedie',       // Music → Comédie
            9648: 'thriller',       // Mystery → Thriller
            10749: 'romance',       // Romance
            878: 'science-fiction', // Science Fiction
            10770: 'drame',         // TV Movie → Drame
            53: 'thriller',         // Thriller
            10752: 'action',        // War → Action
            37: 'action'            // Western → Action
        };
    }

    async getTrendingMovies(page = 1) {
        try {
            const response = await axios.get(`${this.baseURL}/trending/movie/week`, {
                params: {
                    api_key: this.apiKey,
                    language: 'fr-FR',
                    page
                }
            });
            return response.data;
        } catch (error) {
            console.error('TMDB API Error:', error.message);
            throw new Error('Failed to fetch trending movies from TMDB');
        }
    }

    async getTop200TrendingMovies() {
        const movies = [];
        // TMDB returns 20 movies per page, so we need 10 pages for 200 movies
        for (let page = 1; page <= 10; page++) {
            const data = await this.getTrendingMovies(page);
            movies.push(...data.results);
        }
        return movies;
    }

    async searchMovies(query, page = 1) {
        try {
            const response = await axios.get(`${this.baseURL}/search/movie`, {
                params: {
                    api_key: this.apiKey,
                    language: 'fr-FR',
                    query,
                    page
                }
            });
            return response.data;
        } catch (error) {
            console.error('TMDB API Error:', error.message);
            throw new Error('Failed to search movies from TMDB');
        }
    }

    async getMovieDetails(movieId) {
        try {
            const response = await axios.get(`${this.baseURL}/movie/${movieId}`, {
                params: {
                    api_key: this.apiKey,
                    language: 'fr-FR'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`TMDB API Error for movie ${movieId}:`, error.message);
            return null;
        }
    }

    formatMovieForDB(tmdbMovie, movieDetails = null) {
        return {
            tmdb_id: tmdbMovie.id,
            title: tmdbMovie.title,
            description: tmdbMovie.overview,
            release_date: tmdbMovie.release_date || null,
            duration: movieDetails?.runtime || null,
            poster_url: tmdbMovie.poster_path 
                ? `${this.imageBaseURL}/w500${tmdbMovie.poster_path}` 
                : null,
            backdrop_url: tmdbMovie.backdrop_path 
                ? `${this.imageBaseURL}/original${tmdbMovie.backdrop_path}` 
                : null,
            tmdb_rating: tmdbMovie.vote_average || 0,
            tmdb_vote_count: tmdbMovie.vote_count || 0
        };
    }

    async getMovieGenres() {
        try {
            const response = await axios.get(`${this.baseURL}/genre/movie/list`, {
                params: {
                    api_key: this.apiKey,
                    language: 'fr-FR'
                }
            });
            return response.data.genres;
        } catch (error) {
            console.error('TMDB API Error:', error.message);
            return [];
        }
    }

    mapGenresToCategorySlugs(genreIds) {
        if (!genreIds || !Array.isArray(genreIds)) {
            return [];
        }
        
        // Map genre IDs to category slugs and remove duplicates
        const slugs = [...new Set(
            genreIds
                .map(genreId => this.genreMapping[genreId])
                .filter(Boolean)
        )];
        
        return slugs;
    }
}

export default new TMDBService();
