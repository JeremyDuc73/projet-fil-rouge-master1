import { query } from '../db.js';

class ViewingHistoryRepository {
    async addView(userId, movieId) {
        const sql = `
            INSERT INTO viewing_history (user_id, movie_id)
            VALUES ($1, $2)
            RETURNING *
        `;
        const result = await query(sql, [userId, movieId]);
        return result.rows[0];
    }

    async getUserHistory(userId, options = {}) {
        const { limit = 20, offset = 0 } = options;
        
        const sql = `
            SELECT DISTINCT ON (m.id) 
                   m.id, m.title, m.description, m.release_date, m.duration,
                   m.poster_url, m.backdrop_url,
                   m.tmdb_rating, m.tmdb_vote_count,
                   m.community_rating, m.community_count,
                   vh.viewed_at,
                   COALESCE(
                       json_agg(
                           json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
                       ) FILTER (WHERE c.id IS NOT NULL),
                       '[]'
                   ) as categories,
                   COUNT(vh.id) OVER (PARTITION BY m.id) as view_count
            FROM viewing_history vh
            INNER JOIN movies m ON vh.movie_id = m.id
            LEFT JOIN movie_categories mc ON m.id = mc.movie_id
            LEFT JOIN categories c ON mc.category_id = c.id
            WHERE vh.user_id = $1
            GROUP BY m.id, m.title, m.description, m.release_date, m.duration,
                     m.poster_url, m.backdrop_url, m.tmdb_rating, m.tmdb_vote_count,
                     m.community_rating, m.community_count, vh.viewed_at, vh.id
            ORDER BY m.id, vh.viewed_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await query(sql, [userId, limit, offset]);
        return result.rows;
    }

    async getMovieViewCount(userId, movieId) {
        const sql = `
            SELECT COUNT(*) as view_count
            FROM viewing_history
            WHERE user_id = $1 AND movie_id = $2
        `;
        const result = await query(sql, [userId, movieId]);
        return parseInt(result.rows[0].view_count);
    }

    async clearHistory(userId) {
        const sql = `
            DELETE FROM viewing_history
            WHERE user_id = $1
            RETURNING *
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }
}

export default new ViewingHistoryRepository();
