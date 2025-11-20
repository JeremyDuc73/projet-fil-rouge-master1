# 🐳 Docker - Conteneurisation Complète

## 📦 Architecture

```
┌──────────────────────────────────────────────┐
│           Docker Compose Stack               │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────┐│
│  │  Frontend  │  │  Backend   │  │Postgres││
│  │  (Nuxt)    │→ │  (Express) │→ │   DB   ││
│  │  :3000     │  │  :3001     │  │ :5432  ││
│  └────────────┘  └────────────┘  └────────┘│
│                                              │
│         cinezone-network (bridge)            │
└──────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prérequis

- Docker >= 20.10
- Docker Compose >= 2.0

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/username/cinezone.git
cd cinezone

# 2. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (JWT secrets, TMDB key, etc.)

# 3. Lancer tout le stack
docker-compose up -d

# 4. Attendre que tout soit prêt (health checks)
docker-compose ps

# 5. Accéder à l'application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

---

## 📝 Configuration

### Variables d'Environnement

Fichier `.env` à la racine :

```env
# Database
DB_NAME=cinezone_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_PORT=5432

# JWT (IMPORTANT: Changer en production!)
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# TMDB API
TMDB_API_KEY=your_tmdb_api_key

# Frontend
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

### Personnalisation Ports

Modifier dans `docker-compose.yml` :

```yaml
services:
  frontend:
    ports:
      - "8080:3000"  # Changer 8080 par le port souhaité
```

---

## 🏗️ Dockerfiles Expliqués

### Backend (`apps/backend/Dockerfile`)

**Multi-stage build** pour optimiser la taille :

```dockerfile
# Stage 1: Dependencies
FROM node:23-alpine AS deps
# Installation des dépendances

# Stage 2: Production
FROM node:23-alpine AS runner
# Image finale légère avec uniquement le nécessaire
# Non-root user pour la sécurité
# Health check intégré
```

**Optimisations** :
- ✅ Alpine Linux (image ~5x plus petite)
- ✅ User non-root (sécurité)
- ✅ Dumb-init (gestion signaux propre)
- ✅ Health checks (monitoring)

### Frontend (`apps/frontend/Dockerfile`)

**3 stages** :

```dockerfile
# Stage 1: Dependencies
# Stage 2: Builder (build Nuxt)
# Stage 3: Production (runtime optimisé)
```

**Résultat** : Image finale ~150MB au lieu de 1GB+

---

## 📊 Commandes Utiles

### Gestion du Stack

```bash
# Démarrer tout
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service
docker-compose logs -f backend

# Arrêter tout
docker-compose down

# Arrêter + supprimer volumes (⚠️ perte données)
docker-compose down -v

# Rebuild les images
docker-compose build

# Rebuild sans cache
docker-compose build --no-cache
```

### État des Services

```bash
# Status
docker-compose ps

# Health checks
docker inspect --format='{{.State.Health.Status}}' cinezone-backend

# Statistiques resources
docker stats
```

### Accéder aux Conteneurs

```bash
# Shell dans le backend
docker exec -it cinezone-backend sh

# Shell dans postgres
docker exec -it cinezone-postgres psql -U postgres -d cinezone_db

# Voir les processus
docker-compose top
```

---

## 🗄️ Volumes & Persistance

### Volumes Définis

```yaml
volumes:
  postgres_data:        # Données PostgreSQL
  ./apps/backend/uploads  # Fichiers uploadés (bind mount)
```

### Backup Base de Données

```bash
# Backup
docker exec cinezone-postgres pg_dump -U postgres cinezone_db > backup.sql

# Restore
docker exec -i cinezone-postgres psql -U postgres cinezone_db < backup.sql
```

---

## 🔍 Debugging

### Les Logs

```bash
# Tous les services
docker-compose logs -f

# Dernières 100 lignes
docker-compose logs --tail=100

# Depuis une date
docker-compose logs --since 2024-01-01
```

### Problèmes Courants

**1. Port déjà utilisé**
```bash
# Vérifier les ports
lsof -i :3000
lsof -i :3001

# Solution: Changer le port dans docker-compose.yml
```

**2. Erreur de connexion DB**
```bash
# Vérifier que postgres est prêt
docker-compose ps postgres

# Voir les logs postgres
docker-compose logs postgres
```

**3. Build échoue**
```bash
# Rebuild sans cache
docker-compose build --no-cache

# Nettoyer Docker
docker system prune -a
```

---

## 🚀 Production

### Build Optimisé

```bash
# Build avec optimisations
docker-compose -f docker-compose.yml build

# Tag pour registry
docker tag cinezone-frontend:latest registry.example.com/cinezone-frontend:v1.0
docker tag cinezone-backend:latest registry.example.com/cinezone-backend:v1.0

# Push vers registry
docker push registry.example.com/cinezone-frontend:v1.0
docker push registry.example.com/cinezone-backend:v1.0
```

### Variables Production

Fichier `.env.production` :

```env
NODE_ENV=production
DB_PASSWORD=strong_random_password
JWT_SECRET=strong_random_jwt_secret
NUXT_PUBLIC_API_BASE=https://cinezone.jeremyduc.dev/api
```

---

## 📦 Taille des Images

| Service | Taille |
|---------|--------|
| Backend | ~150 MB |
| Frontend | ~200 MB |
| Postgres | ~230 MB |
| **Total** | **~580 MB** |

---

## 🔒 Sécurité

### Bonnes Pratiques Appliquées

- ✅ **Non-root user** dans les conteneurs
- ✅ **Multi-stage builds** (pas de secrets dans layers)
- ✅ **Health checks** pour monitoring
- ✅ **Variables d'environnement** pour secrets (pas dans Dockerfiles)
- ✅ **Alpine Linux** (surface d'attaque réduite)
- ✅ **Read-only filesystem** (sauf volumes nécessaires)

### Recommandations Production

```bash
# Scanner les vulnérabilités
docker scan cinezone-backend
docker scan cinezone-frontend

# Limiter les resources
docker-compose.yml:
  services:
    backend:
      deploy:
        resources:
          limits:
            cpus: '1'
            memory: 512M
```

---

## 📚 Ressources

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

[← Deployment](./README.md) | [CI/CD →](./ci-cd.md)
