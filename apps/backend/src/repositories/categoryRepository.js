import { BaseRepository } from './baseRepository.js';
import { query } from '../db.js';

class CategoryRepository extends BaseRepository {
    constructor() {
        super('categories');
    }

    async findBySlug(slug) {
        return this.findOne({ slug });
    }

    async getMovieCategories(movieId) {
        const sql = `
            SELECT c.* 
            FROM categories c
            INNER JOIN movie_categories mc ON c.id = mc.category_id
            WHERE mc.movie_id = $1
        `;
        const result = await query(sql, [movieId]);
        return result.rows;
    }
}

export default new CategoryRepository();
