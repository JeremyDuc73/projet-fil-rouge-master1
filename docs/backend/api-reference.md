# 📡 API Reference Complète

Base URL : `http://localhost:3001/api` (dev) | `https://cinezone.jeremyduc.dev/api` (prod)

---

## 🔐 Authentication

### POST `/auth/register`

Créer un nouveau compte utilisateur.

**Auth** : ❌ Aucune

**Body** :
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstname": "John",
  "lastname": "Doe"
}
```

**Response** `201` :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstname": "John",
      "lastname": "Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors** :
- `400` : Validation error (email invalide, mot de passe trop court)
- `409` : Email déjà utilisé

---

### POST `/auth/login`

Se connecter avec email et mot de passe.

**Auth** : ❌ Aucune

**Body** :
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Errors** :
- `401` : Identifiants invalides

---

### POST `/auth/refresh`

Rafraîchir l'access token avec le refresh token.

**Auth** : ❌ Aucune

**Body** :
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token..."
  }
}
```

**Errors** :
- `401` : Refresh token invalide ou expiré

---

### GET `/auth/me`

Récupérer les informations de l'utilisateur connecté.

**Auth** : ✅ Bearer Token

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🎬 Movies

### GET `/movies`

Récupérer la liste des films avec filtres et pagination.

**Auth** : ❌ Aucune

**Query Params** :
```
?page=1                    # Page (défaut: 1)
&limit=20                  # Nombre par page (défaut: 20, max: 100)
&category=action           # Filtrer par catégorie (slug)
&min_rating=7              # Note TMDB minimale
&search=matrix             # Recherche dans titre/description
&sortBy=created_at         # Tri (created_at, title, release_date, tmdb_rating)
&order=DESC                # Ordre (ASC, DESC)
```

