import { defineStore } from 'pinia'
import type { Movie } from '@/utils/types'

interface FavoritesState {
  favorites: Movie[]
  favoriteIds: number[]
  isLoading: boolean
}

export const useFavoritesStore = defineStore('favorites', {
  state: (): FavoritesState => ({
    favorites: [],
    favoriteIds: [],
    isLoading: false
  }),

  getters: {
    isFavorite: (state) => (movieId: number) => {
      return state.favoriteIds.includes(movieId)
    },

    count: (state) => state.favorites.length
  },

  actions: {
    // Fetch all favorites
    async fetchFavorites() {
      this.isLoading = true
      const api = useApi()

      try {
        const response = await api.get<any>('/favorites')
        if (response.success && response.data) {
          this.favorites = response.data
          this.favoriteIds = response.data.map((m: Movie) => m.id)
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Add to favorites
    async addFavorite(movieId: number) {
      const api = useApi()

      try {
        const response = await api.post<any>(`/favorites/${movieId}`)
        
        if (response.success) {
          if (!this.favoriteIds.includes(movieId)) {
            this.favoriteIds.push(movieId)
          }
          
          // Refetch to get full movie data
          await this.fetchFavorites()
          
          return true
        }
      } catch (error: any) {
        console.error('Error adding favorite:', error)
        throw error
      }
      return false
    },

    // Remove from favorites
    async removeFavorite(movieId: number) {
      const api = useApi()

      try {
        const response = await api.delete<any>(`/favorites/${movieId}`)
        if (response.success) {
          this.favoriteIds = this.favoriteIds.filter(id => id !== movieId)
          this.favorites = this.favorites.filter(m => m.id !== movieId)
          return true
        }
      } catch (error) {
        console.error('Error removing favorite:', error)
        throw error
      }
      return false
    },

    // Toggle favorite
    async toggleFavorite(movieId: number) {
      if (this.isFavorite(movieId)) {
        return await this.removeFavorite(movieId)
      } else {
        return await this.addFavorite(movieId)
      }
    },

    // Check if movie is favorite
    async checkFavorite(movieId: number) {
      const api = useApi()

      try {
        const response = await api.get<any>(`/favorites/${movieId}/check`)
        if (response.success && response.data) {
          if (response.data.isFavorite) {
            if (!this.favoriteIds.includes(movieId)) {
              this.favoriteIds.push(movieId)
            }
          } else {
            this.favoriteIds = this.favoriteIds.filter(id => id !== movieId)
          }
          return response.data.isFavorite
        }
      } catch (error) {
        console.error('Error checking favorite:', error)
      }
      return false
    }
  }
})
