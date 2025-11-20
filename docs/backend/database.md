# 🗄️ Database Schema

## Tables Principales

### users
```sql
id, email, password, firstname, lastname, role, created_at, updated_at
```

### movies
```sql
id, tmdb_id, title, description, release_date, duration
poster_url, backdrop_url, tmdb_rating, tmdb_vote_count
community_rating, community_count, created_at, updated_at
```

### categories
```sql
id, name, slug
```

### movie_categories (many-to-many)
```sql
movie_id, category_id
```

### reviews
```sql
id, user_id, movie_id, rating, comment, created_at, updated_at
```

### favorites
```sql
user_id, movie_id, created_at
```

### watchlist
```sql
user_id, movie_id, status, created_at
status: 'to_watch' | 'watched' | 'dropped'
```

### viewing_history
```sql
id, user_id, movie_id, viewed_at
```

Voir `/apps/backend/database/schema.sql` pour le schéma complet.
