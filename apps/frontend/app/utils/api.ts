import { API_ENDPOINTS } from './constants'

// Global flag to prevent multiple unauthorized handlers
let isHandlingUnauthorized = false

let refreshInFlight: Promise<string | null> | null = null

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/movies', '/auth/login', '/auth/register']

function tryRefreshAccessToken(baseURL: string): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight
  if (!process.client) return Promise.resolve(null)

  const refreshToken = localStorage.getItem('auth_refresh_token')
  if (!refreshToken) return Promise.resolve(null)

  refreshInFlight = (async (): Promise<string | null> => {
    try {
      const res = await $fetch<{
        success: boolean
        data?: { accessToken: string }
      }>(`${baseURL}${API_ENDPOINTS.REFRESH}`, {
        method: 'POST',
        body: { refreshToken },
      })
      if (res?.success && res?.data?.accessToken) {
        const authStore = useAuthStore()
        authStore.updateAccessToken(res.data.accessToken)
        return res.data.accessToken
      }
      return null
    } catch {
      return null
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

function isCredentialFailureEndpoint(endpoint: string): boolean {
  return endpoint === API_ENDPOINTS.LOGIN || endpoint === API_ENDPOINTS.REGISTER
}

export class ApiClient {
  private baseURL: string

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
    if (process.client && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true

      const authStore = useAuthStore()
      authStore.clearAuth()

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

      const toast = useToast()
      toast.add({
        title: 'Session expirée',
        description: 'Veuillez vous reconnecter',
        color: 'orange',
        icon: 'ph:warning',
      })

      const router = useRouter()
      const currentPath = router.currentRoute.value.path

      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => currentPath === route || currentPath.startsWith('/movies/')
      )

      if (!isPublicRoute) {
        navigateTo('/auth/login')
      }

      setTimeout(() => {
        isHandlingUnauthorized = false
      }, 3000)
    }
  }

  private async request<T>(endpoint: string, options: any = {}, isRetry = false): Promise<T> {
    const token = this.getToken()

    try {
      return await $fetch<T>(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    } catch (error: any) {
      const is401 = error?.status === 401 || error?.statusCode === 401
      if (!is401) throw error

      if (isCredentialFailureEndpoint(endpoint)) {
        throw error
      }

      if (isRetry) {
        this.handleUnauthorized()
        throw error
      }

      const newToken = await tryRefreshAccessToken(this.baseURL)
      if (newToken) {
        return this.request<T>(endpoint, options, true)
      }

      this.handleUnauthorized()
      throw error
    }
  }

  get<T>(endpoint: string, config?: { params?: any, headers?: any }): Promise<T> {
    const options: any = { method: 'GET' }

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
