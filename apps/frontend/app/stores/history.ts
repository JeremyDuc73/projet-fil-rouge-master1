import { defineStore } from 'pinia'
import type { Movie } from '@/utils/types'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    history: [] as (Movie & { viewed_at: string; view_count: number })[],
    isLoading: false,
    hasTracked: new Set<number>() // Track which movies have been tracked this session
  }),

  actions: {
    async trackView(movieId: number) {
      // Prevent duplicate tracking in the same session
      if (this.hasTracked.has(movieId)) {
        return
      }

      try {
        const api = useApi()
        await api.post(`/history/${movieId}`)
        this.hasTracked.add(movieId)
      } catch (error) {
        console.error('Failed to track view:', error)
        // Silently fail - tracking shouldn't block the user
      }
    },

    async fetchHistory(options = { limit: 20, offset: 0 }) {
      this.isLoading = true
      try {
        const api = useApi()
        const response = await api.get('/history', { params: options })
        this.history = response.data
        return response.data
      } catch (error) {
        console.error('Failed to fetch history:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async clearHistory() {
      try {
        const api = useApi()
        await api.delete('/history')
        this.history = []
        this.hasTracked.clear()
      } catch (error) {
        console.error('Failed to clear history:', error)
        throw error
      }
    },

    // Clear session tracking (called on logout)
    clearSessionTracking() {
      this.hasTracked.clear()
    }
  }
})
