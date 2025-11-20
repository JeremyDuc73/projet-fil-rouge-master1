import { describe, it, expect, beforeEach, vi } from 'vitest'
import authService from '../../../src/services/authService.js'
import userRepository from '../../../src/repositories/userRepository.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { userFactory } from '../../helpers/factories.js'

// Mock des dépendances
vi.mock('../../../src/repositories/userRepository.js')
vi.mock('bcrypt')
vi.mock('jsonwebtoken')

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = userFactory()
      const hashedPassword = 'hashedPassword123'
      const mockUser = { id: 1, ...userData, password: hashedPassword }

      userRepository.findByEmail.mockResolvedValue(null)
      bcrypt.hash.mockResolvedValue(hashedPassword)
      userRepository.createUser.mockResolvedValue(mockUser)

      // Act
      const result = await authService.register(userData)

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email)
      expect(bcrypt.hash).toHaveBeenCalled()
      expect(userRepository.createUser).toHaveBeenCalled()
      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
    })

    it('should throw error if email already exists', async () => {
      // Arrange
      const userData = userFactory()
      userRepository.findByEmail.mockResolvedValue({ id: 1, email: userData.email })

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Email already registered')
      expect(userRepository.createUser).not.toHaveBeenCalled()
    })

    it('should throw error with short password', async () => {
      // Arrange
      const userData = userFactory({ password: '123' })
      userRepository.findByEmail.mockResolvedValue(null)

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Password must be at least 6 characters')
    })
  })

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      // Arrange
      const password = 'Test123!@#'
      const hashedPassword = 'hashedPassword'
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user'
      }
      const mockAccessToken = 'access-token'
      const mockRefreshToken = 'refresh-token'

      userRepository.findByEmail.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)
      jwt.sign.mockReturnValueOnce(mockAccessToken).mockReturnValueOnce(mockRefreshToken)

      // Act
      const result = await authService.login(mockUser.email, password)

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email)
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword)
      expect(result).toEqual({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email
        }),
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      })
      expect(result.user.password).toBeUndefined()
    })

    it('should throw error with invalid credentials', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null)

      // Act & Assert
      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should throw error with wrong password', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword'
      }
      userRepository.findByEmail.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(false)

      // Act & Assert
      await expect(authService.login(mockUser.email, 'wrongpassword'))
        .rejects.toThrow('Invalid credentials')
    })
  })

  describe('refreshAccessToken', () => {
    it('should generate new access token with valid refresh token', async () => {
      // Arrange
      const userId = 1
      const mockUser = { id: userId, email: 'test@example.com', role: 'user', password: 'hash' }
      const refreshToken = 'valid-refresh-token'
      const mockAccessToken = 'new-access-token'

      jwt.verify.mockReturnValue({ id: userId })
      userRepository.findById.mockResolvedValue(mockUser)
      jwt.sign.mockReturnValue(mockAccessToken)

      // Act
      const result = await authService.refreshAccessToken(refreshToken)

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, expect.any(String))
      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(result).toEqual({
        accessToken: mockAccessToken
      })
      expect(result.user).toBeUndefined()
    })

    it('should throw error with invalid refresh token', async () => {
      // Arrange
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      // Act & Assert
      await expect(authService.refreshAccessToken('invalid-token'))
        .rejects.toThrow()
    })
  })
})
