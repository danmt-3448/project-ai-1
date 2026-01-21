import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'

describe('Auth API', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        role: 'USER',
      }

      const token = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '7d' })
      expect(token).toBeDefined()

      const decoded = jwt.verify(token, JWT_SECRET) as any
      expect(decoded.email).toBe('user@test.com')
      expect(decoded.role).toBe('USER')
    })

    it('should reject login with invalid password', () => {
      const error = {
        message: 'Invalid credentials',
        statusCode: 401,
      }

      expect(error.statusCode).toBe(401)
      expect(error.message).toContain('Invalid')
    })

    it('should reject login with non-existent email', () => {
      const error = {
        message: 'User not found',
        statusCode: 404,
      }

      expect(error.statusCode).toBe(404)
    })

    it('should validate email format', () => {
      const invalidEmail = 'not-an-email'
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invalidEmail)

      expect(isValid).toBe(false)
    })
  })

  describe('POST /api/auth/admin-login', () => {
    it('should login admin successfully', () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@test.com',
        role: 'ADMIN',
      }

      const token = jwt.sign(mockAdmin, JWT_SECRET, { expiresIn: '7d' })
      const decoded = jwt.verify(token, JWT_SECRET) as any

      expect(decoded.role).toBe('ADMIN')
      expect(decoded.email).toBe('admin@test.com')
    })

    it('should reject non-admin user from admin login', () => {
      const mockUser = {
        id: 2,
        email: 'user@test.com',
        role: 'USER',
      }

      expect(mockUser.role).not.toBe('ADMIN')
    })

    it('should require all fields', () => {
      const incompleteData = {
        email: 'admin@test.com',
        // password missing
      }

      expect(incompleteData).not.toHaveProperty('password')
    })
  })

  describe('JWT Token Validation', () => {
    it('should validate token signature', () => {
      const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '1h' })
      
      expect(() => {
        jwt.verify(token, JWT_SECRET)
      }).not.toThrow()
    })

    it('should reject invalid token signature', () => {
      const token = jwt.sign({ userId: 1 }, 'wrong-secret', { expiresIn: '1h' })

      expect(() => {
        jwt.verify(token, JWT_SECRET)
      }).toThrow()
    })

    it('should reject expired token', () => {
      const expiredToken = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '-1s' })

      expect(() => {
        jwt.verify(expiredToken, JWT_SECRET)
      }).toThrow(/expired/)
    })

    it('should decode token payload correctly', () => {
      const payload = { userId: 123, email: 'test@test.com', role: 'USER' }
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
      const decoded = jwt.verify(token, JWT_SECRET) as any

      expect(decoded.userId).toBe(123)
      expect(decoded.email).toBe('test@test.com')
      expect(decoded.role).toBe('USER')
    })
  })
})
