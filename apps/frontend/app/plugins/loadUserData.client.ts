export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const favoritesStore = useFavoritesStore()
  const watchlistStore = useWatchlistStore()
  const reviewsStore = useReviewsStore()

  authStore.initAuth()

  if (authStore.isAuthenticated && process.client && localStorage.getItem('auth_token')) {
    try {
      await authStore.fetchUser()
      await Promise.all([
        favoritesStore.fetchFavorites(),
        watchlistStore.fetchWatchlist(),
        reviewsStore.fetchMyReviews(),
      ])
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }
})
