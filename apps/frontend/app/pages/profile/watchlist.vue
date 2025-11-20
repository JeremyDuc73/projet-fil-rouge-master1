<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ma Watchlist</h1>
      </div>

      <ClientOnly>
        <!-- Filter Tabs -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-6">
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="flex -mb-px">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                @click="activeTab = tab.value"
                :class="[
                  'flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.value
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                ]"
              >
                <span class="flex items-center justify-center gap-2">
                  <Icon :name="tab.icon" class="w-5 h-5" />
                  {{ tab.label }}
                  <span class="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700">
                    {{ stats[tab.value] || 0 }}
                  </span>
                </span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">À voir</p>
                <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ stats.to_watch }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Icon name="ph:eye" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Vus</p>
                <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ stats.watched }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Icon name="ph:check-circle" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Abandonnés</p>
                <p class="text-3xl font-bold text-red-600 dark:text-red-400">{{ stats.dropped }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Icon name="ph:x-circle" class="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <!-- Movies Grid -->
        <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div v-for="i in 10" :key="i" class="animate-pulse">
            <div class="aspect-[2/3] bg-gray-300 dark:bg-gray-700 rounded-lg mb-3"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>

        <div v-else-if="filteredMovies.length === 0" class="text-center py-12">
          <Icon name="ph:film-slate" class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p class="text-gray-600 dark:text-gray-400">Aucun film dans cette catégorie</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div
            v-for="movie in filteredMovies"
            :key="movie.id"
            class="group relative"
          >
            <NuxtLink :to="`/movies/${movie.id}`" class="block">
              <div class="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-3">
                <img
                  v-if="movie.poster_url"
                  :src="getImageUrl(movie.poster_url)"
                  :alt="movie.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <Icon name="ph:film-slate" class="w-12 h-12 text-gray-400" />
                </div>

                <!-- Status Badge -->
                <div class="absolute top-2 right-2">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      movie.status === 'to_watch' ? 'bg-blue-500 text-white' :
                      movie.status === 'watched' ? 'bg-green-500 text-white' :
                      'bg-red-500 text-white'
                    ]"
                  >
                    {{ getStatusLabel(movie.status) }}
                  </span>
                </div>
              </div>

              <h3 class="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {{ movie.title }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ movie.release_date?.substring(0, 4) || 'N/A' }}
              </p>
            </NuxtLink>

            <!-- Action Buttons -->
            <div class="mt-3 flex gap-2">
              <button
                v-if="movie.status === 'to_watch'"
                @click="updateStatus(movie.id, 'watched')"
                class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Icon name="ph:check" class="w-4 h-4" />
                Vu
              </button>
              <button
                v-if="movie.status === 'to_watch'"
                @click="updateStatus(movie.id, 'dropped')"
                class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Icon name="ph:x" class="w-4 h-4" />
                Abandonner
              </button>
              <button
                v-if="movie.status !== 'to_watch'"
                @click="updateStatus(movie.id, 'to_watch')"
                class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Icon name="ph:arrow-counter-clockwise" class="w-4 h-4" />
                À voir
              </button>
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Movie } from '@/utils/types'

definePageMeta({
  middleware: ['auth']
})

const watchlistStore = useWatchlistStore()
const toast = useToast()
const { getImageUrl } = useImageUrl()

const activeTab = ref<'to_watch' | 'watched' | 'dropped'>('to_watch')
const isLoading = ref(false)

const tabs = [
  { value: 'to_watch', label: 'À voir', icon: 'ph:eye' },
  { value: 'watched', label: 'Vus', icon: 'ph:check-circle' },
  { value: 'dropped', label: 'Abandonnés', icon: 'ph:x-circle' }
]

const stats = computed(() => watchlistStore.stats)

const filteredMovies = computed(() => {
  return watchlistStore.watchlistByStatus(activeTab.value)
})

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'to_watch': return 'À voir'
    case 'watched': return 'Vu'
    case 'dropped': return 'Abandonné'
    default: return 'À voir'
  }
}

const updateStatus = async (movieId: number, status: 'to_watch' | 'watched' | 'dropped') => {
  try {
    await watchlistStore.updateStatus(movieId, status)
    toast.add({
      title: 'Statut mis à jour',
      description: `Le film a été marqué comme "${getStatusLabel(status)}"`,
      color: 'green',
      icon: 'ph:check-circle'
    })
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de mettre à jour le statut',
      color: 'red',
      icon: 'ph:x-circle'
    })
  }
}

const loadData = async () => {
  isLoading.value = true
  await Promise.all([
    watchlistStore.fetchWatchlist(),
    watchlistStore.fetchStats()
  ])
  isLoading.value = false
}

onMounted(() => {
  loadData()
})

useHead({
  title: 'Ma Watchlist'
})
</script>
