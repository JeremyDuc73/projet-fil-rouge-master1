import axios from 'axios';
import pool from '../src/db.js';
import dotenv from 'dotenv';

dotenv.config();

// TMDB Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Mapping TMDB genres to our categories
const GENRE_MAPPING = {
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

/**
 * Fetch trending movies from TMDB (weekly)
 */
async function fetchTrendingMovies(pages = 5) {
    const movies = [];
    
    console.log(`[INFO] Fetching ${pages * 20} trending movies from TMDB...`);
    
    for (let page = 1; page <= pages; page++) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'fr-FR',
                    page
                }
            });
            
            movies.push(...response.data.results);
            console.log(`[INFO] Fetched page ${page}/${pages} (${response.data.results.length} movies)`);
        } catch (error) {
            console.error(`[ERROR] Failed to fetch page ${page}:`, error.message);
        }
    }
    
    return movies;
}

/**
 * Fetch movie details including runtime and images
 */
async function fetchMovieDetails(tmdbId) {
    try {
        const [detailsRes, imagesRes] = await Promise.all([
            axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'fr-FR'
                }
            }),
            axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}/images`, {
                params: {
                    api_key: TMDB_API_KEY
                }
            })
        ]);
        
        return {
            runtime: detailsRes.data.runtime,
            backdrops: imagesRes.data.backdrops || [],
            posters: imagesRes.data.posters || []
        };
    } catch (error) {
        console.error(`[ERROR] Failed to fetch details for movie ${tmdbId}:`, error.message);
        return { runtime: null, backdrops: [], posters: [] };
    }
}

/**
 * Import a single movie into database
 */
async function importMovie(movie, categories) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Check if movie already exists
        const existingMovie = await client.query(
            'SELECT id FROM movies WHERE tmdb_id = $1',
            [movie.id]
        );
        
        if (existingMovie.rows.length > 0) {
            console.log(`[SKIP] Movie "${movie.title}" already exists`);
            await client.query('ROLLBACK');
            return;
        }
        
        // Fetch additional details
        const details = await fetchMovieDetails(movie.id);
        
        // Build image URLs
        const posterUrl = movie.poster_path 
            ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}` 
            : null;
        const backdropUrl = movie.backdrop_path 
            ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}` 
            : null;
        
        // Insert movie with TMDB rating (keep 0-10 scale from TMDB)
        const tmdbRating = movie.vote_average ? parseFloat(movie.vote_average).toFixed(1) : 0;
        const tmdbVoteCount = movie.vote_count || 0;
        
        const movieResult = await client.query(
            `INSERT INTO movies (
                tmdb_id, title, description, release_date, duration, 
                poster_url, backdrop_url, 
                tmdb_rating, tmdb_vote_count,
                community_rating, community_count
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0)
            RETURNING id`,
            [
                movie.id,
                movie.title,
                movie.overview,
                movie.release_date || null,
                details.runtime,
                posterUrl,
                backdropUrl,
                tmdbRating,
                tmdbVoteCount
            ]
        );
        
        const movieId = movieResult.rows[0].id;
        
        // Insert movie images (gallery) - top 10 backdrops
        const backdropImages = details.backdrops
            .filter(img => img.file_path)
            .slice(0, 10)
            .map((img, index) => ({
                movieId,
                url: `${TMDB_IMAGE_BASE_URL}/original${img.file_path}`,
                type: 'backdrop',
                order: index
            }));
        
        for (const image of backdropImages) {
            await client.query(
                `INSERT INTO movie_images (movie_id, image_url, image_type, display_order)
                 VALUES ($1, $2, $3, $4)`,
                [image.movieId, image.url, image.type, image.order]
            );
        }
        
        // Map genres to categories
        const movieGenres = movie.genre_ids || [];
        const categorySlugs = [...new Set(
            movieGenres
                .map(genreId => GENRE_MAPPING[genreId])
                .filter(Boolean)
        )];
        
        // Insert movie_categories
        for (const slug of categorySlugs) {
            const category = categories.find(c => c.slug === slug);
            if (category) {
                await client.query(
                    `INSERT INTO movie_categories (movie_id, category_id)
                     VALUES ($1, $2)
                     ON CONFLICT DO NOTHING`,
                    [movieId, category.id]
                );
            }
        }
        
        await client.query('COMMIT');
        console.log(`[SUCCESS] Imported "${movie.title}" (${backdropImages.length} images in gallery)`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`[ERROR] Failed to import "${movie.title}":`, error.message);
    } finally {
        client.release();
    }
}

/**
 * Clear all movie data (optional)
 */
async function clearMovieData() {
    const client = await pool.connect();
    
    try {
        console.log('[INFO] Clearing existing movie data...');
        
        // Delete in order (respecting foreign keys)
        await client.query('DELETE FROM movie_images');
        await client.query('DELETE FROM movie_categories');
        await client.query('DELETE FROM reviews');  // Fixed: reviews instead of ratings
        await client.query('DELETE FROM favorites');
        await client.query('DELETE FROM watchlist');
        await client.query('DELETE FROM viewing_history');
        await client.query('DELETE FROM movies');
        
        // Reset sequences
        await client.query('ALTER SEQUENCE movies_id_seq RESTART WITH 1');
        await client.query('ALTER SEQUENCE movie_images_id_seq RESTART WITH 1');
        
        console.log('[SUCCESS] Movie data cleared');
    } catch (error) {
        console.error('[ERROR] Failed to clear movie data:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Main import function
 */
async function importFromTMDB(clearFirst = false) {
    try {
        // Validate API key
        if (!TMDB_API_KEY && !TMDB_ACCESS_TOKEN) {
            throw new Error('TMDB API key or access token is required. Set TMDB_API_KEY or TMDB_ACCESS_TOKEN in .env');
        }
        
        console.log('[INFO] Starting TMDB import...');
        
        // Clear existing data if requested
        if (clearFirst) {
            await clearMovieData();
        }
        
        // Fetch categories
        const categoriesResult = await pool.query('SELECT id, name, slug FROM categories');
        const categories = categoriesResult.rows;
        
        if (categories.length === 0) {
            throw new Error('No categories found. Please run seed.sql first.');
        }
        
        // Fetch trending movies
        const movies = await fetchTrendingMovies(5); // 5 pages = 100 movies
        
        console.log(`[INFO] Importing ${movies.length} movies...`);
        
        // Import movies one by one
        for (let i = 0; i < movies.length; i++) {
            console.log(`[INFO] Progress: ${i + 1}/${movies.length}`);
            await importMovie(movies[i], categories);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Show stats
        const statsResult = await pool.query(`
            SELECT 
                COUNT(*) as total_movies,
                COUNT(DISTINCT movie_id) as movies_with_images,
                COUNT(*) FILTER (WHERE image_type = 'backdrop') as total_backdrops
            FROM movie_images
        `);
        
        const movieCount = await pool.query('SELECT COUNT(*) FROM movies');
        
        console.log('\n[SUCCESS] Import completed!');
        console.log(`├─ Total movies: ${movieCount.rows[0].count}`);
        console.log(`├─ Movies with gallery: ${statsResult.rows[0].movies_with_images}`);
        console.log(`└─ Total images: ${statsResult.rows[0].total_backdrops}`);
        
        process.exit(0);
    } catch (error) {
        console.error('\n[ERROR] Import failed:', error.message);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const clearFirst = args.includes('--clear') || args.includes('-c');

if (clearFirst) {
    console.log('[WARNING] This will DELETE all existing movie data!');
}

importFromTMDB(clearFirst);
