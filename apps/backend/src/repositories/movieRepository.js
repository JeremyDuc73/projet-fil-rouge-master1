import { BaseRepository } from './baseRepository.js';
import { query } from '../db.js';
import { PAGINATION, MOVIE_SORT_FIELDS, SORT_ORDER } from '../utils/constants.js';

class MovieRepository extends BaseRepository {
    constructor() {
        super('movies');
    }

    async findAllWithFilters(filters = {}) {
        const {
            category,
            min_rating,
            search,
            source, // 'custom' ou 'tmdb'
            sortBy = MOVIE_SORT_FIELDS.CREATED_AT,
            order = SORT_ORDER.DESC,
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT
        } = filters;

        const validatedLimit = Math.min(limit, PAGINATION.MAX_LIMIT);
        const offset = (page - 1) * validatedLimit;

        const conditions = [];
        const params = [];
        let paramCount = 1;

        let filterSql = 'FROM movies m';
        
        if (category) {
            filterSql += ' INNER JOIN movie_categories mc ON m.id = mc.movie_id';
            filterSql += ' INNER JOIN categories c ON mc.category_id = c.id';
            conditions.push(`c.slug = $${paramCount++}`);
            params.push(category);
        }

        // Filter by source (custom or tmdb)
        if (source === 'custom') {
            conditions.push('m.tmdb_id IS NULL');
        } else if (source === 'tmdb') {
            conditions.push('m.tmdb_id IS NOT NULL');
        }

        if (min_rating) {
            conditions.push(`m.tmdb_rating >= $${paramCount++}`);
            params.push(min_rating);
        }

        if (search) {
            conditions.push(`(m.title ILIKE $${paramCount} OR m.description ILIKE $${paramCount})`);
            params.push(`%${search}%`);
            paramCount++;
        }

        if (conditions.length > 0) {
            filterSql += ` WHERE ${conditions.join(' AND ')}`;
        }

        const countSql = `SELECT COUNT(DISTINCT m.id) ${filterSql}`;
        const countResult = await query(countSql, params);
        const total = parseInt(countResult.rows[0].count);

        const validSortFields = Object.values(MOVIE_SORT_FIELDS);
        const sortField = validSortFields.includes(sortBy) ? sortBy : MOVIE_SORT_FIELDS.CREATED_AT;
        const sortOrder = order.toUpperCase() === SORT_ORDER.ASC ? SORT_ORDER.ASC : SORT_ORDER.DESC;

        // Si on trie par tmdb_rating, mettre les films sans note (0) en dernier
        let selectClause, orderByClause;
        if (sortField === 'tmdb_rating') {
            selectClause = `SELECT DISTINCT m.id, m.${sortField}, CASE WHEN m.tmdb_rating = 0 THEN 1 ELSE 0 END as is_zero`;
            orderByClause = `ORDER BY is_zero, m.${sortField} ${sortOrder}`;
        } else {
            selectClause = `SELECT DISTINCT m.id, m.${sortField}`;
            orderByClause = `ORDER BY m.${sortField} ${sortOrder}`;
        }

        const movieIdsSql = `
            ${selectClause}
            ${filterSql}
            ${orderByClause}
            LIMIT $${paramCount++} OFFSET $${paramCount++}
        `;
        params.push(validatedLimit, offset);
        
        const idsResult = await query(movieIdsSql, params);
        const movieIds = idsResult.rows.map(row => row.id);

        if (movieIds.length === 0) {
            return {
                movies: [],
                pagination: {
                    page,
                    limit: validatedLimit,
                    total,
                    totalPages: 0
                }
            };
        }

        const detailsSql = `
            SELECT m.id, m.title, m.description, m.release_date, m.duration, 
                   m.poster_url, m.backdrop_url, 
                   m.tmdb_id, m.tmdb_rating, m.tmdb_vote_count,
                   m.community_rating, m.community_count,
                   m.created_at, m.updated_at,
                   COALESCE(
                       json_agg(
                           json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
                       ) FILTER (WHERE c.id IS NOT NULL),
                       '[]'
                   ) as categories
            FROM movies m
            LEFT JOIN movie_categories mc ON m.id = mc.movie_id
            LEFT JOIN categories c ON mc.category_id = c.id
            WHERE m.id = ANY($1)
            GROUP BY m.id, m.title, m.description, m.release_date, m.duration, 
                     m.poster_url, m.backdrop_url, m.tmdb_id, m.tmdb_rating, m.tmdb_vote_count,
                     m.community_rating, m.community_count,
                     m.created_at, m.updated_at
            ORDER BY m.${sortField} ${sortOrder}
        `;

        const result = await query(detailsSql, [movieIds]);

        return {
            movies: result.rows,
            pagination: {
                page,
                limit: validatedLimit,
                total,
                totalPages: Math.ceil(total / validatedLimit)
            }
        };
    }

