import { query } from '../db.js';

class FavoriteRepository {
    async addFavorite(userId, movieId) {
        const sql = `
            INSERT INTO favorites (user_id, movie_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, movie_id) DO NOTHING
            RETURNING *
        `;
        const result = await query(sql, [userId, movieId]);
        return result.rows[0];
    }

    async removeFavorite(userId, movieId) {
        const sql = `
            DELETE FROM favorites
            WHERE user_id = $1 AND movie_id = $2
            RETURNING *
        `;
        const result = await query(sql, [userId, movieId]);
        return result.rows[0];
    }

    async isFavorite(userId, movieId) {
        const sql = `
            SELECT EXISTS(
                SELECT 1 FROM favorites
                WHERE user_id = $1 AND movie_id = $2
            ) as is_favorite
        `;
        const result = await query(sql, [userId, movieId]);
        return result.rows[0].is_favorite;
    }

    async getUserFavorites(userId, options = {}) {
        const { limit = 20, offset = 0 } = options;
        
        const sql = `
            SELECT m.*, f.added_at,
                   COALESCE(
                       json_agg(
                           json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
                       ) FILTER (WHERE c.id IS NOT NULL),
                       '[]'
                   ) as categories
            FROM favorites f
            INNER JOIN movies m ON f.movie_id = m.id
            LEFT JOIN movie_categories mc ON m.id = mc.movie_id
            LEFT JOIN categories c ON mc.category_id = c.id
            WHERE f.user_id = $1
            GROUP BY m.id, f.added_at
            ORDER BY f.added_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await query(sql, [userId, limit, offset]);
        return result.rows;
    }

    async countUserFavorites(userId) {
        const sql = `SELECT COUNT(*) FROM favorites WHERE user_id = $1`;
        const result = await query(sql, [userId]);
        return parseInt(result.rows[0].count);
    }
}

export default new FavoriteRepository();
