# 📘 Backend - Vue d'Ensemble

## 🎯 Description

API REST Node.js/Express fournissant tous les endpoints pour l'application CineZone.

## 🛠️ Stack Technique

- **Runtime** : Node.js 23.x
- **Framework** : Express 5.x
- **Database** : PostgreSQL 16
- **Auth** : JSON Web Tokens (JWT)
- **File Upload** : Multer
- **Tests** : Vitest + Supertest
- **Validation** : Contraintes DB + validation manuelle

---

## 📁 Structure

```
src/
├── config/              # Configuration (DB, JWT, etc.)
├── controllers/         # Gestion des requêtes HTTP
├── services/            # Logique métier
├── repositories/        # Accès aux données (SQL)
├── middlewares/         # Auth, validation, errors
├── routes/              # Définition des routes
├── utils/               # Helpers et constantes
├── app.js              # Configuration Express
├── server.js           # Point d'entrée
└── db.js               # Connexion PostgreSQL
```

---

## 🚀 Démarrage Rapide

### Installation

```bash
cd apps/backend
npm install
```

### Configuration

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

### Base de Données

```bash
# Initialiser la DB
npm run db:init

# Ou manuellement
psql -U postgres
CREATE DATABASE cinezone_db;
\c cinezone_db
\i database/schema.sql
\i database/seed.sql  # Optionnel
```

### Lancement

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

L'API sera disponible sur `http://localhost:3001`

---

## 📡 Routes Principales

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| **AUTH** |
| POST | `/api/auth/register` | ❌ | Inscription |
| POST | `/api/auth/login` | ❌ | Connexion |
| POST | `/api/auth/refresh` | ❌ | Rafraîchir token |
| GET | `/api/auth/me` | ✅ | Profil utilisateur |
| **MOVIES** |
| GET | `/api/movies` | ❌ | Liste des films (filtres) |
| GET | `/api/movies/:id` | ❌ | Détails d'un film |
| POST | `/api/movies` | 🛡️ Admin | Créer un film |
| PUT | `/api/movies/:id` | 🛡️ Admin | Modifier un film |
| DELETE | `/api/movies/:id` | 🛡️ Admin | Supprimer un film |
| **WATCHLIST** |
| GET | `/api/watchlist` | ✅ | Ma watchlist |
| POST | `/api/watchlist` | ✅ | Ajouter à la watchlist |
| PATCH | `/api/watchlist/:id/status` | ✅ | Changer statut |
| DELETE | `/api/watchlist/:id` | ✅ | Retirer de la watchlist |
| **FAVORITES** |
| GET | `/api/favorites` | ✅ | Mes favoris |
| POST | `/api/favorites` | ✅ | Ajouter aux favoris |
| DELETE | `/api/favorites/:id` | ✅ | Retirer des favoris |
| **REVIEWS** |
| GET | `/api/movies/:id/reviews` | ❌ | Avis d'un film |
| POST | `/api/reviews` | ✅ | Créer un avis |
| PUT | `/api/reviews/:id` | ✅ | Modifier son avis |
| DELETE | `/api/reviews/:id` | ✅ | Supprimer son avis |

Voir [API Reference](./api-reference.md) pour la documentation complète.

---

## 🔐 Authentification

### Flow JWT

1. **Login** → Retourne `accessToken` + `refreshToken`
2. **Requêtes** → Header `Authorization: Bearer <accessToken>`
3. **Token expiré** → Utiliser `refreshToken` pour obtenir un nouveau `accessToken`

### Middleware

```javascript
// Protéger une route
router.get('/protected', authenticate, (req, res) => {
  // req.user contient les infos du user
})

// Protéger admin
router.delete('/admin-only', authenticate, requireAdmin, (req, res) => {
  // req.user.role === 'admin' || 'super_admin'
})
```

---

## 🗄️ Base de Données

Voir [Database Schema](./database.md) pour le schéma complet.

### Connexion

```javascript
import { query } from './db.js'

const result = await query('SELECT * FROM users WHERE id = $1', [userId])
```

### Transactions

```javascript
await query('BEGIN')
try {
  await query('INSERT INTO ...')
  await query('UPDATE ...')
  await query('COMMIT')
} catch (error) {
  await query('ROLLBACK')
  throw error
}
```

---

## ⚙️ Services

Voir [Services Documentation](./services.md) pour la logique métier.

**Pattern** :
- Services = Logique métier pure
- Pas d'accès direct à req/res
- Testable unitairement
- Retourne des données ou throw des erreurs

```javascript
// Exemple
class MovieService {
  async getMovieById(id) {
    const movie = await movieRepository.findById(id)
    if (!movie) {
      throw new NotFoundError('Movie not found')
    }
    return movie
  }
}
```

---

## 🧪 Tests

### Lancer les tests

```bash
npm test                    # Tous les tests
npm run test:watch          # Mode watch
npm run test:coverage       # Avec couverture
npm run test:unit           # Unitaires seulement
npm run test:integration    # Intégration seulement
```

### Structure

```
tests/
├── setup.js                # Config globale
├── helpers/
│   ├── db.helper.js       # Mocks DB
│   └── factories.js       # Générateurs données test
├── unit/
│   ├── services/          # Tests services
│   └── repositories/      # Tests repositories
└── integration/
    └── *.routes.test.js   # Tests API complètes
```

Voir [Testing Documentation](../testing/unit-tests.md) pour plus de détails.

---

## 📝 Conventions de Code

### Nommage

- **camelCase** : Variables, fonctions
- **PascalCase** : Classes
- **UPPER_CASE** : Constantes

### Structure d'un Controller

```javascript
export const getMovies = asyncHandler(async (req, res) => {
  // 1. Validation des paramètres
  const { page, limit, category } = req.query
  
  // 2. Appel au service
  const result = await movieService.getMovies({ page, limit, category })
  
  // 3. Réponse
  res.json({
    success: true,
    data: result
  })
})
```

### Gestion des Erreurs

```javascript
// Dans un service
throw new ValidationError('Invalid email')
throw new UnauthorizedError('Invalid credentials')
throw new NotFoundError('Movie not found')

// Middleware errorHandler les catch automatiquement
```

---

## 🔧 Configuration

### Variables d'Environnement

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinezone_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# TMDB
TMDB_API_KEY=your_tmdb_api_key

# Bcrypt
BCRYPT_SALT_ROUNDS=10
```

---

## 📊 Logs & Monitoring

### Logs (Console en dev)

```javascript
console.log('Info:', data)
console.error('Error:', error)
```

### Health Check

```
GET /health
```

**À venir** : Winston pour logs structurés, Sentry pour tracking erreurs.

---

## 🚀 Déploiement

### Build

```bash
# Aucun build nécessaire (Node.js)
npm install --production
```

### Start

```bash
NODE_ENV=production npm start
```

### Docker

```dockerfile
FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Voir [Docker Documentation](../deployment/docker.md) pour plus de détails.

---

## 📚 Ressources

- [API Reference](./api-reference.md)
- [Database Schema](./database.md)
- [Services Documentation](./services.md)
- [← Retour](../../README.md)
