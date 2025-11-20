export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const favoritesStore = useFavoritesStore()
  const watchlistStore = useWatchlistStore()
  const reviewsStore = useReviewsStore()

  // Initialize auth from localStorage
  authStore.initAuth()

  // If authenticated, load user data
  if (authStore.isAuthenticated && process.client && localStorage.getItem('auth_token')) {
    try {
      // Load favorites, watchlist and reviews in parallel
      await Promise.all([
        favoritesStore.fetchFavorites(),
        watchlistStore.fetchWatchlist(),
        reviewsStore.fetchMyReviews()
      ])
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }
})
