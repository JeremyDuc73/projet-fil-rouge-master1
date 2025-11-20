# 🎨 Frontend - Vue d'Ensemble

## Stack
- **Nuxt.js 3** (Vue 3 + SSR)
- **Pinia** (State management)
- **TailwindCSS 4** (Styling)
- **Nuxt UI** (Components)

## Structure
```
app/
├── pages/          # Routes auto
├── components/     # Composants Vue
├── stores/         # Stores Pinia
├── composables/    # Logique réutilisable
├── middleware/     # Guards (auth, admin)
├── utils/          # Helpers
└── assets/         # CSS/Images
```

## Lancement
```bash
cd apps/frontend
npm install
npm run dev         # http://localhost:3000
```

Voir [API Reference](../backend/api-reference.md) pour les endpoints.
