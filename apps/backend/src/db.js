import pkg from 'pg';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const { Pool } = pkg;

export const pool = new Pool(config.db);

pool.on('connect', () => {
    logger.debug('Database connection established');
});

pool.on('error', (err) => {
    logger.error('Unexpected database error', { error: err.message });
});

export const query = (text, params) => pool.query(text, params);

export default pool;