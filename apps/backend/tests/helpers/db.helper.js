import { query } from '../../src/db.js'

/**
 * Helper pour mocker les réponses de la DB
 */
export const mockDbResponse = (rows = [], rowCount = null) => ({
  rows,
  rowCount: rowCount ?? rows.length,
  command: 'SELECT',
  oid: null,
  fields: []
})

/**
 * Helper pour créer un mock de query
 */
export const createQueryMock = (returnValue) => {
  return jest.fn().mockResolvedValue(returnValue)
}

/**
 * Clean test database (à utiliser avec précaution)
 */
export const cleanTestDb = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('cleanTestDb can only be used in test environment')
  }
  
  await query('TRUNCATE users, movies, categories, movie_categories, reviews, favorites, watchlist, history RESTART IDENTITY CASCADE')
}

/**
 * Create test user
 */
export const createTestUser = async (userData = {}) => {
  const result = await query(
    `INSERT INTO users (email, password, first_name, last_name, role) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [
      userData.email || 'test@example.com',
      userData.password || '$2b$10$testhashedpassword',
      userData.first_name || 'Test',
      userData.last_name || 'User',
      userData.role || 'user'
    ]
  )
  return result.rows[0]
}

/**
 * Create test movie
 */
export const createTestMovie = async (movieData = {}) => {
  const result = await query(
    `INSERT INTO movies (title, description, release_date, duration, poster_url) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [
      movieData.title || 'Test Movie',
      movieData.description || 'Test description',
      movieData.release_date || '2024-01-01',
      movieData.duration || 120,
      movieData.poster_url || '/test-poster.jpg'
    ]
  )
  return result.rows[0]
}
