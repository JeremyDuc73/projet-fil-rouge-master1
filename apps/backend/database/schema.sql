-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'premium', 'admin', 'super_admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_date DATE,
    duration INTEGER,
    poster_url VARCHAR(500),
    backdrop_url VARCHAR(500),
    -- TMDB ratings (from TMDB API - NEVER touch these from app)
    tmdb_rating DECIMAL(3,1) DEFAULT 0,
    tmdb_vote_count INTEGER DEFAULT 0,
    -- Community ratings (calculated from reviews via trigger)
    community_rating DECIMAL(3,2) DEFAULT 0,
    community_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date);
CREATE INDEX IF NOT EXISTS idx_movies_community_rating ON movies(community_rating);

-- Movie images table (gallery)
CREATE TABLE IF NOT EXISTS movie_images (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(20) DEFAULT 'backdrop' CHECK (image_type IN ('backdrop', 'poster')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movie_images_movie ON movie_images(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_images_order ON movie_images(movie_id, display_order);

-- Movie categories junction table
CREATE TABLE IF NOT EXISTS movie_categories (
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_movie_categories_movie ON movie_categories(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_categories_category ON movie_categories(category_id);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'to_watch' CHECK (status IN ('to_watch', 'watched', 'dropped')),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_status ON watchlist(user_id, status);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Viewing history table
CREATE TABLE IF NOT EXISTS viewing_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_viewing_history_user ON viewing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_movie ON viewing_history(movie_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_viewed_at ON viewing_history(viewed_at);

-- Reviews table (unified ratings + reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT, -- Optional: NULL for simple ratings, filled for full reviews
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Trigger to update community ratings on movies (from reviews)
-- IMPORTANT: This ONLY touches community_rating and community_count
-- NEVER touches tmdb_rating or tmdb_vote_count
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

DROP TRIGGER IF EXISTS trigger_update_movie_rating_from_reviews ON reviews;
DROP TRIGGER IF EXISTS trigger_update_movie_community_rating_from_reviews ON reviews;
CREATE TRIGGER trigger_update_movie_community_rating_from_reviews
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_movie_community_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_movies_updated_at
BEFORE UPDATE ON movies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
