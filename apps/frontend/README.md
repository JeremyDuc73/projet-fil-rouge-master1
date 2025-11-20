# CineZone Frontend

Application Nuxt 3 pour CineZone - Catalogue de films avec espace membre.

## Stack Technique

- **Nuxt 3** - Framework Vue.js
- **Nuxt UI** - Composants UI (shadcn-vue style)
- **Pinia** - State management
- **GSAP** - Animations
- **Tailwind CSS** - Styles
- **TypeScript** - Typage

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Structure du projet

```
app/
├── assets/          # CSS global
├── components/      # Composants Vue
│   ├── auth/       # Login, Register
│   ├── layout/     # Header, Footer
│   └── movie/      # MovieCard, MovieGrid, MovieHero
├── composables/     # useAuth, useApi
├── layouts/         # Layout par défaut
├── middleware/      # auth.ts
├── pages/           # Pages/routes
│   ├── index.vue   # Page d'accueil
│   ├── movies/     # Catalogue et détail
│   └── auth/       # Login/Register
├── stores/          # Pinia stores
│   ├── auth.ts
│   └── movies.ts
├── utils/           # Types, helpers
└── nuxt.config.ts   # Config Nuxt
```

## 🎬 Intégration TMDB

### Galerie d'images

Les films importés depuis TMDB incluent une galerie :

```typescript
// Dans MovieHero.vue
const heroBackdrop = computed(() => {
  // Priorité : première image galerie > backdrop_url
  return props.movie.gallery?.[0]?.url || props.movie.backdrop_url
})
```

### Utilisation

```vue
<template>
  <!-- Backdrop avec galerie -->
  <MovieHero :movie="movie" />
  
  <!-- Afficher toute la galerie -->
  <div v-for="image in movie.gallery" :key="image.id">
    <img :src="image.url" />
  </div>
</template>
```

### Types

```typescript
interface MovieImage {
  id: number
  url: string
  type: 'backdrop' | 'poster'
}

interface Movie {
  id: number
  title: string
  average_rating: number  // Note TMDB (0-5)
  gallery?: MovieImage[]  // Galerie d'images
  // ...
}
```

## 🎨 Thèmes

Support complet du mode clair/sombre :

```vue
<!-- Classes Tailwind dynamiques -->
<div class="bg-white dark:bg-black">
  <h1 class="text-gray-900 dark:text-white">Titre</h1>
</div>
```

Le toggle est dans le Header (`components/layout/Header.vue`).

## 📱 Pages principales

| Route | Page | Description |
|-------|------|-------------|
| `/` | Accueil | Hero + films par catégorie |
| `/movies` | Catalogue | Liste complète avec filtres |
| `/movies/:id` | Détail film | Informations + galerie |
| `/auth/login` | Connexion | Login |
| `/auth/register` | Inscription | Register |

## 🔐 Authentification

### Middleware

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
})
```

### Utilisation dans une page

```vue
<script setup>
definePageMeta({
  middleware: 'auth'  // Page protégée
})
</script>
```

## 🐛 Bugs connus et solutions

### Recherche qui persiste sur la page d'accueil
**Solution** : `clearFilters()` dans `onMounted()` de `index.vue` ✅

### Scroll infini GSAP
**Solution** : Utiliser `nextTick()` avant les animations ✅

### Mode clair cassé
**Solution** : Classes Tailwind dynamiques `dark:` ✅

## 🚀 Prochaines étapes

- [ ] Interface Admin (dashboard, formulaires)
- [ ] Favoris et Watchlist
- [ ] Notes et reviews
- [ ] Recherche avancée
- [ ] Filtres multiples
- [ ] PWA (mode offline)
