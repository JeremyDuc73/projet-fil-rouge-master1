# 🎬 CineZone - Plateforme de Gestion de Films

> Application full-stack moderne pour découvrir, noter et gérer sa collection de films
> 
---

## 📖 À Propos

CineZone est une plateforme complète de gestion de films qui permet aux utilisateurs de :

- 🔍 **Découvrir** de nombreux films (via TMDB)
- ⭐ **Noter** et commenter les films
- 💾 **Organiser** sa watchlist avec différents statuts
- 📊 **Suivre** son historique de visionnage
- 🎭 **Filtrer** par catégories, notes, et plus encore

### Fonctionnalités Principales

#### 🎯 Parcours Public
- Catalogue complet avec filtres multi-critères
- Recherche avancée et tri
- Pagination / Infinite scroll

#### 👤 Espace Membre
- Système d'authentification JWT
- Profil
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
- **Runtime** : Node.js
- **Framework** : Express
- **Base de données** : PostgreSQL
- **ORM** : SQL natif (pas d'ORM)
- **Auth** : JWT (access + refresh tokens)
- **Upload** : Multer
- **Validation** : Custom + constraints DB
- **API externe** : TMDB API

### Frontend
- **Framework** : Nuxt.js
- **State Management** : Pinia
- **Styling** : TailwindCSS
- **Components** : Nuxt UI + shadcn/ui
- **Icons** : Phosphor Icons
- **Forms** : VeeValidate + Zod
- **HTTP Client** : $fetch (Nuxt)

### DevOps & Qualité
- **Tests** : Vitest
- **Containerisation** : Docker
- **CI/CD** : GitHub Actions
- **Reverse Proxy** : Caddy

---

## 📚 Documentation

### 📖 Général
- [Architecture du Projet](./docs/architecture.md)

### 🔧 Backend
- [📘 Backend Overview](./docs/backend/README.md)
- [📡 API Reference](./docs/backend/api-reference.md)
- [🗄️ Base de Données](./docs/backend/database.md)

### 🎨 Frontend
- [📘 Frontend Overview](./docs/frontend/README.md)

### 🧪 Tests
- [📋 Vue d'Ensemble des Tests](./docs/testing/README.md)

### 🚢 Déploiement
- [⚡ CI/CD](./docs/deployment/ci-cd.md)

---

## 👤 Auteur

**Jérémy Duc**

- 🌐 Website: [jeremyduc.dev](https://jeremyduc.dev)
- 🚀 Production: [cinezone.jeremyduc.dev](https://cinezone.jeremyduc.dev)

---