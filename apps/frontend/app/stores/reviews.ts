import { defineStore } from 'pinia'

interface Review {
  id: number
  user_id: number
  movie_id: number
  rating: number
  review_text: string
  firstname: string
  lastname: string
  created_at: string
  updated_at: string
}

interface MovieReviewsData {
  reviews: Review[]
  total: number
  page: number
  totalPages: number
}

interface ReviewsState {
  movieReviews: Record<number, MovieReviewsData> // movieId -> reviews data
  myReviews: Review[]
  myReviewForMovie: Record<number, Review | null> // movieId -> my review
  isLoading: boolean
}

export const useReviewsStore = defineStore('reviews', {
  state: (): ReviewsState => ({
    movieReviews: {},
    myReviews: [],
    myReviewForMovie: {},
    isLoading: false
  }),

  getters: {
    getMovieReviews: (state) => (movieId: number) => {
      return state.movieReviews[movieId] || null
    },

    getMyReviewForMovie: (state) => (movieId: number) => {
      return state.myReviewForMovie[movieId] || null
    }
  },

  actions: {
    // Fetch reviews for a specific movie
    async fetchMovieReviews(movieId: number, options = {}) {
      const api = useApi()
      const { page = 1, limit = 10, sortBy = 'recent' } = options as any

      try {
        const offset = (page - 1) * limit
        const response = await api.get<any>(`/reviews/movies/${movieId}`, {
          params: { limit, offset, sortBy }
        })

        if (response.success && response.data) {
          this.movieReviews[movieId] = response.data
          return response.data
        }
      } catch (error) {
        console.error('Error fetching movie reviews:', error)
      }
      return null
    },

    // Fetch my review for a specific movie
    async fetchMyReviewForMovie(movieId: number) {
      const api = useApi()

      try {
        const response = await api.get<any>(`/reviews/movies/${movieId}/me`)
        if (response.success && response.data) {
          this.myReviewForMovie[movieId] = response.data
          return response.data
        }
      } catch (error) {
        // User hasn't reviewed yet
        this.myReviewForMovie[movieId] = null
      }
      return null
    },

    // Create a review
    async createReview(movieId: number, reviewData: { rating: number; reviewText: string }) {
      const api = useApi()

      try {
        const response = await api.post<any>(`/reviews/movies/${movieId}`, reviewData)
        
        if (response.success && response.data) {
          this.myReviewForMovie[movieId] = response.data
          
          // Refresh movie reviews
          await this.fetchMovieReviews(movieId)
          
          return true
        }
      } catch (error: any) {
        console.error('Error creating review:', error)
        throw error
      }
      return false
    },

    // Update a review
    async updateReview(reviewId: number, movieId: number, reviewData: { rating: number; reviewText: string }) {
      const api = useApi()

      try {
        const response = await api.put<any>(`/reviews/${reviewId}`, reviewData)
        
        if (response.success && response.data) {
          this.myReviewForMovie[movieId] = response.data
          
          // Refresh movie reviews
          await this.fetchMovieReviews(movieId)
          
          return true
        }
      } catch (error: any) {
        console.error('Error updating review:', error)
        throw error
      }
      return false
    },

    // Delete a review
    async deleteReview(reviewId: number, movieId: number) {
      const api = useApi()

      try {
        const response = await api.delete<any>(`/reviews/${reviewId}`)
        
        if (response.success) {
          this.myReviewForMovie[movieId] = null
          
          // Remove from myReviews list (for ratings page)
          const index = this.myReviews.findIndex((r: any) => r.id === reviewId)
          if (index !== -1) {
            this.myReviews.splice(index, 1)
          }
          
          // Refresh movie reviews
          await this.fetchMovieReviews(movieId)
          
          return true
        }
      } catch (error) {
        console.error('Error deleting review:', error)
        throw error
      }
      return false
    },

    // Fetch all my reviews
    async fetchMyReviews() {
      this.isLoading = true
      const api = useApi()

      try {
        const response = await api.get<any>('/reviews/me')
        if (response.success && response.data) {
          this.myReviews = response.data
        }
      } catch (error) {
        console.error('Error fetching my reviews:', error)
      } finally {
        this.isLoading = false
      }
    }
  }
})
