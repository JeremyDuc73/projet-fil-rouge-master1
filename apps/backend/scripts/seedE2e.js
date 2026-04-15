/**
 * Données déterministes pour les tests E2E (utilisateurs + films custom).
 * Idempotent : supprime puis recrée les lignes identifiées par email / titres E2E.
 */
import bcrypt from 'bcrypt';
import pool from '../src/db.js';

const E2E_PASSWORD = process.env.E2E_PASSWORD || 'E2E_Test_Pass_1!';
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const USERS = [
    {
        email: 'e2e-user@cinezone.test',
        firstname: 'E2E',
        lastname: 'User',
        role: 'user',
    },
    {
        email: 'e2e-admin@cinezone.test',
        firstname: 'E2E',
        lastname: 'Admin',
        role: 'admin',
    },
];

const MOVIES = [
    {
        title: 'E2E Film Alpha',
        description: 'Film de test E2E — note haute pour filtre.',
        release_date: '2020-06-15',
        duration: 95,
        tmdb_rating: 8.5,
        categorySlug: 'action',
    },
    {
        title: 'E2E Film Beta',
        description: 'Film de test E2E — note basse pour filtre.',
        release_date: '2019-03-20',
        duration: 88,
        tmdb_rating: 5.0,
        categorySlug: 'comedie',
    },
];

async function cleanup() {
    await pool.query(`
        DELETE FROM favorites
        WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))
    `, [USERS.map((u) => u.email)]);

    await pool.query(`
        DELETE FROM watchlist
        WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))
    `, [USERS.map((u) => u.email)]);

    await pool.query(`
        DELETE FROM viewing_history
        WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))
    `, [USERS.map((u) => u.email)]);

    await pool.query(`
        DELETE FROM reviews
        WHERE movie_id IN (SELECT id FROM movies WHERE title LIKE 'E2E Film %')
    `);

    await pool.query(`
        DELETE FROM movie_categories
        WHERE movie_id IN (SELECT id FROM movies WHERE title LIKE 'E2E Film %')
    `);

    await pool.query(`DELETE FROM movies WHERE title LIKE 'E2E Film %'`);

    await pool.query(
        `DELETE FROM users WHERE email = ANY($1::text[])`,
        [USERS.map((u) => u.email)]
    );
}

async function seed() {
    const hash = await bcrypt.hash(E2E_PASSWORD, SALT_ROUNDS);

    for (const u of USERS) {
        await pool.query(
            `INSERT INTO users (email, password, firstname, lastname, role)
             VALUES ($1, $2, $3, $4, $5)`,
            [u.email, hash, u.firstname, u.lastname, u.role]
        );
    }

    for (const m of MOVIES) {
        const cat = await pool.query(
            `SELECT id FROM categories WHERE slug = $1`,
            [m.categorySlug]
        );
        const categoryId = cat.rows[0]?.id;
        if (!categoryId) {
            throw new Error(`Category slug not found: ${m.categorySlug}`);
        }

        const ins = await pool.query(
            `INSERT INTO movies (
                title, description, release_date, duration, tmdb_id,
                tmdb_rating, tmdb_vote_count
            ) VALUES ($1, $2, $3, $4, NULL, $5, 100)
            RETURNING id`,
            [m.title, m.description, m.release_date, m.duration, m.tmdb_rating]
        );

        const movieId = ins.rows[0].id;
        await pool.query(
            `INSERT INTO movie_categories (movie_id, category_id) VALUES ($1, $2)`,
            [movieId, categoryId]
        );
    }

    console.log('[seedE2e] OK — users:', USERS.map((u) => u.email).join(', '));
}

async function main() {
    try {
        await cleanup();
        await seed();
        process.exit(0);
    } catch (e) {
        console.error('[seedE2e]', e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
