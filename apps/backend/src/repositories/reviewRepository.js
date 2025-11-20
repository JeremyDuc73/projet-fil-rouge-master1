import { query } from '../db.js';

class ReviewRepository {
    async create(userId, movieId, rating, reviewText) {
        const sql = `
            INSERT INTO reviews (user_id, movie_id, rating, review_text)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await query(sql, [userId, movieId, rating, reviewText]);
        return result.rows[0];
    }

    async findByUserAndMovie(userId, movieId) {
        const sql = `
            SELECT r.*, u.firstname, u.lastname, u.email
            FROM reviews r
            INNER JOIN users u ON r.user_id = u.id
            WHERE r.user_id = $1 AND r.movie_id = $2
        `;
        
        const result = await query(sql, [userId, movieId]);
        return result.rows[0] || null;
    }

    async findById(reviewId) {
        const sql = `
            SELECT r.*, u.firstname, u.lastname, u.email
            FROM reviews r
            INNER JOIN users u ON r.user_id = u.id
            WHERE r.id = $1
        `;
        
        const result = await query(sql, [reviewId]);
        return result.rows[0] || null;
    }

    async getMovieReviews(movieId, options = {}) {
        const { limit = 10, offset = 0, sortBy = 'recent' } = options;
        
        let orderByClause = 'r.created_at DESC';
        if (sortBy === 'rating_high') {
            orderByClause = 'r.rating DESC, r.created_at DESC';
        } else if (sortBy === 'rating_low') {
            orderByClause = 'r.rating ASC, r.created_at DESC';
        }
        
        const sql = `
            SELECT r.*, u.firstname, u.lastname
            FROM reviews r
            INNER JOIN users u ON r.user_id = u.id
            WHERE r.movie_id = $1
            ORDER BY ${orderByClause}
            LIMIT $2 OFFSET $3
        `;
        
        const result = await query(sql, [movieId, limit, offset]);
        return result.rows;
    }

    async getUserReviews(userId, options = {}) {
        const { limit = 20, offset = 0 } = options;
        
        const sql = `
            SELECT r.*, m.title, m.poster_url, m.release_date
            FROM reviews r
            INNER JOIN movies m ON r.movie_id = m.id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await query(sql, [userId, limit, offset]);
        return result.rows;
    }

    async countMovieReviews(movieId) {
        const sql = 'SELECT COUNT(*)::integer as count FROM reviews WHERE movie_id = $1';
        const result = await query(sql, [movieId]);
        return result.rows[0].count;
    }

    async update(reviewId, rating, reviewText) {
        const sql = `
            UPDATE reviews
            SET rating = $2, review_text = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await query(sql, [reviewId, rating, reviewText]);
        return result.rows[0];
    }

    async deleteById(reviewId) {
        const sql = 'DELETE FROM reviews WHERE id = $1';
        await query(sql, [reviewId]);
    }

    async deleteByUserAndMovie(userId, movieId) {
        const sql = 'DELETE FROM reviews WHERE user_id = $1 AND movie_id = $2';
        await query(sql, [userId, movieId]);
    }
}

export default new ReviewRepository();
