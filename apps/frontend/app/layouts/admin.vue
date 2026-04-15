<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-950">
    <!-- Overlay mobile -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        aria-hidden="true"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar : tiroir sur mobile, fixe à partir de lg -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 transform transition-transform duration-200 ease-out lg:static lg:z-auto lg:max-w-none lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="h-full flex flex-col min-h-0 overflow-hidden">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-2 shrink-0">
          <NuxtLink
            to="/admin/dashboard"
            class="flex items-center gap-2 min-w-0"
            @click="sidebarOpen = false"
          >
            <img src="/logo.svg" alt="CineZone Logo" class="w-10 h-10 shrink-0" />
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">CineZone</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Administration</p>
            </div>
          </NuxtLink>
          <button
            type="button"
            class="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
            aria-label="Fermer le menu"
            @click="sidebarOpen = false"
          >
            <Icon name="ph:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Retour au site : tout en haut (sous le logo), pas en bas de la sidebar -->
        <div class="px-4 pb-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium"
            @click="sidebarOpen = false"
          >
            <Icon name="ph:arrow-left" class="w-5 h-5 shrink-0" />
            <span>Retour au site</span>
          </NuxtLink>
        </div>

        <!-- Navigation (scroll si beaucoup d’entrées) -->
        <nav class="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
          <NuxtLink
            to="/admin/dashboard"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
            @click="sidebarOpen = false"
          >
            <Icon name="ph:chart-line" class="w-5 h-5" />
            <span class="font-medium">Dashboard</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/movies"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
            @click="sidebarOpen = false"
          >
            <Icon name="ph:film-strip" class="w-5 h-5" />
            <span class="font-medium">Films</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/users"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
            @click="sidebarOpen = false"
          >
            <Icon name="ph:users" class="w-5 h-5" />
            <span class="font-medium">Utilisateurs</span>
          </NuxtLink>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen min-w-0 w-full">
      <!-- Top Bar -->
      <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 min-h-16 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-0">
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            class="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Ouvrir le menu"
            @click="sidebarOpen = true"
          >
            <Icon name="ph:list" class="w-6 h-6" />
          </button>
          <h1 class="text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
            {{ pageTitle }}
          </h1>
        </div>
        
        <ClientOnly>
          <div class="flex items-center gap-4">
            <LayoutDarkModeToggle />
            <LayoutUserMenu />
          </div>
        </ClientOnly>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-6 min-w-0 overflow-x-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const sidebarOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  }
)

const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('/dashboard')) return 'Dashboard'
  if (path.includes('/movies')) return 'Gestion des films'
  if (path.includes('/users')) return 'Gestion des utilisateurs'
  if (path.includes('/categories')) return 'Gestion des catégories'
  return 'Administration'
})
</script>
