import { BaseRepository } from './baseRepository.js';
import { query } from '../db.js';

class RatingRepository extends BaseRepository {
    constructor() {
        super('ratings');
    }

    async findByUserAndMovie(userId, movieId) {
        return this.findOne({ user_id: userId, movie_id: movieId });
    }

    async createRating(userId, movieId, rating, review = null) {
        const sql = `
            INSERT INTO ratings (user_id, movie_id, rating, review)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await query(sql, [userId, movieId, rating, review]);
        return result.rows[0];
    }

    async updateRating(userId, movieId, rating, review = null) {
        const sql = `
            UPDATE ratings
            SET rating = $1, review = $2, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $3 AND movie_id = $4
            RETURNING *
        `;
        const result = await query(sql, [rating, review, userId, movieId]);
        return result.rows[0];
    }

    async deleteByUserAndMovie(userId, movieId) {
        const sql = `
            DELETE FROM ratings
            WHERE user_id = $1 AND movie_id = $2
            RETURNING *
        `;
        const result = await query(sql, [userId, movieId]);
        return result.rows[0];
    }

    async getMovieRatings(movieId, options = {}) {
        const { limit = 20, offset = 0 } = options;
        
        const sql = `
            SELECT r.*, 
                   u.firstname, u.lastname, u.email
            FROM ratings r
            INNER JOIN users u ON r.user_id = u.id
            WHERE r.movie_id = $1
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await query(sql, [movieId, limit, offset]);
        return result.rows;
    }

    async getUserRatings(userId, options = {}) {
        const { limit = 20, offset = 0 } = options;
        
        const sql = `
            SELECT r.*, 
                   m.title, m.poster_url, m.release_date
            FROM ratings r
            INNER JOIN movies m ON r.movie_id = m.id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await query(sql, [userId, limit, offset]);
        return result.rows;
    }

    async getMovieRatingStats(movieId) {
        const sql = `
            SELECT 
                COUNT(*)::integer as ratings_count,
                COALESCE(AVG(rating), 0) as average_rating
            FROM ratings
            WHERE movie_id = $1
        `;
        
        const result = await query(sql, [movieId]);
        return result.rows[0];
    }
}

export default new RatingRepository();
