<template>
  <div class="min-h-screen">
    <!-- Page Header -->
    <div class="bg-gradient-to-r from-primary-600 to-blue-600 text-white py-12">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Catalogue de Films</h1>
        <p class="text-xl text-white/90">
          Découvrez notre collection de {{ pagination.total || 0 }} films
        </p>
      </div>
    </div>

    <!-- Filters -->
    <MovieFilters
      :search="filters.search || ''"
      :category="filters.category || null"
      :min-rating="filters.minRating || null"
      :sort-by="filters.sortBy || 'created_at'"
      :order="filters.order || 'DESC'"
      :categories="categories"
      @update:search="handleSearchUpdate"
      @update:category="handleCategoryUpdate"
      @update:min-rating="handleRatingUpdate"
      @update:sort="handleSortUpdate"
      @clear="handleClearFilters"
    />

    <!-- Movies Grid -->
    <div class="container mx-auto px-4 py-8">
      <MovieGrid
        :movies="movies"
        :is-loading="isLoading"
        :is-loading-more="isLoadingMore"
        :has-more="pagination.hasMore"
        :pagination="pagination"
        :auto-load="true"
        @load-more="loadMore"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const moviesStore = useMoviesStore()
const route = useRoute()
const router = useRouter()

// Use computed instead of storeToRefs to avoid undefined issues
const movies = computed(() => moviesStore.movies || [])
const categories = computed(() => moviesStore.categories || [])
const filters = computed(() => moviesStore.filters)
const pagination = computed(() => moviesStore.pagination)
const isLoading = computed(() => moviesStore.isLoading)
const isLoadingMore = computed(() => moviesStore.isLoadingMore)

// Initialize filters from URL query params BEFORE mount
if (route.query.search) {
  moviesStore.filters.search = route.query.search as string
}
if (route.query.category) {
  moviesStore.filters.category = route.query.category as string
}
if (route.query.min_rating) {
  moviesStore.filters.minRating = Number(route.query.min_rating)
}

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    moviesStore.fetchMovies(true),
    moviesStore.fetchCategories()
  ])
})

// Watch URL query params (for search from navbar)
watch(() => route.query, (newQuery) => {
  // Update store filters from URL
  moviesStore.filters.search = (newQuery.search as string) || ''
  moviesStore.filters.category = (newQuery.category as string) || null
  moviesStore.filters.minRating = newQuery.min_rating ? Number(newQuery.min_rating) : null
  
  // Refetch with new filters
  moviesStore.fetchMovies(true)
}, { deep: true })

// Handle filter updates
const handleSearchUpdate = (value: string) => {
  moviesStore.setFilter('search', value)
  updateQueryParams({ search: value || undefined })
}

const handleCategoryUpdate = (value: string | null) => {
  moviesStore.setFilter('category', value)
  updateQueryParams({ category: value || undefined })
}

const handleRatingUpdate = (value: number | null) => {
  moviesStore.setFilter('minRating', value)
  updateQueryParams({ min_rating: value ? String(value) : undefined })
}

const handleSortUpdate = ({ sortBy, order }: { sortBy: string, order: string }) => {
  moviesStore.setFilter('sortBy', sortBy)
  moviesStore.setFilter('order', order)
}

const handleClearFilters = () => {
  moviesStore.clearFilters()
  updateQueryParams({})
}

const loadMore = () => {
  moviesStore.loadMore()
}

// Update URL query params
const updateQueryParams = (params: Record<string, string | undefined>) => {
  const query = { ...route.query, ...params }
  
  // Remove undefined values
  Object.keys(query).forEach(key => {
    if (query[key] === undefined) {
      delete query[key]
    }
  })

  router.replace({ query })
}

useHead({
  title: 'Films'
})
</script>
