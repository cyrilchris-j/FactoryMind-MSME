import express from 'express'
import request from 'supertest'

jest.mock('../lib/firebase-admin')

import authRoutes from '../routes/auth'

const { _mockVerifyIdToken, _mockDocGet } = require('../lib/firebase-admin')

const app = express()
app.use(express.json())
app.use('/auth', authRoutes)

beforeEach(() => {
  _mockVerifyIdToken.mockReset()
  _mockDocGet.mockReset()
})

describe('GET /auth/me', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/auth/me')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Unauthorized')
  })

  it('returns 401 with invalid token', async () => {
    _mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'))

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid or expired token')
  })

  it('returns 401 when user profile not found', async () => {
    _mockVerifyIdToken.mockResolvedValue({ uid: 'user-123', email: 'test@test.com' })
    _mockDocGet.mockResolvedValue({ exists: false })

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('User profile not found')
  })

  it('returns user profile with valid token', async () => {
    const profile = {
      name: 'Test Owner',
      email: 'owner@test.com',
      role: 'OWNER',
      factoryId: 'factory-1',
      departmentId: 'dept-1',
      department: 'Production',
    }

    _mockVerifyIdToken.mockResolvedValue({ uid: 'user-123', email: 'owner@test.com' })
    _mockDocGet.mockResolvedValue({ exists: true, data: () => profile })

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer valid-token')

    expect(res.status).toBe(200)
    expect(res.body.id).toBe('user-123')
    expect(res.body.email).toBe('owner@test.com')
    expect(res.body.name).toBe('Test Owner')
    expect(res.body.role).toBe('OWNER')
    expect(res.body.factoryId).toBe('factory-1')
  })
})