**Exemple** :
```
GET /api/movies?category=action&min_rating=7&sortBy=tmdb_rating&order=DESC
```

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "movies": [
      {
        "id": 1,
        "title": "The Dark Knight",
        "description": "When the menace known as the Joker...",
        "release_date": "2008-07-18",
        "duration": 152,
        "poster_url": "/abc123.jpg",
        "backdrop_url": "/def456.jpg",
        "tmdb_id": 155,
        "tmdb_rating": 8.5,
        "tmdb_vote_count": 25000,
        "community_rating": 4.2,
        "community_count": 150,
        "categories": [
          { "id": 1, "name": "Action", "slug": "action" },
          { "id": 2, "name": "Crime", "slug": "crime" }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### GET `/movies/:id`

Récupérer les détails complets d'un film.

**Auth** : ❌ Aucune

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "The Dark Knight",
    "description": "...",
    "release_date": "2008-07-18",
    "duration": 152,
    "poster_url": "/abc123.jpg",
    "backdrop_url": "/def456.jpg",
    "tmdb_id": 155,
    "tmdb_rating": 8.5,
    "tmdb_vote_count": 25000,
    "community_rating": 4.2,
    "community_count": 150,
    "categories": [...],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors** :
- `404` : Film non trouvé

---

### POST `/movies`

Créer un nouveau film (admin uniquement).

**Auth** : ✅ Bearer Token + 🛡️ Admin

**Body** (multipart/form-data pour upload d'images) :
```json
{
  "title": "New Movie",
  "description": "Description...",
  "release_date": "2024-01-01",
  "duration": 120,
  "categories": [1, 2, 3]  // IDs des catégories
}
```
+ `poster` (file, optionnel)
+ `backdrop` (file, optionnel)

**Response** `201` :
```json
{
  "success": true,
  "data": {
    "id": 42,
    "title": "New Movie",
    ...
  }
}
```

**Errors** :
- `400` : Validation error
- `401` : Non authentifié
- `403` : Pas les droits admin

---

### PUT `/movies/:id`

Mettre à jour un film (admin uniquement).

**Auth** : ✅ Bearer Token + 🛡️ Admin

**Body** : Mêmes champs que POST (tous optionnels)

**Response** `200` :
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE `/movies/:id`

Supprimer un film (admin uniquement).

**Auth** : ✅ Bearer Token + 🛡️ Admin

**Response** `200` :
```json
{
  "success": true,
  "message": "Movie deleted successfully"
}
```

---

## 📝 Reviews

### GET `/movies/:id/reviews`

Récupérer les avis d'un film.

**Auth** : ❌ Aucune

**Query Params** :
```
?page=1
&limit=10
&sortBy=created_at  # ou rating
&order=DESC
```

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "user_id": 5,
        "username": "John Doe",
        "rating": 5,
        "comment": "Amazing movie!",
        "created_at": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST `/reviews`

Créer un avis sur un film.

**Auth** : ✅ Bearer Token

**Body** :
```json
{
  "movie_id": 1,
  "rating": 5,      // 1-5
  "comment": "Great movie!"
}
```

**Response** `201` :
```json
{
  "success": true,
  "data": {
    "id": 42,
    "movie_id": 1,
    "user_id": 5,
    "rating": 5,
    "comment": "Great movie!",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

**Errors** :
- `400` : Validation (rating hors limites)
- `409` : Avis déjà existant pour ce film

---

### PUT `/reviews/:id`

Modifier son propre avis.

**Auth** : ✅ Bearer Token

**Body** :
```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

**Response** `200` :
```json
{
  "success": true,
  "data": { ... }
}
```

**Errors** :
- `403` : Ce n'est pas votre avis
- `404` : Avis non trouvé

---

### DELETE `/reviews/:id`

Supprimer son propre avis.

**Auth** : ✅ Bearer Token

**Response** `200` :
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## ⭐ Favorites

### GET `/favorites`

Récupérer ses films favoris.

**Auth** : ✅ Bearer Token

**Query Params** : `?page=1&limit=20`

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": 1,
        "title": "Movie Title",
        "poster_url": "/abc.jpg",
        "tmdb_rating": 8.5,
        "added_at": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST `/favorites`

Ajouter un film aux favoris.

**Auth** : ✅ Bearer Token

**Body** :
```json
{
  "movie_id": 1
}
```

**Response** `201` :
```json
{
  "success": true,
  "message": "Movie added to favorites"
}
```

**Errors** :
- `409` : Déjà dans les favoris

---

### DELETE `/favorites/:movieId`

Retirer un film des favoris.

**Auth** : ✅ Bearer Token

**Response** `200` :
```json
{
  "success": true,
  "message": "Movie removed from favorites"
}
```

---

## 📺 Watchlist

### GET `/watchlist`

Récupérer sa watchlist.

**Auth** : ✅ Bearer Token

**Query Params** :
```
?status=to_watch    # Filtrer par statut (to_watch, watched, dropped)
&page=1
&limit=20
```

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "watchlist": [
      {
        "id": 1,
        "title": "Movie Title",
        "poster_url": "/abc.jpg",
        "status": "to_watch",
        "added_at": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### GET `/watchlist/stats`

Récupérer les statistiques de sa watchlist.

**Auth** : ✅ Bearer Token

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "to_watch": 15,
    "watched": 42,
    "dropped": 3
  }
}
```

---

### POST `/watchlist`

Ajouter un film à la watchlist.

**Auth** : ✅ Bearer Token

**Body** :
```json
{
  "movie_id": 1,
  "status": "to_watch"  // to_watch, watched, dropped
}
```

**Response** `201` :
```json
{
  "success": true,
  "message": "Movie added to watchlist"
}
```

---

### PATCH `/watchlist/:movieId/status`

Changer le statut d'un film dans la watchlist.

**Auth** : ✅ Bearer Token

**Body** :
```json
{
  "status": "watched"  // to_watch, watched, dropped
}
```

**Response** `200` :
```json
{
  "success": true,
  "message": "Watchlist status updated"
}
```

---

### DELETE `/watchlist/:movieId`

Retirer un film de la watchlist.

**Auth** : ✅ Bearer Token

**Response** `200` :
```json
{
  "success": true,
  "message": "Movie removed from watchlist"
}
```

---

## 📜 History

### GET `/history`

Récupérer son historique de visionnage.

**Auth** : ✅ Bearer Token

**Query Params** : `?page=1&limit=20`

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": 1,
        "movie_id": 5,
        "title": "Movie Title",
        "poster_url": "/abc.jpg",
        "viewed_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST `/history`

Ajouter une entrée dans l'historique (tracking automatique).

**Auth** : ✅ Bearer Token

**Body** :
```json
{
  "movie_id": 1
}
```

**Response** `201` :
```json
{
  "success": true,
  "message": "Added to history"
}
```

---

### DELETE `/history`

Effacer tout son historique.

**Auth** : ✅ Bearer Token

**Response** `200` :
```json
{
  "success": true,
  "message": "History cleared"
}
```

---

## 🗂️ Categories

### GET `/categories`

Récupérer toutes les catégories.

**Auth** : ❌ Aucune

**Response** `200` :
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Action",
      "slug": "action"
    },
    {
      "id": 2,
      "name": "Drama",
      "slug": "drama"
    }
  ]
}
```

---

## 👥 Users (Admin)

### GET `/users`

Liste tous les utilisateurs (admin uniquement).

**Auth** : ✅ Bearer Token + 🛡️ Admin

**Query Params** :
```
?search=john          # Recherche email/nom
&role=user            # Filtrer par rôle
&page=1
&limit=20
&sortBy=created_at
&order=DESC
```

**Response** `200` :
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "firstname": "John",
        "lastname": "Doe",
        "role": "user",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### PATCH `/users/:id/role`

Changer le rôle d'un utilisateur (super_admin uniquement).

**Auth** : ✅ Bearer Token + 🛡️ Super Admin

**Body** :
```json
{
  "role": "premium"  // user, premium, admin, super_admin
}
```

**Response** `200` :
```json
{
  "success": true,
  "message": "User role updated"
}
```

---

## 🚨 Codes d'Erreur

| Code | Description |
|------|-------------|
| `200` | Succès |
| `201` | Créé avec succès |
| `400` | Validation error (bad request) |
| `401` | Non authentifié |
| `403` | Pas les permissions |
| `404` | Ressource non trouvée |
| `409` | Conflit (ex: email déjà utilisé) |
| `500` | Erreur serveur |

### Format d'Erreur

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

---

## 📝 Notes

- Tous les timestamps sont en UTC (ISO 8601)
- Les tokens JWT expirent après 1h (access) et 7j (refresh)
- Les images sont servies depuis `/uploads/` ou TMDB CDN
- Rate limiting : À implémenter (recommandé : 100 req/min)

---

[← Backend Overview](./README.md) | [Database Schema →](./database.md)
