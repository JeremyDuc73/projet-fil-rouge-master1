import { query } from '../db.js';

class WatchlistRepository {
    async addToWatchlist(userId, movieId) {
        const sql = `
            INSERT INTO watchlist (user_id, movie_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, movie_id) DO NOTHING
            RETURNING *
        `;
        const result = await query(sql, [userId, movieId]);
        return result.rows[0];
    }

    async removeFromWatchlist(userId, movieId) {
        const sql = `
            DELETE FROM watchlist
            WHERE user_id = $1 AND movie_id = $2
            RETURNING *
        `;
        const result = await query(sql, [userId, movieId]);
        return result.rows[0];
    }

    async isInWatchlist(userId, movieId) {
        const sql = `
            SELECT EXISTS(
                SELECT 1 FROM watchlist
                WHERE user_id = $1 AND movie_id = $2
            ) as in_watchlist
        `;
        const result = await query(sql, [userId, movieId]);
        return result.rows[0].in_watchlist;
    }

    async getUserWatchlist(userId, options = {}) {
        const { limit = 20, offset = 0, status } = options;
        
        const params = [userId];
        let paramCount = 2;
        let statusFilter = '';
        
        if (status) {
            statusFilter = `AND w.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        
        const sql = `
            SELECT m.*, w.added_at, w.status,
                   COALESCE(
                       json_agg(
                           json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
                       ) FILTER (WHERE c.id IS NOT NULL),
                       '[]'
                   ) as categories
            FROM watchlist w
            INNER JOIN movies m ON w.movie_id = m.id
            LEFT JOIN movie_categories mc ON m.id = mc.movie_id
            LEFT JOIN categories c ON mc.category_id = c.id
            WHERE w.user_id = $1 ${statusFilter}
            GROUP BY m.id, w.added_at, w.status
            ORDER BY w.added_at DESC
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        
        params.push(limit, offset);
        const result = await query(sql, params);
        return result.rows;
    }

    async countUserWatchlist(userId, status = null) {
        let sql = `SELECT COUNT(*) FROM watchlist WHERE user_id = $1`;
        const params = [userId];
        
        if (status) {
            sql += ` AND status = $2`;
            params.push(status);
        }
        
        const result = await query(sql, params);
        return parseInt(result.rows[0].count);
    }

    async updateStatus(userId, movieId, status) {
        const sql = `
            UPDATE watchlist
            SET status = $3
            WHERE user_id = $1 AND movie_id = $2
            RETURNING *
        `;
        const result = await query(sql, [userId, movieId, status]);
        return result.rows[0];
    }

    async getWatchlistStats(userId) {
        const sql = `
            SELECT 
                status,
                COUNT(*) as count
            FROM watchlist
            WHERE user_id = $1
            GROUP BY status
        `;
        const result = await query(sql, [userId]);
        
        const stats = {
            to_watch: 0,
            watched: 0,
            dropped: 0
        };
        
        result.rows.forEach(row => {
            stats[row.status] = parseInt(row.count);
        });
        
        return stats;
    }
}

export default new WatchlistRepository();
