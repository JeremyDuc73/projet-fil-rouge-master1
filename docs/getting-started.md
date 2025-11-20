# 🚀 Getting Started

## Prérequis
- Node.js >= 20
- PostgreSQL >= 14
- TMDB API Key

## Installation Rapide

```bash
# 1. Clone
git clone https://github.com/username/cinezone.git
cd cinezone

# 2. Backend
cd apps/backend
npm install
cp .env.example .env
# Éditer .env
npm run db:init
npm run dev

# 3. Frontend (nouveau terminal)
cd apps/frontend
npm install
npm run dev
```

Accès : http://localhost:3000

Voir README principal pour plus de détails.