    async findByIdWithDetails(id) {
        const sql = `
            SELECT m.id, m.tmdb_id, m.title, m.description, m.release_date, m.duration, 
                   m.poster_url, m.backdrop_url, 
                   m.tmdb_rating, m.tmdb_vote_count,
                   m.community_rating, m.community_count,
                   m.created_at, m.updated_at,
                   COALESCE(
                       json_agg(
                           DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
                       ) FILTER (WHERE c.id IS NOT NULL),
                       '[]'
                   ) as categories,
                   COALESCE(
                       (SELECT json_agg(
                           json_build_object(
                               'id', mi.id, 
                               'url', mi.image_url, 
                               'type', mi.image_type
                           ) ORDER BY mi.display_order
                       )
                       FROM movie_images mi 
                       WHERE mi.movie_id = m.id),
                       '[]'
                   ) as gallery
            FROM movies m
            LEFT JOIN movie_categories mc ON m.id = mc.movie_id
            LEFT JOIN categories c ON mc.category_id = c.id
            WHERE m.id = $1
            GROUP BY m.id, m.tmdb_id, m.title, m.description, m.release_date, m.duration, 
                     m.poster_url, m.backdrop_url, m.tmdb_rating, m.tmdb_vote_count,
                     m.community_rating, m.community_count,
                     m.created_at, m.updated_at
        `;
        
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    async createWithCategories(movieData, categoryIds = []) {
        const client = await query('BEGIN');
        
        try {
            const { 
                title, description, release_date, duration, poster_url, backdrop_url,
                tmdb_id, tmdb_rating, tmdb_vote_count
            } = movieData;
            
            const movieResult = await query(
                `INSERT INTO movies (
                    title, description, release_date, duration, poster_url, backdrop_url,
                    tmdb_id, tmdb_rating, tmdb_vote_count,
                    community_rating, community_count
                )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0)
                 RETURNING *`,
                [title, description, release_date, duration, poster_url, backdrop_url, tmdb_id, tmdb_rating, tmdb_vote_count]
            );
            
            const movie = movieResult.rows[0];

            if (categoryIds.length > 0) {
                for (const categoryId of categoryIds) {
                    await query(
                        'INSERT INTO movie_categories (movie_id, category_id) VALUES ($1, $2)',
                        [movie.id, categoryId]
                    );
                }
            }

            await query('COMMIT');
            return this.findByIdWithDetails(movie.id);
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    }

    async updateWithCategories(id, movieData, categoryIds) {
        const client = await query('BEGIN');
        
        try {
            const updateFields = [];
            const params = [];
            let paramCount = 1;

            const allowedFields = ['title', 'description', 'release_date', 'duration', 'poster_url', 'backdrop_url'];
            
            for (const field of allowedFields) {
                if (movieData[field] !== undefined) {
                    updateFields.push(`${field} = $${paramCount++}`);
                    params.push(movieData[field]);
                }
            }

            if (updateFields.length > 0) {
                params.push(id);
                await query(
                    `UPDATE movies SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
                    params
                );
            }

            if (categoryIds !== undefined) {
                await query('DELETE FROM movie_categories WHERE movie_id = $1', [id]);
                
                if (categoryIds.length > 0) {
                    for (const categoryId of categoryIds) {
                        await query(
                            'INSERT INTO movie_categories (movie_id, category_id) VALUES ($1, $2)',
                            [id, categoryId]
                        );
                    }
                }
            }

            await query('COMMIT');
            return this.findByIdWithDetails(id);
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    }

    async getMovieStats(movieId) {
        const sql = `
            SELECT 
                COUNT(DISTINCT r.id) as ratings_count,
                COUNT(DISTINCT f.user_id) as favorites_count,
                COUNT(DISTINCT w.user_id) as watchlist_count,
                COUNT(DISTINCT vh.id) as views_count
            FROM movies m
            LEFT JOIN reviews r ON m.id = r.movie_id
            LEFT JOIN favorites f ON m.id = f.movie_id
            LEFT JOIN watchlist w ON m.id = w.movie_id
            LEFT JOIN viewing_history vh ON m.id = vh.movie_id
            WHERE m.id = $1
            GROUP BY m.id
        `;
        
        const result = await query(sql, [movieId]);
        return result.rows[0] || null;
    }

    async findByTmdbId(tmdbId) {
        const sql = 'SELECT * FROM movies WHERE tmdb_id = $1';
        const result = await query(sql, [tmdbId]);
        return result.rows[0] || null;
    }
}

export default new MovieRepository();
