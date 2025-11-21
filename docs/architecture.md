# 🏗️ Architecture du Projet

## Vue d'Ensemble

CineZone est une application full-stack moderne suivant une architecture **API REST** avec séparation frontend/backend.

```
┌─────────────────────────────────────────────────────────┐
│                     UTILISATEUR                          │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   Nuxt.js Frontend   │  
         │   (SSR + SPA)        │
         └───────────┬──────────┘
                     │
              HTTP/REST API
                     │
         ┌───────────▼──────────┐
         │   Express Backend    │
         │   (Node.js API)      │
         └───────────┬──────────┘
                     │
              SQL Queries
                     │
         ┌───────────▼──────────┐
         │   PostgreSQL DB      │
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
- Stockage : localStorage (tokens)

### Authorization

Système de **rôles** :
- `user` : Accès basique
- `premium` : Fonctionnalités en beta
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

## 🔗 Intégrations Externes

### TMDB API

- **Usage** : Import automatique de films
- **Données** : Métadonnées, posters, backdrops, trailers
- **Rate Limit** : Respecté via throttling

---

## 🧪 Testabilité

### Backend

- **Unit Tests** : Services & Repositories mockés
- **Integration Tests** : Routes + DB en mémoire
- **Vitest** : Fast, compatible ES modules

### Frontend

- **Component Tests** : Vue Test Utils
- **Store Tests** : Pinia testable

---

## 🐳 Déploiement

### Infrastructure

- **Serveur** : VPS Linux
- **Reverse Proxy** : Caddy (HTTPS auto)
- **CI/CD** : GitHub Actions

---

[← Retour au README](../README.md) | [Backend Overview →](./backend/README.md)
