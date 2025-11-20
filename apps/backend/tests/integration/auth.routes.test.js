import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import { query } from '../../src/db.js'
import bcrypt from 'bcrypt'
import { userFactory } from '../helpers/factories.js'

// Mock de la DB pour les tests d'intégration
vi.mock('../../src/db.js', () => ({
  query: vi.fn()
}))

describe('Auth Routes Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = userFactory()
      const mockUser = {
        id: 1,
        ...userData,
        password: await bcrypt.hash(userData.password, 10),
        created_at: new Date()
      }

      query
        .mockResolvedValueOnce({ rows: [] }) // findByEmail returns null
        .mockResolvedValueOnce({ rows: [mockUser] }) // createUser returns user

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data).toHaveProperty('accessToken')
      expect(response.body.data).toHaveProperty('refreshToken')
      expect(response.body.data.user).not.toHaveProperty('password')
      expect(response.body.data.user.email).toBe(userData.email)
    })

    it('should return 400 if required fields are missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#'
          // firstname and lastname missing
        })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 if password is weak', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123', // Too weak
          firstname: 'Test',
          lastname: 'User'
        })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 409 if email already exists', async () => {
      // Arrange
      const userData = userFactory()
      query.mockResolvedValueOnce({ rows: [{ id: 1, email: userData.email }] })

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)

      // Assert
      expect(response.status).toBe(409)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('already')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      // Arrange
      const password = 'Test123!@#'
      const hashedPassword = await bcrypt.hash(password, 10)
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        first_name: 'Test',
        last_name: 'User',
        role: 'user'
      }

      query.mockResolvedValueOnce({ rows: [mockUser] })

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: password
        })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data).toHaveProperty('accessToken')
      expect(response.body.data).toHaveProperty('refreshToken')
      expect(response.body.data.user.email).toBe(mockUser.email)
      expect(response.body.data.user).not.toHaveProperty('password')
    })

    it('should return 401 with invalid credentials', async () => {
      // Arrange
      query.mockResolvedValueOnce({ rows: [] })

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPassword123'
        })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 if required fields are missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // password missing
        })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should return new tokens with valid refresh token', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'user'
      }

      // First, login to get a refresh token
      const password = 'Test123!@#'
      const hashedPassword = await bcrypt.hash(password, 10)
      query
        .mockResolvedValueOnce({ rows: [{ ...mockUser, password: hashedPassword }] })
        .mockResolvedValueOnce({ rows: [mockUser] }) // For refresh

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: password
        })

      const refreshToken = loginResponse.body.data.refreshToken

      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('accessToken')
    })

    it('should return 401 with invalid refresh token', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })
  })
})
