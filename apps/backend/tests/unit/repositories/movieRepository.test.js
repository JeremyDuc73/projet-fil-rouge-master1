import { describe, it, expect, beforeEach, vi } from 'vitest'
import movieRepository from '../../../src/repositories/movieRepository.js'
import { query } from '../../../src/db.js'
import { movieFactory } from '../../helpers/factories.js'
import { mockDbResponse } from '../../helpers/db.helper.js'

// Mock de la fonction query
vi.mock('../../../src/db.js', () => ({
  query: vi.fn()
}))

describe('MovieRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findById', () => {
    it('should return a movie by id', async () => {
      // Arrange
      const mockMovie = { id: 1, ...movieFactory() }
      query.mockResolvedValue(mockDbResponse([mockMovie]))

      // Act
      const result = await movieRepository.findById(1)

      // Assert
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      )
      expect(result).toEqual(mockMovie)
    })

    it('should return null if movie not found', async () => {
      // Arrange
      query.mockResolvedValue(mockDbResponse([]))

      // Act
      const result = await movieRepository.findById(999)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('findAllWithFilters', () => {
    it('should return movies with pagination', async () => {
      // Arrange
      const mockMovies = [
        { id: 1, ...movieFactory() },
        { id: 2, ...movieFactory() }
      ]
      
      query
        .mockResolvedValueOnce(mockDbResponse([{ count: '10' }])) // COUNT query
        .mockResolvedValueOnce(mockDbResponse(mockMovies.map(m => ({ id: m.id })))) // IDs query
        .mockResolvedValueOnce(mockDbResponse(mockMovies)) // Details query

      // Act
      const result = await movieRepository.findAllWithFilters({
        page: 1,
        limit: 20
      })

      // Assert
      expect(result).toEqual({
        movies: mockMovies,
        pagination: {
          page: 1,
          limit: 20,
          total: 10,
          totalPages: 1
        }
      })
    })

    it('should filter by category', async () => {
      // Arrange
      const mockMovies = [{ id: 1, ...movieFactory() }]
      
      query
        .mockResolvedValueOnce(mockDbResponse([{ count: '1' }]))
        .mockResolvedValueOnce(mockDbResponse([{ id: 1 }]))
        .mockResolvedValueOnce(mockDbResponse(mockMovies))

      // Act
      await movieRepository.findAllWithFilters({
        category: 'action',
        page: 1,
        limit: 20
      })

      // Assert
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('c.slug = $1'),
        expect.arrayContaining(['action'])
      )
    })

    it('should filter by minimum rating', async () => {
      // Arrange
      query
        .mockResolvedValueOnce(mockDbResponse([{ count: '0' }]))
        .mockResolvedValueOnce(mockDbResponse([]))

      // Act
      await movieRepository.findAllWithFilters({
        min_rating: 7,
        page: 1,
        limit: 20
      })

      // Assert
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('m.tmdb_rating >= $1'),
        expect.arrayContaining([7])
      )
    })

    it('should sort by tmdb_rating with nulls last', async () => {
      // Arrange
      query
        .mockResolvedValueOnce(mockDbResponse([{ count: '0' }]))
        .mockResolvedValueOnce(mockDbResponse([]))

      // Act
      await movieRepository.findAllWithFilters({
        sortBy: 'tmdb_rating',
        order: 'DESC',
        page: 1,
        limit: 20
      })

      // Assert
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('CASE WHEN m.tmdb_rating = 0'),
        expect.any(Array)
      )
    })

    it('should search by title', async () => {
      // Arrange
      query
        .mockResolvedValueOnce(mockDbResponse([{ count: '0' }]))
        .mockResolvedValueOnce(mockDbResponse([]))

      // Act
      await movieRepository.findAllWithFilters({
        search: 'Matrix',
        page: 1,
        limit: 20
      })

      // Assert
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['%Matrix%'])
      )
    })
  })

  describe('create', () => {
    it('should create a new movie', async () => {
      // Arrange
      const movieData = movieFactory()
      const mockCreatedMovie = { id: 1, ...movieData, created_at: new Date() }
      query.mockResolvedValue(mockDbResponse([mockCreatedMovie]))

      // Act
      const result = await movieRepository.create(movieData)

      // Assert
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO movies'),
        expect.any(Array)
      )
      expect(result).toEqual(mockCreatedMovie)
    })
  })

  describe('update', () => {
    it('should update a movie', async () => {
      // Arrange
      const movieId = 1
      const updates = { title: 'Updated Title' }
      const mockUpdatedMovie = { id: movieId, ...movieFactory(), ...updates }
      query.mockResolvedValue(mockDbResponse([mockUpdatedMovie]))

      // Act
      const result = await movieRepository.update(movieId, updates)

      // Assert
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE movies'),
        expect.arrayContaining([movieId])
      )
      expect(result).toEqual(mockUpdatedMovie)
    })
  })

  describe('delete', () => {
    it('should delete a movie', async () => {
      // Arrange
      const movieId = 1
      const mockMovie = { id: movieId, title: 'Deleted Movie' }
      query.mockResolvedValue(mockDbResponse([mockMovie]))

      // Act
      const result = await movieRepository.delete(movieId)

      // Assert
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM movies'),
        [movieId]
      )
      expect(result).toEqual(mockMovie)
    })

    it('should return null if movie not found', async () => {
      // Arrange
      query.mockResolvedValue(mockDbResponse([]))

      // Act
      const result = await movieRepository.delete(999)

      // Assert
      expect(result).toBeNull()
    })
  })
})
