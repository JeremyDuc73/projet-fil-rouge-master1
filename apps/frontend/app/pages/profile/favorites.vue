<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Mes Favoris
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ favorites.length }} film{{ favorites.length > 1 ? 's' : '' }} dans vos favoris
        </p>
      </div>
      
      <UButton 
        v-if="favorites.length > 0"
        to="/movies"
        variant="outline"
        color="gray"
        icon="ph:plus"
      >
        Découvrir plus
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Chargement de vos favoris...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="favorites.length === 0" class="text-center py-20">
      <Icon name="ph:heart" class="w-20 h-20 mx-auto mb-4 text-gray-400" />
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Aucun favori pour le moment
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Explorez notre catalogue et ajoutez des films à vos favoris
      </p>
      <UButton to="/movies" size="lg" color="primary" icon="ph:film-strip">
        Découvrir des films
      </UButton>
    </div>

    <!-- Movies Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <div 
        v-for="movie in favorites" 
        :key="movie.id"
        class="group relative"
      >
        <NuxtLink :to="`/movies/${movie.id}`">
          <MovieCard :movie="movie" />
        </NuxtLink>
        
        <!-- Remove Button -->
        <button
          @click.prevent="handleRemove(movie.id)"
          class="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
          title="Retirer des favoris"
        >
          <Icon name="ph:x" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const toast = useToast()
const favoritesStore = useFavoritesStore()

const favorites = computed(() => favoritesStore.favorites)
const isLoading = computed(() => favoritesStore.isLoading)

// Fetch favorites on mount
onMounted(async () => {
  await favoritesStore.fetchFavorites()
})

// Remove from favorites
const handleRemove = async (movieId: number) => {
  try {
    const movie = favorites.value.find(m => m.id === movieId)
    await favoritesStore.removeFavorite(movieId)
    
    toast.add({
      title: 'Retiré des favoris',
      description: movie ? `${movie.title} a été retiré de vos favoris` : 'Film retiré',
      color: 'gray'
    })
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de retirer ce film',
      color: 'red',
      icon: 'ph:x-circle'
    })
  }
}

useHead({
  title: 'Mes Favoris'
})
</script>
