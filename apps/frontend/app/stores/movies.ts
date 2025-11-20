import { defineStore } from 'pinia'
import type { Movie, Category } from '@/utils/types'

interface MoviesState {
  movies: Movie[]
  categories: Category[]
  featuredMovie: Movie | null
  filters: {
    category: string | null
    minRating: number | null
    search: string
    sortBy: string
    order: 'ASC' | 'DESC'
  }
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  isLoading: boolean
  isLoadingMore: boolean
}

export const useMoviesStore = defineStore('movies', {
  state: (): MoviesState => ({
    movies: [],
    categories: [],
    featuredMovie: null,
    filters: {
      category: null,
      minRating: null,
      search: '',
      sortBy: 'created_at',
      order: 'DESC'
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      hasMore: true
    },
    isLoading: false,
    isLoadingMore: false
  }),

  getters: {
    moviesByCategory: (state) => (categorySlug: string) => {
      return state.movies.filter(movie => 
        movie.categories?.some(cat => cat.slug === categorySlug)
      )
    },

    filteredMovies: (state) => {
      let filtered = [...state.movies]

      if (state.filters.category) {
        filtered = filtered.filter(movie =>
          movie.categories?.some(cat => cat.slug === state.filters.category)
        )
      }

      if (state.filters.minRating) {
        filtered = filtered.filter(movie =>
          (movie.average_rating || 0) >= state.filters.minRating!
        )
      }

      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        filtered = filtered.filter(movie =>
          movie.title.toLowerCase().includes(search) ||
          movie.description?.toLowerCase().includes(search)
        )
      }

      return filtered
    }
  },

  actions: {
    // Fetch all movies with filters and pagination
    async fetchMovies(reset = false) {
      if (reset) {
        this.pagination.page = 1
        this.movies = []
        this.isLoading = true
      } else {
        this.isLoadingMore = true
      }

      const api = useApi()

      try {
        const params: any = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: this.filters.sortBy,
          order: this.filters.order
        }

        if (this.filters.category) {
          params.category = this.filters.category
        }
        if (this.filters.minRating) {
          params.min_rating = this.filters.minRating
        }
        if (this.filters.search) {
          params.search = this.filters.search
        }

        const queryString = new URLSearchParams(params).toString()
        const response = await api.get<any>(`/movies?${queryString}`)

        if (response.success && response.data) {
          // response.data is directly the array of movies
          let moviesData = Array.isArray(response.data) ? response.data : []
          
          // Convert average_rating from string to number
          moviesData = moviesData.map((movie: any) => ({
            ...movie,
            average_rating: movie.average_rating ? parseFloat(movie.average_rating) : 0,
            ratings_count: movie.ratings_count ? parseInt(movie.ratings_count) : 0
          }))
          
          if (reset) {
            this.movies = moviesData
          } else {
            this.movies = [...this.movies, ...moviesData]
          }

          // Pagination is at the root level, not in data
          if (response.pagination) {
            this.pagination.total = response.pagination.total || 0
            this.pagination.hasMore = response.pagination.page < response.pagination.totalPages
          } else {
            this.pagination.total = this.movies.length
            this.pagination.hasMore = false
          }

          // Set featured movie (first one or random)
          if (reset && this.movies.length > 0 && !this.featuredMovie) {
            this.featuredMovie = this.movies[0]
          }
        }
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        this.isLoading = false
        this.isLoadingMore = false
      }
    },

    // Load more movies (infinite scroll)
    async loadMore() {
      if (!this.pagination.hasMore || this.isLoadingMore) {
        return
      }

      this.pagination.page++
      await this.fetchMovies(false)
    },

    // Fetch a single movie by ID
    async fetchMovie(id: number) {
      const api = useApi()
      try {
        const response = await api.get<any>(`/movies/${id}`)
        if (response.success && response.data) {
          // response.data is directly the movie object
          return response.data
        }
      } catch (error) {
        console.error('Error fetching movie:', error)
      }
      return null
    },

    // Fetch all categories
    async fetchCategories() {
      const api = useApi()
      try {
        const response = await api.get<any>('/categories')
        if (response.success) {
          this.categories = response.data
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    },

    // Set filter
    setFilter(key: keyof MoviesState['filters'], value: any) {
      this.filters[key] = value as never
      this.fetchMovies(true)
    },

    // Clear filters
    clearFilters() {
      this.filters = {
        category: null,
        minRating: null,
        search: '',
        sortBy: 'created_at',
        order: 'DESC'
      }
      this.fetchMovies(true)
    },

    // Set featured movie
    setFeaturedMovie(movie: Movie) {
      this.featuredMovie = movie
    }
  }
})
