// User types
export interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  role: 'user' | 'premium' | 'admin' | 'super_admin'
  created_at: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

// Movie types
export interface Category {
  id: number
  name: string
  slug: string
}

export interface MovieImage {
  id: number
  url: string
  type: 'backdrop' | 'poster'
}

export interface Movie {
  id: number
  tmdb_id?: number
  title: string
  description: string
  release_date: string
  duration: number
  poster_url: string | null
  backdrop_url: string | null
  average_rating: string
  ratings_count: string
  community_average_rating?: number
  community_ratings_count?: number
  categories: Category[]
  gallery?: MovieImage[]
  status?: 'to_watch' | 'watched' | 'dropped' // Watchlist status
  added_at?: string // When added to watchlist
}

export interface Rating {
  id: number
  user_id: number
  movie_id: number
  rating: number
  review: string | null
  created_at: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword?: string
  firstname: string
  lastname: string
}
