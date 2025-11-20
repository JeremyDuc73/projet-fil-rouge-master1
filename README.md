# 🎬 CineZone - Plateforme de Gestion de Films

> Application full-stack moderne pour découvrir, noter et gérer sa collection de films

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()
[![Coverage](https://img.shields.io/badge/coverage-80%25-green.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

---

## 📖 À Propos

CineZone est une plateforme complète de gestion de films qui permet aux utilisateurs de :

- 🔍 **Découvrir** des milliers de films (via TMDB)
- ⭐ **Noter** et commenter les films
- 💾 **Organiser** sa watchlist avec différents statuts
- 📊 **Suivre** son historique de visionnage
- 🎭 **Filtrer** par catégories, notes, et plus encore

### Fonctionnalités Principales

#### 🎯 Parcours Public
- Catalogue complet avec filtres multi-critères
- Recherche avancée et tri
- Pagination / Infinite scroll
- Détails des films avec bande-annonce

#### 👤 Espace Membre
- Système d'authentification JWT
- Profil personnalisable
- Favoris et watchlist avec statuts (à voir, vu, abandonné)
- Historique de visionnage
- Gestion des notes et avis

#### 🛡️ Administration
- CRUD complet des films
- Gestion des utilisateurs et rôles
- Import automatique depuis TMDB
- Tableaux de bord et statistiques

---

## 🛠️ Stack Technique

### Backend
- **Runtime** : Node.js 23.x
- **Framework** : Express 5.x
- **Base de données** : PostgreSQL 16
- **ORM** : SQL natif (pas d'ORM)
- **Auth** : JWT (access + refresh tokens)
- **Upload** : Multer
- **Validation** : Custom + constraints DB
- **API externe** : TMDB API

### Frontend
- **Framework** : Nuxt.js 3.x (Vue 3)
- **State Management** : Pinia
- **Styling** : TailwindCSS 4.x
- **Components** : Nuxt UI + shadcn/ui
- **Icons** : Phosphor Icons
- **Forms** : VeeValidate + Zod
- **HTTP Client** : $fetch (Nuxt)

### DevOps & Qualité
- **Tests** : Vitest + Supertest + Playwright
- **Linting** : ESLint
- **Containerisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions
- **Reverse Proxy** : Caddy
- **Monitoring** : (À venir)

---

## 🚀 Quick Start

### 🐳 Option 1 : Docker (Recommandé)

**Prérequis** : Docker & Docker Compose >= 2.0

```bash
# 1. Cloner le repository
git clone https://github.com/username/cinezone.git
cd cinezone

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec votre TMDB_API_KEY et JWT secrets

# 3. Lancer avec Docker Compose
docker compose up -d

# 4. Accéder à l'application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# PostgreSQL: localhost:5434
```

✅ **Tout est automatique** : DB, schema, seed catégories, import TMDB !

---

### 💻 Option 2 : Développement Local

**Prérequis** : Node.js >= 20.x, PostgreSQL >= 14, pnpm

```bash
# 1. Cloner et installer
git clone https://github.com/username/cinezone.git
cd cinezone
pnpm install

# 2. Setup Backend
cd apps/backend
cp .env.example .env
# Modifier .env avec vos credentials
npm run db:init
npm run db:seed:tmdb

# 3. Lancer en développement (2 terminaux)
# Terminal 1 - Backend
cd apps/backend && npm run dev

# Terminal 2 - Frontend
cd apps/frontend && npm run dev
```

Ouvrez http://localhost:3000

### Variables d'Environnement

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinezone_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
TMDB_API_KEY=your_tmdb_key
```

#### Frontend (.env)
```env
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

---

## 📚 Documentation

### 📖 Guides Généraux
- [Architecture du Projet](./docs/architecture.md)
- [Guide de Contribution](./docs/contributing.md)
- [Getting Started Complet](./docs/getting-started.md)

### 🔧 Backend
- [📘 Backend Overview](./docs/backend/README.md)
- [📡 API Reference](./docs/backend/api-reference.md)
- [🗄️ Base de Données](./docs/backend/database.md)
- [⚙️ Services & Logique Métier](./docs/backend/services.md)

### 🎨 Frontend
- [📘 Frontend Overview](./docs/frontend/README.md)
- [🧩 Composants](./docs/frontend/components.md)
- [📦 Stores Pinia](./docs/frontend/stores.md)
- [📄 Pages & Routing](./docs/frontend/pages.md)

### 🧪 Tests
- [📋 Vue d'Ensemble des Tests](./docs/testing/README.md)
- [🔬 Tests Unitaires](./docs/testing/unit-tests.md)
- [🔗 Tests d'Intégration](./docs/testing/integration-tests.md)
- [🎭 Tests E2E](./docs/testing/e2e-tests.md) *(À venir)*

### 🚢 Déploiement
- [🐳 Docker](./docs/deployment/docker.md) *(À venir)*
- [⚡ CI/CD](./docs/deployment/ci-cd.md) *(À venir)*
- [🌍 Production](./docs/deployment/production.md) *(À venir)*

---

## 🧪 Tests

### Lancer les tests

```bash
# Backend
cd apps/backend
npm test                    # Tous les tests
npm run test:watch          # Mode watch
npm run test:coverage       # Avec couverture
npm run test:unit           # Unitaires seulement
npm run test:integration    # Intégration seulement

# Frontend
cd apps/frontend
npm test                    # Tous les tests
npm run test:watch          # Mode watch
npm run test:ui             # Interface graphique
```

### Couverture Actuelle

- **Backend** : 28/28 tests ✅ (~80% coverage)
- **Frontend** : 9/9 tests ✅

---

## 📦 Structure du Projet

```
projet-fil-rouge-master1/
├── apps/
│   ├── backend/              # API Node.js + Express
│   │   ├── src/
│   │   │   ├── controllers/  # Gestion des requêtes HTTP
│   │   │   ├── services/     # Logique métier
│   │   │   ├── repositories/ # Accès données
│   │   │   ├── middlewares/  # Auth, validation, errors
│   │   │   ├── routes/       # Définition des routes
│   │   │   ├── utils/        # Helpers
│   │   │   └── config/       # Configuration
│   │   ├── tests/            # Tests Vitest
│   │   ├── database/         # Schéma + migrations
│   │   └── uploads/          # Fichiers uploadés
│   │
│   └── frontend/             # Application Nuxt.js
│       ├── app/
│       │   ├── pages/        # Routes & pages
│       │   ├── components/   # Composants Vue
│       │   ├── stores/       # Stores Pinia
│       │   ├── composables/  # Logique réutilisable
│       │   ├── middleware/   # Route guards
│       │   └── utils/        # Helpers
│       └── tests/            # Tests Vitest
│
├── docs/                     # Documentation complète
├── .github/                  # CI/CD workflows
└── docker/                   # Configuration Docker
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](./docs/contributing.md) pour plus d'informations.

### Workflow

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Roadmap

- [x] Architecture backend & frontend
- [x] Authentification JWT
- [x] CRUD films & catégories
- [x] Watchlist avec statuts
- [x] Tests unitaires & intégration
- [ ] Docker & Docker Compose
- [ ] CI/CD (GitHub Actions)
- [ ] Déploiement production
- [ ] Monitoring & Logs
- [ ] Rate limiting & sécurité avancée
- [ ] Cache Redis (optionnel)

---

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus d'informations.

---

## 👤 Auteur

**Jeremy Duc**

- 🌐 Website: [jeremyduc.dev](https://jeremyduc.dev)
- 🚀 Production: [cinezone.jeremyduc.dev](https://cinezone.jeremyduc.dev)

---

## 🙏 Remerciements

- [TMDB](https://www.themoviedb.org/) pour l'API de films
- [Nuxt.js](https://nuxt.com/) pour le framework frontend
- [TailwindCSS](https://tailwindcss.com/) pour le styling
- Tous les contributeurs open-source

---

**⭐ N'oubliez pas de mettre une étoile si ce projet vous plaît !**
