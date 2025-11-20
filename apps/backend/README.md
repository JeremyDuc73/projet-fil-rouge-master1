# CineZone Backend API

API REST pour l'application CineZone - Gestion de catalogue de films avec authentification et espace membre.

## Architecture

### Structure en couches

```
src/
├── config/           # Configuration centralisée
├── controllers/      # Contrôleurs (logique des requêtes/réponses)
├── services/         # Logique métier
├── repositories/     # Accès aux données (SQL)
├── routes/           # Définition des routes
├── middlewares/      # Middlewares Express
├── utils/            # Utilitaires (errors, logger, constants)
├── app.js            # Configuration Express
├── server.js         # Point d'entrée
└── db.js             # Pool PostgreSQL
```

### Flux de données

```
Request → Route → Controller → Service → Repository → Database
                                   ↓
Response ← Controller ← Service ← Repository
```

## Installation

```bash
# Installer les dépendances
npm install
# ou avec pnpm (recommandé)
pnpm install

# Créer les dossiers nécessaires
mkdir -p uploads/posters

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la base de données
npm run db:init

# Démarrer en développement
npm run dev

# Démarrer en production
npm start
```

## Scripts disponibles

- `npm run dev` - Démarrage avec nodemon (hot reload)
- `npm start` - Démarrage production
- `npm run db:init` - Initialisation BDD (schéma + seed)
- `npm run db:migrate` - Migration BDD (ajoute TMDB support à une DB existante)
- `npm run db:seed:tmdb` - Import 100 films tendance depuis TMDB
- `npm run db:reset:tmdb` - Reset films + import TMDB

## API Endpoints

### Health Check
- `GET /health` - Vérifier le statut de l'API

### Categories
- `GET /api/categories` - Liste toutes les catégories
- `GET /api/categories/:id` - Détail d'une catégorie
- `POST /api/categories` - Créer une catégorie (admin)
- `PUT /api/categories/:id` - Modifier une catégorie (admin)
- `DELETE /api/categories/:id` - Supprimer une catégorie (admin)

## Base de données

### Tables principales

- **users** - Utilisateurs (avec rôles)
- **movies** - Films
- **categories** - Catégories de films
- **movie_categories** - Liaison films ↔ catégories
- **ratings** - Notes et avis
- **watchlist** - Liste à regarder
- **favorites** - Favoris
- **viewing_history** - Historique de visionnage

### Triggers automatiques

- Calcul automatique de `average_rating` sur les films
- Mise à jour des timestamps `updated_at`

## Développement

### Ajouter une nouvelle ressource

1. **Repository** : Créer `src/repositories/resourceRepository.js`
2. **Service** : Créer `src/services/resourceService.js`
3. **Controller** : Créer `src/controllers/resourceController.js`
4. **Routes** : Créer `src/routes/resourceRoutes.js`
5. **Intégration** : Importer dans `src/routes/index.js`

### Exemple d'erreur personnalisée

```javascript
import { NotFoundError } from '../utils/errors.js';

throw new NotFoundError('Movie');
```

### Logger

```javascript
import { logger } from '../utils/logger.js';

logger.info('Message info');
logger.error('Message erreur', { error: err });
```

## Variables d'environnement

Voir `.env.example` pour la liste complète.

## 🎬 Import TMDB

### Configuration

Ajoutez vos clés TMDB dans `.env` :

```env
TMDB_API_KEY=votre_clé_api
TMDB_ACCESS_TOKEN=votre_token  # Optionnel
```

> Obtenez vos clés sur : https://www.themoviedb.org/settings/api

### Utilisation

**Option 1 : Init complète avec TMDB**
```bash
npm run db:init -- --tmdb
# Crée tables + catégories + utilisateurs + 100 films TMDB
```

**Option 2 : Ajouter TMDB à une DB existante**
```bash
npm run db:migrate      # Ajoute tmdb_id + movie_images
npm run db:seed:tmdb    # Importe 100 films
```

**Option 3 : Reset complet**
```bash
npm run db:reset:tmdb   # Supprime tous les films + réimporte TMDB
```

### Ce qui est importé

Pour chaque film :
- ✅ Titre et description (français)
- ✅ Date de sortie, durée
- ✅ Poster et backdrop
- ✅ **Note TMDB** (convertie 0-10 → 0-5)
- ✅ **Galerie de 10 images** HD
- ✅ Catégories mappées automatiquement
- ✅ Films **tendance de la semaine** (pas toujours les mêmes)

### Structure BDD

```sql
-- Colonne ajoutée à movies
tmdb_id INTEGER UNIQUE

-- Nouvelle table
CREATE TABLE movie_images (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id),
    image_url VARCHAR(500),
    image_type VARCHAR(20) DEFAULT 'backdrop',
    display_order INTEGER DEFAULT 0
);
```

### API Response

```json
GET /api/movies/:id
{
  "id": 1,
  "title": "Dune: Part Two",
  "average_rating": 4.1,  // ← Note TMDB !
  "gallery": [            // ← Galerie !
    { "id": 1, "url": "...", "type": "backdrop" },
    { "id": 2, "url": "...", "type": "backdrop" }
  ]
}
```

## 🔧 Interface Admin (TODO)

L'API admin est déjà fonctionnelle :

```bash
# Créer un film manuellement
POST /api/movies
Authorization: Bearer <admin_token>
{
  "title": "Mon Film",
  "description": "...",
  "categoryIds": [1, 2]
}
```

L'interface frontend admin reste à créer (dashboard, formulaires, upload).

## Prochaines étapes

- [x] Authentification JWT ✅
- [x] CRUD Movies ✅
- [x] Import TMDB ✅
- [ ] Interface Admin (dashboard + formulaires)
- [ ] Ratings & Watchlist
- [ ] Tests unitaires & E2E
