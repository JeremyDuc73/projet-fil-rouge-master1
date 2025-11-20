<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Mes Notes
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ ratedMovies.length }} film{{ ratedMovies.length > 1 ? 's' : '' }} noté{{ ratedMovies.length > 1 ? 's' : '' }}
        </p>
      </div>
      
      <UButton 
        v-if="ratedMovies.length > 0"
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
        <p class="text-gray-600 dark:text-gray-400">Chargement de vos notes...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="ratedMovies.length === 0" class="text-center py-20">
      <Icon name="ph:star" class="w-20 h-20 mx-auto mb-4 text-gray-400" />
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Aucune note
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Vous n'avez pas encore noté de films
      </p>
      <UButton to="/movies" size="lg" color="primary" icon="ph:film-strip">
        Découvrir des films
      </UButton>
    </div>

    <!-- Movies Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <div 
        v-for="movie in ratedMovies" 
        :key="movie.id"
        class="group relative"
      >
        <NuxtLink :to="`/movies/${movie.id}`">
          <MovieCard :movie="movie" />
        </NuxtLink>
        
        <!-- User Rating Badge -->
        <div class="absolute top-2 left-2 bg-green-600 text-white text-sm font-bold px-2.5 py-1.5 rounded-full flex items-center shadow-lg z-10">
          <Icon name="ph:star-fill" class="w-4 h-4 mr-1" />
          {{ movie.rating }}
        </div>
        
        <!-- Remove Button -->
        <button
          @click.prevent="handleRemove(movie.id)"
          class="h-9 w-9 cursor-pointer absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
          title="Supprimer la note"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5 stroke-2" />
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
const reviewsStore = useReviewsStore()

const ratedMovies = computed(() => {
  // Transform reviews to rated movies format
  return reviewsStore.myReviews.map((review: any) => ({
    id: review.movie_id,
    title: review.title,
    poster_url: review.poster_url,
    backdrop_url: null,
    release_date: review.release_date,
    rating: review.rating,
    rated_at: review.created_at
  }))
})
const isLoading = computed(() => reviewsStore.isLoading)

// Fetch reviews on mount
onMounted(async () => {
  await reviewsStore.fetchMyReviews()
})

// Remove review/rating
const handleRemove = async (movieId: number) => {
  try {
    const movie = ratedMovies.value.find(m => m.id === movieId)
    // Find the review by movie_id
    const review = reviewsStore.myReviews.find((r: any) => r.movie_id === movieId)
    if (review) {
      await reviewsStore.deleteReview(review.id, movieId)
      // Reload the list to update the UI
      await reviewsStore.fetchMyReviews()
    }
    
    toast.add({
      title: 'Note supprimée',
      description: movie ? `Votre note pour ${movie.title} a été supprimée` : 'Note supprimée',
      color: 'gray'
    })
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer cette note',
      color: 'red',
      icon: 'ph:x-circle'
    })
  }
}

useHead({
  title: 'Mes Notes'
})
</script>
