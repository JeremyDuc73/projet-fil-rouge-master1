export class ApiClient {
  private baseURL: string
  private isHandlingUnauthorized = false

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getToken(): string | null {
    if (process.client) {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  private handleUnauthorized() {
    if (process.client && !this.isHandlingUnauthorized) {
      this.isHandlingUnauthorized = true
      
      // Clear auth state using the store
      const authStore = useAuthStore()
      authStore.clearAuth()
      
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
      
      // Show notification (only once)
      const toast = useToast()
      toast.add({
        title: 'Session expirée',
        description: 'Veuillez vous reconnecter',
        color: 'orange',
        icon: 'ph:warning'
      })
      
      // Redirect to login
      navigateTo('/auth/login')
      
      // Reset flag after a short delay
      setTimeout(() => {
        this.isHandlingUnauthorized = false
      }, 1000)
    }
  }

  async request<T>(endpoint: string, options: any = {}): Promise<T> {
    const token = this.getToken()
    
    try {
      const response = await $fetch<T>(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      return response
    } catch (error: any) {
      // Handle 401 Unauthorized
      if (error?.status === 401 || error?.statusCode === 401) {
        this.handleUnauthorized()
      }
      throw error
    }
  }

  get<T>(endpoint: string, config?: { params?: any, headers?: any }): Promise<T> {
    const options: any = { method: 'GET' }
    
    // $fetch utilise 'query' au lieu de 'params' pour les paramètres d'URL
    if (config?.params) {
      options.query = config.params
    }
    
    if (config?.headers) {
      options.headers = config.headers
    }
    
    return this.request<T>(endpoint, options)
  }

  post<T>(endpoint: string, body?: any, config?: { headers?: any }): Promise<T> {
    const options: any = { method: 'POST', body }
    
    if (config?.headers) {
      options.headers = config.headers
    }
    
    return this.request<T>(endpoint, options)
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}
