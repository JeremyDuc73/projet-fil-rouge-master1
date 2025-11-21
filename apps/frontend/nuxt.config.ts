// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/test-utils'
  ],

  // Icon configuration
  icon: {
    serverBundle: {
      collections: ['ph']
    },
    clientBundle: {
      scan: true,
      include: ['ph:heart', 'ph:heart-fill']
    }
  },

  // CSS
  css: ['@/assets/css/main.css'],
  vite: {
    optimizeDeps: {
      noDiscovery: true
    }
  },

  // Runtime config
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api',
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001'
    }
  },

  // App config
  app: {
    head: {
      title: 'CineZone',
      titleTemplate: '%s - CineZone',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Découvrez et gérez votre collection de films' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=2' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=2' },
        { rel: 'apple-touch-icon', href: '/favicon.svg?v=2' }
      ]
    }
  },

  // Color mode
  colorMode: {
    preference: 'dark'
  },

  // TypeScript
  typescript: {
    strict: true,
    shim: false
  }
})