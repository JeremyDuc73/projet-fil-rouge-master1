import { defineStore } from 'pinia'

interface Rating {
  id: number
  user_id: number
  movie_id: number
  rating: number
  created_at: string
  updated_at: string
}

interface MovieRating {
  movie_id: number
  user_rating: number | null
  average_rating: number
  ratings_count: number
}

interface MovieWithRating {
  id: number
  title: string
  poster_url: string | null
  backdrop_url: string | null
  release_date: string
  rating: number
  rated_at: string
}

interface RatingsState {
  myRatings: Record<number, number> // movieId -> rating
  ratedMovies: MovieWithRating[] // Full list of rated movies
  movieRatings: Record<number, MovieRating> // movieId -> stats
  isLoading: boolean
}

export const useRatingsStore = defineStore('ratings', {
  state: (): RatingsState => ({
    myRatings: {},
    ratedMovies: [],
    movieRatings: {},
    isLoading: false
  }),

  getters: {
    getMyRating: (state) => (movieId: number) => {
      return state.myRatings[movieId] || null
    },

    getMovieRating: (state) => (movieId: number) => {
      return state.movieRatings[movieId] || null
    }
  },

  actions: {
    // Fetch my rating for a specific movie
    async fetchMyRatingForMovie(movieId: number) {
      const api = useApi()

      try {
        const response = await api.get<any>(`/ratings/movies/${movieId}/me`)
        if (response.success && response.data) {
          this.myRatings[movieId] = response.data.rating
          return response.data.rating
        }
      } catch (error) {
        // User hasn't rated yet
        this.myRatings[movieId] = 0
      }
      return null
    },

    // Fetch movie ratings stats
    async fetchMovieRatings(movieId: number) {
      const api = useApi()

      try {
        const response = await api.get<any>(`/ratings/movies/${movieId}`)
        if (response.success && response.data) {
          this.movieRatings[movieId] = {
            movie_id: movieId,
            user_rating: response.data.userRating || null,
            average_rating: parseFloat(response.data.averageRating) || 0,
            ratings_count: response.data.ratingsCount || 0
          }
          return this.movieRatings[movieId]
        }
      } catch (error) {
        console.error('Error fetching movie ratings:', error)
      }
      return null
    },

    // Add or update rating
    async rateMovie(movieId: number, rating: number) {
      const api = useApi()

      try {
        const response = await api.post<any>(`/ratings/movies/${movieId}`, { rating })
        
        if (response.success) {
          this.myRatings[movieId] = rating
          
          // Update in rated movies list if exists
          const existingIndex = this.ratedMovies.findIndex(m => m.id === movieId)
          if (existingIndex !== -1) {
            this.ratedMovies[existingIndex].rating = rating
          } else {
            // Refresh the entire list to get the new rated movie
            await this.fetchMyRatings()
          }
          
          // Refresh movie ratings stats
          await this.fetchMovieRatings(movieId)
          
          return true
        }
      } catch (error: any) {
        console.error('Error rating movie:', error)
        throw error
      }
      return false
    },

    // Delete rating
    async deleteRating(movieId: number) {
      const api = useApi()

      try {
        const response = await api.delete<any>(`/ratings/movies/${movieId}`)
        
        if (response.success) {
          delete this.myRatings[movieId]
          
          // Remove from rated movies list
          this.ratedMovies = this.ratedMovies.filter(movie => movie.id !== movieId)
          
          // Refresh movie ratings stats
          await this.fetchMovieRatings(movieId)
          
          return true
        }
      } catch (error) {
        console.error('Error deleting rating:', error)
        throw error
      }
      return false
    },

    // Fetch all my ratings
    async fetchMyRatings() {
      this.isLoading = true
      const api = useApi()

      try {
        const response = await api.get<any>('/ratings/me')
        if (response.success && response.data) {
          // Store full movie data with ratings
          this.ratedMovies = response.data.map((item: any) => ({
            id: item.movie_id,
            title: item.title,
            poster_url: item.poster_url,
            backdrop_url: null, // Not returned by API
            release_date: item.release_date,
            rating: item.rating,
            rated_at: item.created_at
          }))
          
          // Also convert array to map for quick lookup
          this.myRatings = {}
          response.data.forEach((rating: any) => {
            this.myRatings[rating.movie_id] = rating.rating
          })
        }
      } catch (error) {
        console.error('Error fetching my ratings:', error)
      } finally {
        this.isLoading = false
      }
    }
  }
})
