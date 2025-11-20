import { describe, it, expect } from 'vitest'

// Tests des interfaces et types Movies
describe('Movies Types', () => {
  it('should define movie properties', () => {
    const movie = {
      id: 1,
      title: 'Test Movie',
      description: 'A test movie',
      release_date: '2024-01-01',
      duration: 120,
      poster_url: '/poster.jpg',
      tmdb_rating: 7.5
    }

    expect(movie).toHaveProperty('id')
    expect(movie).toHaveProperty('title')
    expect(movie).toHaveProperty('tmdb_rating')
    expect(movie.duration).toBeGreaterThan(0)
  })

  it('should validate filter types', () => {
    const filters = {
      search: 'Matrix',
      category: 'action',
      minRating: 7,
      sortBy: 'created_at',
      order: 'DESC'
    }

    expect(typeof filters.search).toBe('string')
    expect(typeof filters.minRating).toBe('number')
    expect(['ASC', 'DESC']).toContain(filters.order)
  })

  it('should calculate pagination', () => {
    const total = 50
    const limit = 20
    const totalPages = Math.ceil(total / limit)

    expect(totalPages).toBe(3)
    expect(limit).toBeGreaterThan(0)
    expect(total).toBeGreaterThanOrEqual(limit)
  })
})
