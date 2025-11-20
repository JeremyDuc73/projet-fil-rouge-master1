<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0">
      <div class="h-full flex flex-col">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-800">
          <NuxtLink to="/admin/dashboard" class="flex items-center gap-2">
            <Icon name="ph:shield-check-fill" class="w-8 h-8 text-primary-500" />
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Admin</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Panel d'administration</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1">
          <NuxtLink
            to="/admin/dashboard"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
          >
            <Icon name="ph:chart-line" class="w-5 h-5" />
            <span class="font-medium">Dashboard</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/movies"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
          >
            <Icon name="ph:film-strip" class="w-5 h-5" />
            <span class="font-medium">Films</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/users"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
          >
            <Icon name="ph:users" class="w-5 h-5" />
            <span class="font-medium">Utilisateurs</span>
          </NuxtLink>
        </nav>

        <!-- Back to site -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-800">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <Icon name="ph:arrow-left" class="w-5 h-5" />
            <span class="font-medium">Retour au site</span>
          </NuxtLink>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Top Bar -->
      <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-6">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ pageTitle }}
        </h1>
        
        <ClientOnly>
          <div class="flex items-center gap-4">
            <LayoutDarkModeToggle />
            <LayoutUserMenu />
          </div>
        </ClientOnly>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('/dashboard')) return 'Dashboard'
  if (path.includes('/movies')) return 'Gestion des films'
  if (path.includes('/users')) return 'Gestion des utilisateurs'
  if (path.includes('/categories')) return 'Gestion des catégories'
  return 'Administration'
})
</script>
