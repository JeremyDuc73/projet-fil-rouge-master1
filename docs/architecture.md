# 🏗️ Architecture du Projet

## Vue d'Ensemble

CineZone est une application full-stack moderne suivant une architecture **API REST** avec séparation frontend/backend.

```
┌─────────────────────────────────────────────────────────┐
│                     UTILISATEUR                          │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   Nuxt.js Frontend   │  Port 3000
         │   (SSR + SPA)        │
         └───────────┬──────────┘
                     │
              HTTP/REST API
                     │
         ┌───────────▼──────────┐
         │   Express Backend    │  Port 3001
         │   (Node.js API)      │
         └───────────┬──────────┘
                     │
              SQL Queries
                     │
         ┌───────────▼──────────┐
         │   PostgreSQL DB      │  Port 5432
         └──────────────────────┘
```

---

## 🎯 Principes d'Architecture

### 1. Séparation des Responsabilités

**Backend** : API pure, logique métier, sécurité
**Frontend** : Présentation, UX, SEO (SSR)

### 2. Architecture en Couches (Backend)

```
Routes (HTTP)
    ↓
Controllers (Validation, Response)
    ↓
Services (Logique Métier)
    ↓
Repositories (Accès Données)
    ↓
Database (PostgreSQL)
```

### 3. Pattern Repository

Abstraction de la couche données pour faciliter :
- Tests unitaires (mocking)
- Changement de DB (si nécessaire)
- Réutilisabilité des requêtes

### 4. Store-Based State (Frontend)

Pinia pour gérer l'état global :
- `authStore` : Authentification
- `moviesStore` : Catalogue
- `watchlistStore` : Watchlist utilisateur
- etc.

---

## 📦 Structure Monorepo

```
apps/
├── backend/          # API Node.js
└── frontend/         # Application Nuxt.js
```

**Avantages** :
- Partage de types (TypeScript)
- Versions synchronisées
- Déploiement unifié
- DX améliorée

---

## 🔐 Sécurité

### Authentification

- **JWT** pour l'authentification stateless
- **Access Token** (1h) + **Refresh Token** (7j)
- Stockage : localStorage (tokens), httpOnly cookie (optionnel)

### Authorization

Système de **rôles** :
- `user` : Accès basique
- `premium` : Visionnage vidéos
- `admin` : CRUD films/users
- `super_admin` : Tous les droits

### Protection

- **Middleware authenticate** : Vérifie le JWT
- **Middleware requireAdmin** : Vérifie le rôle
- **CORS** : Configuré pour autoriser le frontend
- **Validation** : Côté backend (params, body)
- **SQL Injection** : Requêtes paramétrées
- **XSS** : Sanitization des inputs

---

## 🗄️ Base de Données

### Modèle Relationnel

```sql
users
  ├─── favorites (many-to-many avec movies)
  ├─── watchlist (many-to-many avec movies + status)
  ├─── reviews (many-to-many avec movies + rating/comment)
  └─── viewing_history (tracking)

movies
  ├─── movie_categories (many-to-many avec categories)
  ├─── reviews
  ├─── favorites
  ├─── watchlist
  └─── viewing_history

categories
  └─── movie_categories
```

### Triggers

- **update_movie_rating_trigger** : Recalcule automatiquement la moyenne communautaire quand un avis est ajouté/modifié/supprimé

---

## 🔄 Flux de Données

### 1. Authentification

```
User (Frontend)
  → POST /api/auth/register
  → Backend: Hash password + Create user
  → Return: { user, accessToken, refreshToken }
  → Frontend: Store tokens + Set user in store
  → Redirect to /
```

### 2. Récupération de Films

```
User (Frontend)
  → GET /api/movies?category=action&min_rating=7
  → Backend: 
      - Validate query params
      - Repository: Build SQL with filters
      - Return paginated results
  → Frontend: Update moviesStore
  → Render grid
```

### 3. Ajout Watchlist

```
User (Authenticated)
  → POST /api/watchlist { movieId, status: 'to_watch' }
  → Backend:
      - Verify JWT (middleware)
      - Check movie exists
      - Insert/Update watchlist entry
      - Return updated watchlist
  → Frontend: Update watchlistStore
  → UI reflects change
```

---

## 🚀 Performance

### Backend

- **Pagination** : Limite 20 résultats par défaut
- **Indexation DB** : Sur colonnes fréquemment recherchées
- **SQL optimisé** : Pas de N+1 queries
- **Async/Await** : Non-blocking I/O

### Frontend

- **SSR** : Rendu serveur pour SEO + First Paint rapide
- **Code Splitting** : Nuxt auto-split par route
- **Lazy Loading** : Composants et images chargés à la demande
- **Infinite Scroll** : Pagination fluide sans rechargement

---

## 📊 Monitoring (À venir)

- **Logs** : Winston pour logs structurés
- **Erreurs** : Sentry pour tracking
- **Métriques** : Prometheus/Grafana
- **Health Checks** : Endpoints `/health`

---

## 🔗 Intégrations Externes

### TMDB API

- **Usage** : Import automatique de films
- **Données** : Métadonnées, posters, backdrops, trailers
- **Rate Limit** : Respecté via throttling

### Future

- **Stripe** : Abonnement premium (potentiel)
- **SendGrid** : Emails transactionnels
- **Cloudinary** : Hébergement images (optionnel)

---

## 🧪 Testabilité

### Backend

- **Unit Tests** : Services & Repositories mockés
- **Integration Tests** : Routes + DB en mémoire
- **Vitest** : Fast, compatible ES modules

### Frontend

- **Component Tests** : Vue Test Utils
- **Store Tests** : Pinia testable
- **E2E Tests** : Playwright (à venir)

---

## 🐳 Déploiement

### Development

```bash
# Local avec hot-reload
npm run dev
```

### Production

```bash
# Docker Compose
docker-compose up -d

# Ou séparé
npm run build
npm start
```

### Infrastructure

- **Serveur** : VPS Linux
- **Reverse Proxy** : Caddy (HTTPS auto)
- **CI/CD** : GitHub Actions
- **Monitoring** : À définir

---

## 📈 Scalabilité (Future)

### Horizontal Scaling

- **Load Balancer** : Nginx/Caddy
- **Multiple instances** : PM2 cluster mode
- **Session** : Redis pour shared sessions

### Vertical Scaling

- **DB** : PostgreSQL peut scale jusqu'à plusieurs TB
- **Cache** : Redis pour queries fréquentes
- **CDN** : Pour assets statiques

---

## 🔧 Outils de Développement

- **Nodemon** : Auto-reload backend
- **ESLint** : Linting code
- **Prettier** : Formatage (optionnel)
- **Vitest** : Tests rapides
- **Postman/Thunder Client** : Test API

---

[← Retour au README](../README.md) | [Backend Overview →](./backend/README.md)
