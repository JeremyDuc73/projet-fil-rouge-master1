// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  
  // Users
  PROFILE: '/users/me',
  
  // Movies
  MOVIES: '/movies',
  MOVIE: (id: number | string) => `/movies/${id}`,
  
  // Ratings
  RATINGS: '/ratings/me',
  RATE_MOVIE: (id: number | string) => `/ratings/movies/${id}`,
  
  // Favorites
  FAVORITES: '/favorites',
  ADD_FAVORITE: (id: number | string) => `/favorites/${id}`,
  
  // Watchlist
  WATCHLIST: '/watchlist',
  ADD_WATCHLIST: (id: number | string) => `/watchlist/${id}`,
  
  // History
  HISTORY: '/history',
} as const
