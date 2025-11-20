#!/bin/sh
set -e

echo "🚀 Starting CineZone Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until node -e "
const pg = require('pg');
const client = new pg.Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cinezone_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});
client.connect()
  .then(() => { console.log('✅ PostgreSQL is ready!'); client.end(); process.exit(0); })
  .catch(() => { process.exit(1); });
" 2>/dev/null; do
  echo "⏳ PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Check if we should seed TMDB data
if [ "${SEED_TMDB_ON_START}" = "true" ]; then
  echo "🎬 Seeding TMDB data..."
  node scripts/importTMDB.js || echo "⚠️  TMDB seed failed (might already exist)"
fi

# Start the server
echo "🚀 Starting server..."
exec node src/server.js
