import pool from '../src/db.js';

const makeAdmin = async (email) => {
    try {
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role',
            ['admin', email]
        );

        if (result.rows.length === 0) {
            console.log(`[ERROR] User with email ${email} not found`);
            process.exit(1);
        }

        console.log(`[SUCCESS] User ${email} is now admin`);
        console.log(result.rows[0]);
        process.exit(0);
    } catch (error) {
        console.error('[ERROR]', error.message);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.log('[ERROR] Please provide an email: node scripts/makeAdmin.js <email>');
    process.exit(1);
}

makeAdmin(email);
