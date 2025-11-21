# ⚡ CI/CD - GitHub Actions

Pipeline d'intégration et déploiement continu automatisé pour CineZone.

---

## 📋 Vue d'Ensemble

Le pipeline CI/CD est configuré avec **GitHub Actions** et se compose de deux jobs principaux :
1. **Tests** - Exécutés sur chaque push/PR
2. **Deploy** - Déploiement automatique sur VPS (branche `master` uniquement)

---

## 🔄 Workflow Complet

### Déclencheurs

```yaml
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
```

**Quand le workflow se lance** :
- ✅ Push sur `master` → Tests + Déploiement
- ✅ Pull Request → Tests uniquement
- ✅ Push sur autre branche → Rien (sécurité)

---

## 🧪 Job 1 : Tests

### Services

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_DB: cinezone_test_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**PostgreSQL** est démarré comme service Docker pour les tests d'intégration backend.

### Étapes Backend

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '23'

- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 10

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Initialize test database
  working-directory: apps/backend
  env:
    NODE_ENV: test
    DB_HOST: localhost
    DB_PORT: 5432
    DB_NAME: cinezone_test_db
    DB_USER: postgres
    DB_PASSWORD: postgres
  run: node scripts/initDb.js

- name: Run backend tests
  working-directory: apps/backend
  run: pnpm test
```

**Tests backend** :
- ✅ 28 tests unitaires + intégration
- ✅ Base de données de test isolée

### Étapes Frontend

```yaml
- name: Run frontend tests
  working-directory: apps/frontend
  run: pnpm test
```

**Tests frontend** :
- ✅ 9 tests (stores, composables)
- ✅ Pas de dépendances externes

---

## 🚀 Job 2 : Deploy

### Conditions

```yaml
deploy:
  needs: tests                                    # Attend que les tests passent
  if: github.ref == 'refs/heads/master'          # Seulement sur master
  runs-on: ubuntu-latest
  environment: production
```

**Le déploiement ne se lance QUE si** :
- ✅ Les tests sont verts
- ✅ Le push est sur `master`
- ✅ Pas de PR (push direct ou merge)

### Étapes de Déploiement

#### 1. Connexion SSH au VPS

```yaml
- name: Deploy to VPS
  uses: appleboy/ssh-action@v1.2.0
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    key: ${{ secrets.VPS_SSH_KEY }}
    port: ${{ secrets.VPS_PORT }}
    script: |
      cd /var/www/projet-fil-rouge-master1
      bash scripts/deploy.sh
```

**Secrets GitHub requis** :
- `VPS_HOST` - IP ou domaine du serveur
- `VPS_USER` - Utilisateur SSH (ex: `root` ou `deploy`)
- `VPS_SSH_KEY` - Clé privée SSH (format PEM)
- `VPS_PORT` - Port SSH (généralement `22`)

#### 2. Script de Déploiement (`scripts/deploy.sh`)

**Le script exécute automatiquement** :

```bash
#!/bin/bash
set -e

# 1. Pull du code
git pull origin master

# 2. Charger variables d'environnement
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# 3. Backup base de données
mkdir -p backups
docker exec cinezone-postgres pg_dump -U $DB_USER $DB_NAME | \
  gzip > backups/db_backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 4. Build nouvelles images Docker
docker compose -f docker-compose.prod.yml build --no-cache --pull

# 5. Arrêt des anciens conteneurs
docker compose -f docker-compose.prod.yml down

# 6. Démarrage des nouveaux conteneurs
docker compose -f docker-compose.prod.yml up -d

# 7. Vérification santé
sleep 10
docker compose -f docker-compose.prod.yml ps

# 8. Nettoyage images inutilisées
docker image prune -f

echo "✅ Deployment completed!"
```

**Caractéristiques** :
- 🔄 Zero-downtime
- 💾 Backup automatique avant déploiement
- 🧹 Nettoyage automatique des vieilles images

---


## 📊 Monitoring du Pipeline

### Dashboard GitHub Actions

- **Actions** → Voir tous les runs

### Logs Détaillés

Chaque step peut être déplié pour voir :
- Commandes exécutées
- Output console
- Temps d'exécution
- Erreurs détaillées

---

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SSH Action](https://github.com/appleboy/ssh-action)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---