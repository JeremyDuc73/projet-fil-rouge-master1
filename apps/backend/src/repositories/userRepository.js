import { BaseRepository } from './baseRepository.js';
import { query } from '../db.js';

class UserRepository extends BaseRepository {
    constructor() {
        super('users');
    }

    async findByEmail(email) {
        return this.findOne({ email });
    }

    async createUser(userData) {
        const { email, password, firstname, lastname, role = 'user' } = userData;
        return this.create({ email, password, firstname, lastname, role });
    }

    async updateProfile(id, data) {
        const allowedFields = ['firstname', 'lastname', 'email'];
        const updateData = {};
        
        Object.keys(data).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = data[key];
            }
        });

        return this.update(id, updateData);
    }

    async updatePassword(id, hashedPassword) {
        return this.update(id, { password: hashedPassword });
    }

    async getUserStats(userId) {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM reviews WHERE user_id = $1) as ratings_count,
                (SELECT COUNT(*) FROM favorites WHERE user_id = $1) as favorites_count,
                (SELECT COUNT(*) FROM watchlist WHERE user_id = $1) as watchlist_count
        `;
        const result = await query(sql, [userId]);
        return result.rows[0];
    }

    async findAllWithFilters(filters = {}) {
        const {
            search,
            role,
            sortBy = 'created_at',
            order = 'desc',
            page = 1,
            limit = 20
        } = filters;

        const conditions = [];
        const params = [];
        let paramCount = 1;

        // Search filter
        if (search) {
            conditions.push(`(
                email ILIKE $${paramCount} OR 
                firstname ILIKE $${paramCount} OR 
                lastname ILIKE $${paramCount}
            )`);
            params.push(`%${search}%`);
            paramCount++;
        }

        // Role filter
        if (role) {
            conditions.push(`role = $${paramCount}`);
            params.push(role);
            paramCount++;
        }

        const whereClause = conditions.length > 0 
            ? `WHERE ${conditions.join(' AND ')}` 
            : '';

        // Count total
        const countSql = `SELECT COUNT(*) FROM users ${whereClause}`;
        const countResult = await query(countSql, params);
        const total = parseInt(countResult.rows[0].count);

        // Validate sort
        const validSortFields = ['created_at', 'email', 'firstname', 'lastname', 'role'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Fetch users
        const offset = (page - 1) * limit;
        const sql = `
            SELECT id, email, firstname, lastname, role, created_at, updated_at
            FROM users
            ${whereClause}
            ORDER BY ${sortField} ${sortOrder}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        
        const result = await query(sql, [...params, limit, offset]);

        return {
            users: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

export default new UserRepository();
