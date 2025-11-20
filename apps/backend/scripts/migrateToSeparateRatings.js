import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function migrateToSeparateRatings() {
    const client = await pool.connect();
    
    try {
        console.log('[INFO] Starting migration to separate TMDB and Community ratings...\n');
        
        await client.query('BEGIN');
        
        // 1. Rename old columns if they exist
        console.log('[STEP 1] Renaming old columns...');
        try {
            await client.query(`
                ALTER TABLE movies 
                RENAME COLUMN average_rating TO community_rating
            `);
            console.log('  ✓ Renamed average_rating to community_rating');
        } catch (error) {
            if (error.code === '42703') {
                console.log('  ℹ Column average_rating does not exist, skipping');
            } else {
                throw error;
            }
        }
        
        try {
            await client.query(`
                ALTER TABLE movies 
                RENAME COLUMN ratings_count TO community_count
            `);
            console.log('  ✓ Renamed ratings_count to community_count');
        } catch (error) {
            if (error.code === '42703') {
                console.log('  ℹ Column ratings_count does not exist, skipping');
            } else {
                throw error;
            }
        }
        
        // 2. Add TMDB columns if they don't exist
        console.log('\n[STEP 2] Adding TMDB rating columns...');
        try {
            await client.query(`
                ALTER TABLE movies 
                ADD COLUMN IF NOT EXISTS tmdb_rating DECIMAL(3,1) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS tmdb_vote_count INTEGER DEFAULT 0
            `);
            console.log('  ✓ Added tmdb_rating and tmdb_vote_count columns');
        } catch (error) {
            console.log('  ℹ Columns already exist');
        }
        
        // 3. Ensure community columns exist
        console.log('\n[STEP 3] Ensuring community rating columns exist...');
        try {
            await client.query(`
                ALTER TABLE movies 
                ADD COLUMN IF NOT EXISTS community_rating DECIMAL(3,2) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS community_count INTEGER DEFAULT 0
            `);
            console.log('  ✓ Community columns ensured');
        } catch (error) {
            console.log('  ℹ Columns already exist');
        }
        
        // 4. Update/recreate the trigger
        console.log('\n[STEP 4] Creating/updating community rating trigger...');
        
        await client.query(`
            CREATE OR REPLACE FUNCTION update_movie_community_rating()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE movies
                SET 
                    community_rating = (
                        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
                        FROM reviews
                        WHERE movie_id = COALESCE(NEW.movie_id, OLD.movie_id)
                    ),
                    community_count = (
                        SELECT COUNT(*)
                        FROM reviews
                        WHERE movie_id = COALESCE(NEW.movie_id, OLD.movie_id)
                    )
                WHERE id = COALESCE(NEW.movie_id, OLD.movie_id);
                
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log('  ✓ Function created');
        
        await client.query(`DROP TRIGGER IF EXISTS trigger_update_movie_rating_from_reviews ON reviews`);
        await client.query(`DROP TRIGGER IF EXISTS trigger_update_movie_community_rating_from_reviews ON reviews`);
        await client.query(`
            CREATE TRIGGER trigger_update_movie_community_rating_from_reviews
            AFTER INSERT OR UPDATE OR DELETE ON reviews
            FOR EACH ROW
            EXECUTE FUNCTION update_movie_community_rating()
        `);
        console.log('  ✓ Trigger created');
        
        // 5. Recalculate all community ratings
        console.log('\n[STEP 5] Recalculating community ratings...');
        const result = await client.query(`
            UPDATE movies m
            SET 
                community_rating = COALESCE(
                    (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE movie_id = m.id),
                    0
                ),
                community_count = COALESCE(
                    (SELECT COUNT(*) FROM reviews WHERE movie_id = m.id),
                    0
                )
        `);
        console.log(`  ✓ Updated ${result.rowCount} movies`);
        
        await client.query('COMMIT');
        
        // 6. Show statistics
        const stats = await client.query(`
            SELECT 
                COUNT(*) as total_movies,
                COUNT(*) FILTER (WHERE tmdb_rating > 0) as movies_with_tmdb,
                COUNT(*) FILTER (WHERE community_count > 0) as movies_with_community,
                SUM(community_count) as total_reviews
            FROM movies
        `);
        
        const { total_movies, movies_with_tmdb, movies_with_community, total_reviews } = stats.rows[0];
        
        console.log('\n═══════════════════════════════════════');
        console.log('🎉 MIGRATION SUCCESSFUL!');
        console.log('═══════════════════════════════════════');
        console.log('Statistics:');
        console.log(`  • Total movies:              ${total_movies}`);
        console.log(`  • Movies with TMDB rating:   ${movies_with_tmdb}`);
        console.log(`  • Movies with community rating: ${movies_with_community}`);
        console.log(`  • Total community reviews:   ${total_reviews}`);
        console.log('═══════════════════════════════════════\n');
        
        console.log('✅ TMDB and Community ratings are now COMPLETELY SEPARATE');
        console.log('   - tmdb_rating & tmdb_vote_count: From TMDB API (manual import)');
        console.log('   - community_rating & community_count: Calculated from user reviews\n');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ [ERROR] Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateToSeparateRatings().catch(error => {
    console.error('[FATAL]', error);
    process.exit(1);
});
