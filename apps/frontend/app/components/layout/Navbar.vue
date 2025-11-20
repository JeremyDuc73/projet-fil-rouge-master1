<template>
  <nav class="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <Icon name="ph:film-strip-duotone" class="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
          <span class="text-xl font-bold text-gray-900 dark:text-white">CineZone</span>
        </NuxtLink>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-6">
          <NuxtLink
            to="/"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium"
            active-class="text-primary-500 dark:text-primary-400"
          >
            Accueil
          </NuxtLink>
          <NuxtLink
            to="/movies"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium"
            active-class="text-primary-500 dark:text-primary-400"
          >
            Films
          </NuxtLink>
        </div>

        <!-- Search Bar (Desktop) -->
        <div class="hidden lg:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un film..."
              class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>

        <!-- Right Side -->
        <div class="flex items-center gap-4">
          <!-- Dark Mode Toggle -->
          <ClientOnly>
            <LayoutDarkModeToggle />
          </ClientOnly>

          <!-- User Menu / Auth Buttons -->
          <ClientOnly>
            <div v-if="isAuthenticated" class="hidden md:block">
              <LayoutUserMenu />
            </div>
            <div v-else class="hidden md:flex items-center gap-2">
              <UButton to="/auth/login" variant="ghost" color="gray">
                Connexion
              </UButton>
              <UButton to="/auth/register" color="primary">
                S'inscrire
              </UButton>
            </div>
          </ClientOnly>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer"
          >
            <Icon :name="isMobileMenuOpen ? 'ph:x' : 'ph:list'" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Search -->
      <div class="lg:hidden pb-3">
        <div class="relative">
          <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un film..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <ClientOnly>
      <LayoutMobileMenu v-if="isMobileMenuOpen" @close="toggleMobileMenu" />
    </ClientOnly>
  </nav>
</template>

<script setup lang="ts">
const router = useRouter()
const { isAuthenticated } = useAuth()

const searchQuery = ref('')
const isMobileMenuOpen = ref(false)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/movies',
      query: { search: searchQuery.value.trim() }
    })
    searchQuery.value = ''
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Close mobile menu on route change
watch(() => router.currentRoute.value.path, () => {
  isMobileMenuOpen.value = false
})
</script>
