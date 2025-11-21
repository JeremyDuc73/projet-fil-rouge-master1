<template>
  <div v-if="movie" class="min-h-screen">
    <!-- Hero with Backdrop -->
    <MovieHero :movie="movie" :community-rating="movieRating" />

    <!-- Movie Details -->
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Poster & Actions -->
        <div class="space-y-6">
          <!-- Poster -->
          <div class="rounded-xl overflow-hidden shadow-2xl">
            <img
              v-if="movie.poster_url"
              :src="getPosterUrl(movie.poster_url)"
              :alt="movie.title"
              class="w-full"
            />
            <div
              v-else
              class="w-full aspect-[2/3] flex items-center justify-center text-white font-bold text-2xl text-center p-8"
              :style="{ backgroundColor: getColorFromTitle(movie.title) }"
            >
              {{ movie.title }}
            </div>
          </div>

          <!-- Actions (if authenticated) -->
          <ClientOnly>
            <div v-if="isAuthenticated" class="space-y-3">
              <UButton 
                block 
                size="lg" 
                :color="isFavorite ? 'red' : 'primary'"
                :variant="isFavorite ? 'solid' : 'outline'"
                :loading="isTogglingFavorite"
                @click="handleToggleFavorite"
                class="transition-all"
              >
                <Icon 
                  :name="isFavorite ? 'ph:heart-fill' : 'ph:heart'" 
                  class="w-5 h-5 mr-2 transition-transform"
                  :class="{ 'animate-bounce': isFavorite }"
                />
                {{ isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
              </UButton>
              <!-- Watchlist Buttons -->
              <div v-if="!isInWatchlist">
                <UButton 
                  block 
                  size="lg" 
                  color="gray"
                  variant="outline"
                  :loading="isTogglingWatchlist"
                  @click="handleToggleWatchlist"
                  class="transition-all"
                >
                  <Icon 
                    name="ph:bookmark-simple" 
                    class="w-5 h-5 mr-2"
                  />
                  Ajouter à ma watchlist
                </UButton>
              </div>
              
              <div v-else class="space-y-2">
                <!-- Current Status Badge -->
                <div 
                  class="flex items-center justify-between p-3 rounded-lg border"
                  :class="[
                    movieStatus === 'to_watch' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                    movieStatus === 'watched' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <Icon 
                      :name="movieStatus === 'to_watch' ? 'ph:eye' : movieStatus === 'watched' ? 'ph:check-circle-fill' : 'ph:x-circle-fill'" 
                      class="w-5 h-5"
                      :class="[
                        movieStatus === 'to_watch' ? 'text-blue-600 dark:text-blue-400' :
                        movieStatus === 'watched' ? 'text-green-600 dark:text-green-400' :
                        'text-red-600 dark:text-red-400'
                      ]"
                    />
                    <span 
                      class="text-sm font-medium"
                      :class="[
                        movieStatus === 'to_watch' ? 'text-blue-900 dark:text-blue-100' :
                        movieStatus === 'watched' ? 'text-green-900 dark:text-green-100' :
                        'text-red-900 dark:text-red-100'
                      ]"
                    >
                      {{ getStatusLabel(movieStatus) }}
                    </span>
                  </div>
                  <button
                    @click="handleRemoveFromWatchlist"
                    :disabled="isTogglingWatchlist"
                    class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                  >
                    Retirer
                  </button>
                </div>
                
                <!-- Status Change Buttons -->
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-if="movieStatus !== 'to_watch'"
                    @click="handleUpdateStatus('to_watch')"
                    :disabled="isUpdatingStatus"
                    class="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-900 dark:text-blue-100 rounded-lg transition-colors disabled:opacity-50 flex flex-col items-center"
                  >
                    <Icon name="ph:eye" class="w-4 h-4 mb-1" />
                    <span>À voir</span>
                  </button>
                  <button
                    v-if="movieStatus !== 'watched'"
                    @click="handleUpdateStatus('watched')"
                    :disabled="isUpdatingStatus"
                    class="px-3 py-2 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-900 dark:text-green-100 rounded-lg transition-colors disabled:opacity-50 flex flex-col items-center"
                  >
                    <Icon name="ph:check-circle" class="w-4 h-4 mb-1" />
                    <span>Vu</span>
                  </button>
                  <button
                    v-if="movieStatus !== 'dropped'"
                    @click="handleUpdateStatus('dropped')"
                    :disabled="isUpdatingStatus"
                    class="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-900 dark:text-red-100 rounded-lg transition-colors disabled:opacity-50 flex flex-col items-center"
                  >
                    <Icon name="ph:x-circle" class="w-4 h-4 mb-1" />
                    <span>Abandonné</span>
                  </button>
                </div>
              </div>
            </div>
          </ClientOnly>
        </div>

        <!-- Right: Info & Description -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Title & Meta -->
          <div>
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {{ movie.title }}
            </h1>
            
            <div class="flex flex-wrap items-center gap-4 text-lg text-gray-600 dark:text-gray-400">
              <!-- TMDB Rating Badge -->
              <div v-if="movie.average_rating && parseFloat(movie.average_rating) > 0" class="flex items-center gap-2 bg-yellow-500 text-black px-3 py-1.5 rounded-lg font-bold">
                <Icon name="ph:star-fill" class="w-5 h-5" />
                <span>{{ parseFloat(movie.average_rating).toFixed(1) }}</span>
                <span class="text-xs opacity-75">TMDB</span>
              </div>
              
              <!-- Community Rating Badge (always show if ratings exist) -->
              <div v-if="movieRating && movieRating.ratings_count > 0" class="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold">
                <Icon name="ph:users-three" class="w-5 h-5" />
                <span>{{ parseFloat(movieRating.average_rating || 0).toFixed(1) }}/5</span>
                <span class="text-xs opacity-75">({{ movieRating.ratings_count }})</span>
              </div>
              
              <span v-if="movie.release_date">{{ new Date(movie.release_date).getFullYear() }}</span>
              <span v-if="movie.duration">{{ formatDuration(movie.duration) }}</span>
            </div>

            <!-- Categories -->
            <div class="flex flex-wrap gap-2 mt-4">
              <span
                v-for="category in movie.categories"
                :key="category.id"
                class="px-3 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium"
              >
                {{ category.name }}
              </span>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Synopsis</h2>
            <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ movie.description || 'Aucune description disponible.' }}
            </p>
          </div>

          <!-- Ratings Section -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notations</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- TMDB Rating (if available) -->
              <div v-if="movie.tmdb_rating && parseFloat(movie.tmdb_rating) > 0" class="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                <div class="flex items-center gap-2 mb-2">
                  <Icon name="ph:film-reel" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Note TMDB</h3>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                    {{ parseFloat(movie.tmdb_rating).toFixed(1) }}
                  </span>
                  <span class="text-lg text-gray-600 dark:text-gray-400">/10</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {{ movie.tmdb_vote_count?.toLocaleString() || 0 }} votes
                </p>
              </div>

              <!-- Community Rating Badge (if has ratings) -->
              <div v-if="isMovieReleased && movie.community_count > 0" class="p-6 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                <div class="flex items-center gap-2 mb-2">
                  <Icon name="ph:users-three" class="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Note Communauté</h3>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-bold text-green-600 dark:text-green-400">
                    {{ parseFloat(movie.community_rating).toFixed(1) }}
                  </span>
                  <span class="text-lg text-gray-600 dark:text-gray-400">/5</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {{ movie.community_count }} {{ movie.community_count > 1 ? 'avis' : 'avis' }}
                </p>
              </div>
            </div>

            <!-- Interactive Rating (below badges, only if released) -->
            <div v-if="isMovieReleased" class="mt-8">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Votre note</h3>
              <ClientOnly>
                <MovieRatingStars
                  v-if="movieRating"
                  :movie-id="movieId"
                  :user-rating="movieRating.user_rating"
                  :average-rating="movieRating.average_rating"
                  :ratings-count="movieRating.ratings_count"
                  :interactive="isAuthenticated"
                  @rate="handleRate"
                  @remove="handleRemoveRating"
                />
                <div v-else class="text-gray-500 dark:text-gray-400">
                  Chargement...
                </div>
              </ClientOnly>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Date de sortie
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                {{ movie.release_date ? new Date(movie.release_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non disponible' }}
              </p>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Durée
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                {{ movie.duration ? formatDuration(movie.duration) : 'Non disponible' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Player Section (TMDB movies only, released, premium users only) -->
    <div v-if="movie.tmdb_id && isMovieReleased && isPremiumUser" class="bg-gray-50 dark:bg-gray-950 py-12">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Regarder le film</h2>
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Icon name="ph:play-circle-fill" class="w-5 h-5 text-primary-500" />
            <span>Lecteur en streaming</span>
          </div>
        </div>

        <ClientOnly>
          <div class="relative rounded-xl overflow-hidden bg-black shadow-2xl" style="padding-bottom: 56.25%; height: 0;">
            <iframe
              ref="playerIframe"
              :src="`https://player.embed-api.stream/?id=${movie.tmdb_id}`"
              class="absolute top-0 left-0 w-full h-full"
              frameborder="0"
              allow="fullscreen"
            ></iframe>
          </div>
        </ClientOnly>
        
        <p class="text-xs text-gray-500 dark:text-gray-500 mt-3">
          Lecteur externe. La disponibilité dépend des sources externes.
        </p>
      </div>
    </div>

    <!-- Reviews Section (only if movie is released) -->
    <div v-if="isMovieReleased" class="bg-white dark:bg-gray-900 py-12">
      <div class="container mx-auto px-4 max-w-4xl">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">Avis</h2>
        
        <div class="space-y-8">
          <!-- My Review Form (if authenticated) -->
          <div v-if="isAuthenticated">
            <div v-if="!myReview && !showReviewForm">
              <button
                @click="showReviewForm = true"
                class="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="ph:pencil" class="w-5 h-5" />
                Écrire un avis
              </button>
            </div>

            <ReviewForm
              v-else-if="showReviewForm || editingReview"
              :initial-review="editingReview ? myReview : null"
              @submit="handleReviewSubmit"
              @cancel="handleCancelEdit"
            />

            <div v-else-if="myReview" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Votre avis a été publié
                  </h4>
                  <p class="text-sm text-green-700 dark:text-green-300">
                    Note : {{ myReview.rating }}/5
                  </p>
                </div>
                <button
                  @click="editingReview = true"
                  class="text-sm text-green-700 dark:text-green-300 hover:underline"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>

          <!-- Reviews List -->
          <ReviewList
            :reviews="movieReviewsData?.reviews || []"
            :total="movieReviewsData?.total || 0"
            :current-page="reviewsPage"
            :total-pages="movieReviewsData?.totalPages || 1"
            :is-loading="isLoadingReviews"
            :current-user-id="authStore.user?.id"
            @page-change="handleReviewsPageChange"
            @sort-change="handleReviewsSortChange"
            @edit="handleEditReview"
            @delete="confirmDeleteReview"
          />
        </div>
      </div>
    </div>

    <!-- Similar Movies Section -->
    <div v-if="similarMovies.length > 0" class="bg-gray-50 dark:bg-gray-950 py-12">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Films similaires
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <MovieCard
            v-for="similarMovie in similarMovies"
            :key="similarMovie.id"
            :movie="similarMovie"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Chargement du film...</p>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <ClientOnly>
    <SimpleModal v-if="showDeleteModal" @close="showDeleteModal = false">
      <div class="p-6">
        <div class="flex items-start gap-4 mb-4">
          <div class="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Icon name="ph:trash" class="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Supprimer l'avis
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
            </p>
          </div>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="handleDeleteReview"
            :disabled="isDeletingReview"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {{ isDeletingReview ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </SimpleModal>
  </ClientOnly>
</template>

<script setup lang="ts">
const route = useRoute()
const toast = useToast()
const moviesStore = useMoviesStore()
const favoritesStore = useFavoritesStore()
const watchlistStore = useWatchlistStore()
const reviewsStore = useReviewsStore() // Unified system (was ratingsStore + reviewsStore)
const historyStore = useHistoryStore()
const authStore = useAuthStore()
const { isAuthenticated, user } = useAuth()

const movie = ref<any>(null)
const isTogglingFavorite = ref(false)
const isTogglingWatchlist = ref(false)
const isUpdatingStatus = ref(false)
const movieRating = ref<any>(null)
const playerIframe = ref<HTMLIFrameElement | null>(null)
const similarMovies = ref<any[]>([])

// Reviews state
const showReviewForm = ref(false)
const editingReview = ref(false)
const myReview = ref<any>(null)
const movieReviewsData = ref<any>(null)
const isLoadingReviews = ref(false)
const reviewsPage = ref(1)
const reviewsSortBy = ref('recent')
const reviewToDelete = ref<any>(null)
const showDeleteModal = ref(false)
const isDeletingReview = ref(false)

const movieId = Number(route.params.id)

const isFavorite = computed(() => favoritesStore.isFavorite(movieId))
const isInWatchlist = computed(() => watchlistStore.isInWatchlist(movieId))
const movieStatus = computed(() => watchlistStore.getMovieStatus(movieId))

// Helper function
const getStatusLabel = (status?: string | null) => {
  switch (status) {
    case 'to_watch': return 'À voir'
    case 'watched': return 'Vu'
    case 'dropped': return 'Abandonné'
    default: return 'À voir'
  }
}

// Check if movie is released
const isMovieReleased = computed(() => {
  if (!movie.value || !movie.value.release_date) return false // Don't show player if no date
  const releaseDate = new Date(movie.value.release_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to compare only dates
  return releaseDate <= today
})

// Check if user is premium
const isPremiumUser = computed(() => {
  return user.value?.role === 'premium' || user.value?.role === 'admin' || user.value?.role === 'super_admin'
})

onMounted(async () => {
  movie.value = await moviesStore.fetchMovie(movieId)
  
  if (!movie.value) {
    navigateTo('/movies')
    return
  }
  
  // Track view if authenticated
  if (isAuthenticated.value) {
    historyStore.trackView(movieId)
    myReview.value = await reviewsStore.fetchMyReviewForMovie(movieId)
  }
  
  // Load movie average rating from movie data
  movieRating.value = {
    movie_id: movieId,
    user_rating: myReview.value?.rating || null,
    average_rating: parseFloat(movie.value?.community_rating) || 0,
    ratings_count: parseInt(movie.value?.community_count) || 0
  }
  
  // Load movie reviews
  await loadReviews()
  
  // Load similar movies
  await loadSimilarMovies()
})

// Load reviews
const loadReviews = async () => {
  isLoadingReviews.value = true
  try {
    movieReviewsData.value = await reviewsStore.fetchMovieReviews(movieId, {
      page: reviewsPage.value,
      limit: 10,
      sortBy: reviewsSortBy.value
    })
  } catch (error) {
    console.error('Error loading reviews:', error)
  } finally {
    isLoadingReviews.value = false
  }
}

// Load similar movies
const loadSimilarMovies = async () => {
  try {
    const api = useApi()
    const response = await api.get(`/movies/${movieId}/similar?limit=6`)
    similarMovies.value = response.data || []
    console.log('✅ Films similaires chargés:', similarMovies.value.length, 'films')
  } catch (error) {
    console.error('❌ Error loading similar movies:', error)
    similarMovies.value = []
  }
}

// Toggle favorite
const handleToggleFavorite = async () => {
  if (isTogglingFavorite.value) return
  
  isTogglingFavorite.value = true
  try {
    await favoritesStore.toggleFavorite(movieId)
    
    if (isFavorite.value) {
      toast.add({
        title: 'Ajouté aux favoris',
        description: `${movie.value.title} a été ajouté à vos favoris`,
        color: 'green',
        icon: 'ph:heart-fill'
      })
    } else {
      toast.add({
        title: 'Retiré des favoris',
        description: `${movie.value.title} a été retiré de vos favoris`,
        color: 'gray'
      })
    }
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.response?.data?.message || 'Impossible de modifier les favoris',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isTogglingFavorite.value = false
  }
}

// Add to watchlist
const handleToggleWatchlist = async () => {
  if (isTogglingWatchlist.value) return
  
  isTogglingWatchlist.value = true
  try {
    await watchlistStore.addToWatchlist(movieId)
    
    toast.add({
      title: 'Ajouté à la watchlist',
      description: `${movie.value.title} a été ajouté à votre liste "À voir"`,
      color: 'blue',
      icon: 'ph:bookmark-simple-fill'
    })
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.response?.data?.message || 'Impossible d\'ajouter à la watchlist',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isTogglingWatchlist.value = false
  }
}

// Remove from watchlist
const handleRemoveFromWatchlist = async () => {
  if (isTogglingWatchlist.value) return
  
  isTogglingWatchlist.value = true
  try {
    await watchlistStore.removeFromWatchlist(movieId)
    
    toast.add({
      title: 'Retiré de la watchlist',
      description: `${movie.value.title} a été retiré de votre watchlist`,
      color: 'gray'
    })
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.response?.data?.message || 'Impossible de retirer de la watchlist',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isTogglingWatchlist.value = false
  }
}

// Update watchlist status
const handleUpdateStatus = async (status: 'to_watch' | 'watched' | 'dropped') => {
  if (isUpdatingStatus.value) return
  
  isUpdatingStatus.value = true
  try {
    await watchlistStore.updateStatus(movieId, status)
    
    toast.add({
      title: 'Statut mis à jour',
      description: `${movie.value.title} est maintenant "${getStatusLabel(status)}"`,
      color: 'green',
      icon: 'ph:check-circle'
    })
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.response?.data?.message || 'Impossible de mettre à jour le statut',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isUpdatingStatus.value = false
  }
}

// Rate movie (unified with reviews)
const handleRate = async (rating: number) => {
  // Check if movie is released
  if (!isMovieReleased.value) {
    toast.add({
      title: 'Film pas encore sorti',
      description: 'Vous pourrez noter ce film après sa sortie',
      color: 'orange',
      icon: 'ph:calendar-x'
    })
    return
  }
  
  try {
    // Create or update review with just rating (no text)
    if (myReview.value) {
      // Update existing review
      await reviewsStore.updateReview(myReview.value.id, movieId, {
        rating,
        reviewText: myReview.value.review_text || ''
      })
    } else {
      // Create new review with just rating
      await reviewsStore.createReview(movieId, {
        rating,
        reviewText: ''
      })
    }
    
    // Reload user's review
    myReview.value = await reviewsStore.fetchMyReviewForMovie(movieId)
    
    // Update local movie rating
    if (movieRating.value) {
      movieRating.value.user_rating = rating
    }
    
    // Reload movie to get updated average
    movie.value = await moviesStore.fetchMovie(movieId)
    if (movie.value) {
      movieRating.value.average_rating = parseFloat(movie.value.community_rating) || 0
      movieRating.value.ratings_count = parseInt(movie.value.community_count) || 0
    }
    
    toast.add({
      title: 'Note enregistrée',
      description: `Vous avez noté ${movie.value.title} ${rating}/5`,
      color: 'green',
      icon: 'ph:star-fill'
    })
    
    // Reload reviews list
    await loadReviews()
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error?.data?.error || 'Impossible d\'enregistrer votre note',
      color: 'red',
      icon: 'ph:x-circle'
    })
  }
}

// Remove rating (unified with reviews)
const handleRemoveRating = async () => {
  if (!myReview.value) return
  
  try {
    await reviewsStore.deleteReview(myReview.value.id, movieId)
    
    // Clear user's review
    myReview.value = null
    
    // Remove user rating
    if (movieRating.value) {
      movieRating.value.user_rating = null
    }
    
    // Reload movie to get updated average
    movie.value = await moviesStore.fetchMovie(movieId)
    if (movie.value) {
      movieRating.value.average_rating = parseFloat(movie.value.community_rating) || 0
      movieRating.value.ratings_count = parseInt(movie.value.community_count) || 0
    }
    
    toast.add({
      title: 'Note retirée',
      description: `Votre note pour ${movie.value.title} a été retirée`,
      color: 'gray'
    })
    
    // Reload reviews list
    await loadReviews()
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error?.data?.error || 'Impossible de retirer votre note',
      color: 'red',
      icon: 'ph:x-circle'
    })
  }
}

// Reviews handlers
const handleReviewSubmit = async (reviewData: { rating: number; reviewText: string }) => {
  try {
    if (editingReview.value && myReview.value) {
      // Update existing review
      await reviewsStore.updateReview(myReview.value.id, movieId, reviewData)
      
      toast.add({
        title: 'Avis mis à jour',
        description: 'Votre avis a été mis à jour avec succès',
        color: 'green',
        icon: 'ph:check-circle'
      })
    } else {
      // Create new review
      await reviewsStore.createReview(movieId, reviewData)
      
      toast.add({
        title: 'Avis publié',
        description: 'Votre avis a été publié avec succès',
        color: 'green',
        icon: 'ph:check-circle'
      })
    }
    
    // Reload user's review
    myReview.value = await reviewsStore.fetchMyReviewForMovie(movieId)
    
    // Update local movie rating with user's rating
    if (movieRating.value) {
      movieRating.value.user_rating = reviewData.rating
    }
    
    // Reload movie to get updated average
    movie.value = await moviesStore.fetchMovie(movieId)
    if (movie.value) {
      movieRating.value.average_rating = parseFloat(movie.value.community_rating) || 0
      movieRating.value.ratings_count = parseInt(movie.value.community_count) || 0
    }
    
    // Reload reviews list to show new review
    await loadReviews()
    
    // Reset form state
    showReviewForm.value = false
    editingReview.value = false
  } catch (error: any) {
    const message = error?.data?.error || 'Une erreur est survenue lors de la publication de votre avis'
    
    toast.add({
      title: 'Erreur',
      description: message,
      color: 'red',
      icon: 'ph:x-circle'
    })
  }
}

const handleCancelEdit = () => {
  showReviewForm.value = false
  editingReview.value = false
}

const handleEditReview = (review: any) => {
  // Only allow editing own review (already filtered in ReviewList)
  editingReview.value = true
}

const confirmDeleteReview = (review: any) => {
  reviewToDelete.value = review
  showDeleteModal.value = true
}

const handleDeleteReview = async () => {
  if (!reviewToDelete.value) return
  
  isDeletingReview.value = true
  try {
    await reviewsStore.deleteReview(reviewToDelete.value.id, movieId)
    
    toast.add({
      title: 'Avis supprimé',
      description: 'Votre avis a été supprimé avec succès',
      color: 'gray'
    })
    
    // Reload user's review
    myReview.value = null
    
    // Update local movie rating
    if (movieRating.value) {
      movieRating.value.user_rating = null
    }
    
    // Reload movie to get updated average
    movie.value = await moviesStore.fetchMovie(movieId)
    if (movie.value) {
      movieRating.value.average_rating = parseFloat(movie.value.community_rating) || 0
      movieRating.value.ratings_count = parseInt(movie.value.community_count) || 0
    }
    
    // Reload reviews list
    await loadReviews()
    
    // Close modal and clear ref
    showDeleteModal.value = false
    reviewToDelete.value = null
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer cet avis',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isDeletingReview.value = false
  }
}

const handleReviewsPageChange = async (page: number) => {
  reviewsPage.value = page
  await loadReviews()
  
  // Scroll to reviews section
  const reviewsSection = document.querySelector('.bg-white.dark\\:bg-gray-900')
  if (reviewsSection) {
    reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleReviewsSortChange = async (sortBy: string) => {
  reviewsSortBy.value = sortBy
  reviewsPage.value = 1 // Reset to first page
  await loadReviews()
}

const getPosterUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const config = useRuntimeConfig()
  return `${config.public.apiUrl}${url}`
}

const getColorFromTitle = (title: string) => {
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ]
  const index = title.charCodeAt(0) % colors.length
  return colors[index]
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h${mins}min` : `${mins}min`
}

useHead(() => ({
  title: movie.value ? movie.value.title : 'Film'
}))
</script>
