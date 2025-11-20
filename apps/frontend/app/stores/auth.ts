import { defineStore } from 'pinia'
import type { User, LoginForm, RegisterForm } from '@/utils/types'
import { API_ENDPOINTS } from '@/utils/constants'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  getters: {
    fullName: (state) => {
      if (!state.user) return ''
      return `${state.user.firstname} ${state.user.lastname}`
    },
    isAdmin: (state) => state.user?.role === 'admin' || state.user?.role === 'super_admin',
    isPremium: (state) => state.user?.role === 'premium' || state.user?.role === 'admin' || state.user?.role === 'super_admin',
  },

  actions: {
    // Set auth data
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
      this.isAuthenticated = true
      
      if (process.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },

    // Clear auth data
    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    },

    // Initialize auth from localStorage
    initAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('auth_user')
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            this.user = user
            this.token = token
            this.isAuthenticated = true
          } catch (error) {
            this.clearAuth()
          }
        }
      }
    },

    // Login
    async login(credentials: LoginForm) {
      this.isLoading = true
      const api = useApi()

      try {
        const response = await api.post<any>(API_ENDPOINTS.LOGIN, credentials)

        if (response.success && response.data) {
          this.setAuth(response.data.user, response.data.accessToken)
          
          // Load user favorites, watchlist and reviews
          const favoritesStore = useFavoritesStore()
          const watchlistStore = useWatchlistStore()
          const reviewsStore = useReviewsStore()
          await Promise.all([
            favoritesStore.fetchFavorites(),
            watchlistStore.fetchWatchlist(),
            reviewsStore.fetchMyReviews()
          ])
          
          return true
        }

        throw new Error('Erreur de connexion')
      } catch (error: any) {
        const message = error?.data?.error || 'Erreur lors de la connexion'
        throw new Error(message)
      } finally {
        this.isLoading = false
      }
    },

    // Register
    async register(data: RegisterForm) {
      this.isLoading = true
      const api = useApi()

      try {
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...registerData } = data
        const response = await api.post<any>(API_ENDPOINTS.REGISTER, registerData)

        if (response.success && response.data) {
          this.setAuth(response.data.user, response.data.accessToken)
          
          // Initialize empty favorites and watchlist
          const favoritesStore = useFavoritesStore()
          const watchlistStore = useWatchlistStore()
          favoritesStore.favorites = []
          favoritesStore.favoriteIds = []
          watchlistStore.watchlist = []
          watchlistStore.watchlistIds = []
          
          return true
        }

        throw new Error('Erreur d\'inscription')
      } catch (error: any) {
        const message = error?.data?.error || 'Erreur lors de l\'inscription'
        throw new Error(message)
      } finally {
        this.isLoading = false
      }
    },

    // Logout
    async logout() {
      const api = useApi()

      try {
        await api.post(API_ENDPOINTS.LOGOUT)
      } catch (error) {
        // Ignore logout errors
      }

      this.clearAuth()
      
      // Clear user stores
      const favoritesStore = useFavoritesStore()
      const watchlistStore = useWatchlistStore()
      const reviewsStore = useReviewsStore()
      favoritesStore.favorites = []
      favoritesStore.favoriteIds = []
      watchlistStore.watchlist = []
      watchlistStore.watchlistIds = []
      reviewsStore.myReviews = []
      reviewsStore.movieReviews = {}
      reviewsStore.myReviewForMovie = {}

      navigateTo('/auth/login')
    },

    // Fetch current user
    async fetchUser() {
      const api = useApi()

      try {
        const response = await api.get<any>(API_ENDPOINTS.PROFILE)

        if (response.success && response.data) {
          this.user = response.data
          if (process.client) {
            localStorage.setItem('auth_user', JSON.stringify(response.data))
          }
        }
      } catch (error) {
        this.clearAuth()
      }
    },
  },
})
