# 📘 Backend - Vue d'Ensemble

## 🎯 Description

API REST Node.js/Express fournissant tous les endpoints pour l'application CineZone.

## 🛠️ Stack Technique

- **Runtime** : Node.js 
- **Framework** : Express
- **Database** : PostgreSQL
- **Auth** : JSON Web Tokens (JWT)
- **File Upload** : Multer
- **Tests** : Vitest
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

---

## ⚙️ Services

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

## 📚 Ressources

- [API Reference](./api-reference.md)
- [Database Schema](./database.md)
- [← Retour](../../README.md)
