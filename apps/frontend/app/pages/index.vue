<template>
  <div class="bg-white dark:bg-black min-h-screen">
    <!-- Hero Section with Featured Movie -->
    <MovieHero v-if="featuredMovie" :movie="featuredMovie!" />

    <!-- Loading State -->
    <div v-if="moviesStore.isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-900 dark:text-white text-lg">Chargement des films...</p>
      </div>
    </div>

    <!-- Movie Sections by Category (Netflix Style) -->
    <div v-else class="space-y-12 py-12">
      <!-- Popular / Top Rated -->
      <section v-if="popularMovies.length > 0" class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Films populaires</h2>
          <NuxtLink to="/movies" class="text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2">
            Voir tout
            <Icon name="ph:arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
        <div class="relative carousel-section">
          <div ref="popularScroll" class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
            <div v-for="movie in popularMovies" :key="movie.id" class="flex-none w-40 md:w-48 snap-start">
              <MovieCard :movie="movie" />
            </div>
          </div>
          <button
            @click="scrollSection(popularScroll, 'left')"
            class="carousel-button carousel-button-left"
          >
            <Icon name="ph:caret-left" class="w-8 h-8" />
          </button>
          <button
            @click="scrollSection(popularScroll, 'right')"
            class="carousel-button carousel-button-right"
          >
            <Icon name="ph:caret-right" class="w-8 h-8" />
          </button>
        </div>
      </section>

      <!-- Categories Sections -->
      <section
        v-for="(category, index) in displayCategories"
        :key="category.id"
        class="container mx-auto px-4"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{{ category.name }}</h2>
          <NuxtLink
            :to="`/movies?category=${category.slug}`"
            class="text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2"
          >
            Voir tout
            <Icon name="ph:arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
        <div class="relative carousel-section">
          <div :ref="el => categoryScrolls[index] = el" class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
            <div
              v-for="movie in getMoviesByCategory(category.slug)"
              :key="movie.id"
              class="flex-none w-40 md:w-48 snap-start"
            >
              <MovieCard :movie="movie" />
            </div>
          </div>
          <button
            @click="scrollSection(categoryScrolls[index], 'left')"
            class="carousel-button carousel-button-left"
          >
            <Icon name="ph:caret-left" class="w-8 h-8" />
          </button>
          <button
            @click="scrollSection(categoryScrolls[index], 'right')"
            class="carousel-button carousel-button-right"
          >
            <Icon name="ph:caret-right" class="w-8 h-8" />
          </button>
        </div>
      </section>

      <!-- Call to Action (if not authenticated) -->
      <ClientOnly>
        <section v-if="!isAuthenticated" class="container mx-auto px-4">
          <div class="relative bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 rounded-2xl p-12 overflow-hidden">
            <div class="absolute inset-0 bg-black/20"></div>
            <div class="relative text-center max-w-2xl mx-auto">
              <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
                Rejoignez CineZone
              </h2>
              <p class="text-xl text-white/90 mb-8">
                Créez votre compte pour noter des films, créer des listes et bien plus encore !
              </p>
              <div class="flex gap-4 justify-center">
                <UButton to="/auth/register" size="xl" color="white">
                  S'inscrire gratuitement
                </UButton>
                <UButton to="/auth/login" size="xl" color="white" variant="outline">
                  Se connecter
                </UButton>
              </div>
            </div>
          </div>
        </section>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated } = useAuth()
const moviesStore = useMoviesStore()

// Refs for scroll containers
const popularScroll = ref<HTMLElement | null>(null)
const categoryScrolls = ref<(HTMLElement | null)[]>([])

// Use computed to ensure safe access
const movies = computed(() => moviesStore.movies || [])
const categories = computed(() => moviesStore.categories || [])
const featuredMovie = computed(() => moviesStore.featuredMovie)

// Get movies by category
const getMoviesByCategory = (categorySlug: string) => {
  return movies.value
    .filter(m => m.categories?.some(c => c.slug === categorySlug))
    .slice(0, 20) // Increased from 12 to 20
}

// Popular movies (top rated)
const popularMovies = computed(() => {
  return [...movies.value]
    .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
    .slice(0, 20) // Increased from 12 to 20
})

// Display first 4 categories
const displayCategories = computed(() => {
  return categories.value.slice(0, 4)
})

// Scroll section left or right
const scrollSection = (element: HTMLElement | null, direction: 'left' | 'right') => {
  if (!element) return
  const scrollAmount = element.clientWidth * 0.8
  element.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

// Fetch data on mount
onMounted(async () => {
  // Clear any search filters from movies page
  moviesStore.clearFilters()
  
  // Temporarily increase limit to load more movies for homepage
  const originalLimit = moviesStore.pagination.limit
  moviesStore.pagination.limit = 100 // Load 100 movies for better category distribution
  
  await Promise.all([
    moviesStore.fetchMovies(true),
    moviesStore.fetchCategories()
  ])
  
  // Restore original limit for movies page
  moviesStore.pagination.limit = originalLimit
})

useHead({
  title: 'Accueil'
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Carousel navigation buttons */
.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 3rem;
  height: 5rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s, background-color 0.2s;
}

.carousel-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
}

.carousel-button-left {
  left: 0;
  border-radius: 0 0.5rem 0.5rem 0;
}

.carousel-button-right {
  right: 0;
  border-radius: 0.5rem 0 0 0.5rem;
}

.carousel-section:hover .carousel-button {
  opacity: 1;
}
</style>
