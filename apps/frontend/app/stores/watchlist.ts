import { defineStore } from 'pinia'
import type { Movie } from '@/utils/types'

interface WatchlistState {
  watchlist: Movie[]
  watchlistIds: number[]
  isLoading: boolean
  stats: {
    to_watch: number
    watched: number
    dropped: number
  }
}

export const useWatchlistStore = defineStore('watchlist', {
  state: (): WatchlistState => ({
    watchlist: [],
    watchlistIds: [],
    isLoading: false,
    stats: {
      to_watch: 0,
      watched: 0,
      dropped: 0
    }
  }),

  getters: {
    isInWatchlist: (state) => (movieId: number) => {
      return state.watchlistIds.includes(movieId)
    },

    count: (state) => state.watchlist.length,

    getMovieStatus: (state) => (movieId: number) => {
      const movie = state.watchlist.find(m => m.id === movieId)
      return movie?.status || null
    },

    watchlistByStatus: (state) => (status: string) => {
      return state.watchlist.filter(m => m.status === status)
    }
  },

  actions: {
    // Fetch all watchlist
    async fetchWatchlist(status?: string) {
      this.isLoading = true
      const api = useApi()

      try {
        const params = status ? { status } : {}
        const response = await api.get<any>('/watchlist', { params })
        if (response.success && response.data) {
          this.watchlist = response.data
          this.watchlistIds = response.data.map((m: Movie) => m.id)
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Fetch watchlist stats
    async fetchStats() {
      const api = useApi()

      try {
        const response = await api.get<any>('/watchlist/stats')
        if (response.success && response.data) {
          this.stats = response.data
        }
      } catch (error) {
        console.error('Error fetching watchlist stats:', error)
      }
    },

    // Add to watchlist
    async addToWatchlist(movieId: number) {
      const api = useApi()

      try {
        const response = await api.post<any>(`/watchlist/${movieId}`)
        if (response.success) {
          if (!this.watchlistIds.includes(movieId)) {
            this.watchlistIds.push(movieId)
          }
          
          // Refetch to get full movie data
          await this.fetchWatchlist()
          
          return true
        }
      } catch (error: any) {
        console.error('Error adding to watchlist:', error)
        throw error
      }
      return false
    },

    // Remove from watchlist
    async removeFromWatchlist(movieId: number) {
      const api = useApi()

      try {
        const response = await api.delete<any>(`/watchlist/${movieId}`)
        if (response.success) {
          this.watchlistIds = this.watchlistIds.filter(id => id !== movieId)
          this.watchlist = this.watchlist.filter(m => m.id !== movieId)
          return true
        }
      } catch (error) {
        console.error('Error removing from watchlist:', error)
        throw error
      }
      return false
    },

    // Toggle watchlist
    async toggleWatchlist(movieId: number) {
      if (this.isInWatchlist(movieId)) {
        return await this.removeFromWatchlist(movieId)
      } else {
        return await this.addToWatchlist(movieId)
      }
    },

    // Update status
    async updateStatus(movieId: number, status: 'to_watch' | 'watched' | 'dropped') {
      const api = useApi()

      try {
        const response = await api.patch<any>(`/watchlist/${movieId}/status`, { status })
        if (response.success) {
          // Update local state
          const movie = this.watchlist.find(m => m.id === movieId)
          if (movie) {
            movie.status = status
          }
          
          // Refresh stats
          await this.fetchStats()
          
          return true
        }
      } catch (error) {
        console.error('Error updating watchlist status:', error)
        throw error
      }
      return false
    }
  }
})
