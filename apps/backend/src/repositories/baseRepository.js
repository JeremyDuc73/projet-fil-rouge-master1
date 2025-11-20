import { query } from '../db.js';

export class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async findAll(conditions = {}, options = {}) {
        const { limit, offset, orderBy, order = 'ASC' } = options;
        
        let sql = `SELECT * FROM ${this.tableName}`;
        const params = [];
        let paramCount = 1;

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions)
                .map(key => `${key} = $${paramCount++}`)
                .join(' AND ');
            sql += ` WHERE ${whereClause}`;
            params.push(...Object.values(conditions));
        }

        if (orderBy) {
            sql += ` ORDER BY ${orderBy} ${order}`;
        }

        if (limit) {
            sql += ` LIMIT $${paramCount++}`;
            params.push(limit);
        }

        if (offset) {
            sql += ` OFFSET $${paramCount++}`;
            params.push(offset);
        }

        const result = await query(sql, params);
        return result.rows;
    }

    async findById(id) {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = $1`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    async findOne(conditions) {
        const sql = `SELECT * FROM ${this.tableName} WHERE ${Object.keys(conditions)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ')} LIMIT 1`;
        
        const result = await query(sql, Object.values(conditions));
        return result.rows[0] || null;
    }

    async create(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

        const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) 
                     VALUES (${placeholders}) 
                     RETURNING *`;

        const result = await query(sql, values);
        return result.rows[0];
    }

    async update(id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);

        const setClause = keys
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');

        const sql = `UPDATE ${this.tableName} 
                     SET ${setClause} 
                     WHERE id = $${keys.length + 1} 
                     RETURNING *`;

        const result = await query(sql, [...values, id]);
        return result.rows[0] || null;
    }

    async delete(id) {
        const sql = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
        const result = await query(sql, [id]);
        return result.rows[0] || null;
    }

    async count(conditions = {}) {
        let sql = `SELECT COUNT(*) FROM ${this.tableName}`;
        const params = [];

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions)
                .map((key, index) => `${key} = $${index + 1}`)
                .join(' AND ');
            sql += ` WHERE ${whereClause}`;
            params.push(...Object.values(conditions));
        }

        const result = await query(sql, params);
        return parseInt(result.rows[0].count);
    }

    async exists(conditions) {
        const count = await this.count(conditions);
        return count > 0;
    }
}
