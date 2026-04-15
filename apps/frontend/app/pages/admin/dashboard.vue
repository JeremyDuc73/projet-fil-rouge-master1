<template>
  <div class="max-w-full min-w-0 overflow-x-hidden">
    <ClientOnly>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <!-- Total Movies -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Films</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ isLoading ? '-' : stats.movies }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Icon name="ph:film-strip" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <!-- Total Users -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Utilisateurs</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ isLoading ? '-' : stats.users }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Icon name="ph:users" class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <!-- Total Reviews -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Avis</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ isLoading ? '-' : stats.reviews }}
              </p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Icon name="ph:star" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <!-- Total Categories -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Catégories</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ isLoading ? '-' : stats.categories }}
              </p>
            </div>
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Icon name="ph:tag" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Movies -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 min-w-0">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Films récents
          </h2>
          <NuxtLink
            to="/admin/movies"
            class="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium shrink-0 self-start sm:self-auto"
          >
            Voir tous
          </NuxtLink>
        </div>

        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="animate-pulse flex gap-4">
            <div class="w-16 h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-3 sm:space-y-4">
          <div
            v-for="movie in recentMovies"
            :key="movie.id"
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors min-w-0"
          >
            <div class="flex gap-4 min-w-0 flex-1">
              <img
                :src="movie.poster_url"
                :alt="movie.title"
                class="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {{ movie.title }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ movie.release_year }}
                </p>
              </div>
            </div>
            <NuxtLink
              :to="`/admin/movies/${movie.id}/edit`"
              class="text-primary-600 dark:text-primary-400 hover:underline text-sm shrink-0 self-end sm:self-auto sm:ml-auto"
            >
              Modifier
            </NuxtLink>
          </div>

          <div v-if="recentMovies.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun film disponible
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 min-w-0">
        <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Actions rapides
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <NuxtLink
            to="/admin/movies/create"
            class="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"
          >
            <Icon name="ph:plus-circle" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span class="font-medium text-gray-900 dark:text-white">Ajouter un film</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/users"
            class="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"
          >
            <Icon name="ph:user-plus" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span class="font-medium text-gray-900 dark:text-white">Gérer les utilisateurs</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/categories"
            class="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"
          >
            <Icon name="ph:tag" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span class="font-medium text-gray-900 dark:text-white">Gérer les catégories</span>
          </NuxtLink>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const isLoading = ref(true)

const stats = ref({
  movies: 0,
  users: 0,
  reviews: 0,
  categories: 0
})

const recentMovies = ref<any[]>([])

onMounted(async () => {
  try {
    const api = useApi()
    
    // Load stats
    const [moviesRes, usersRes, categoriesRes] = await Promise.all([
      api.get('/movies?limit=5&sort=created_at&order=desc'),
      api.get('/users'),
      api.get('/categories')
    ])

    stats.value = {
      movies: moviesRes.pagination?.total || 0,
      users: usersRes.data?.length || 0,
      reviews: 0, // TODO: Add reviews endpoint
      categories: categoriesRes.data?.length || 0
    }

    recentMovies.value = moviesRes.data || []
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
  } finally {
    isLoading.value = false
  }
})

useHead({
  title: 'Dashboard Admin'
})
</script>
