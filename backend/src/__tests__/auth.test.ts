import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'

jest.mock('../lib/firebase-admin')

import { requireAuth } from '../middleware/auth'

const { _mockVerifyIdToken, _mockDocGet } = require('../lib/firebase-admin')

function mockReq(headers?: Record<string, string>): AuthRequest {
  return { headers: headers || {} } as AuthRequest
}

function mockRes(): Response {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res as Response
}

beforeEach(() => {
  _mockVerifyIdToken.mockReset()
  _mockDocGet.mockReset()
})

describe('requireAuth', () => {
  it('rejects requests without Authorization header', async () => {
    const req = mockReq()
    const res = mockRes()
    const next: NextFunction = jest.fn()

    await requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: no token provided' })
    expect(next).not.toHaveBeenCalled()
  })

  it('rejects requests with non-Bearer Authorization header', async () => {
    const req = mockReq({ authorization: 'Basic token123' })
    const res = mockRes()
    const next: NextFunction = jest.fn()

    await requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: no token provided' })
    expect(next).not.toHaveBeenCalled()
  })

  it('rejects invalid Firebase ID tokens', async () => {
    _mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'))

    const req = mockReq({ authorization: 'Bearer fake-token' })
    const res = mockRes()
    const next: NextFunction = jest.fn()

    await requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: invalid token' })
    expect(next).not.toHaveBeenCalled()
  })

  it('rejects valid token but missing Firestore profile', async () => {
    _mockVerifyIdToken.mockResolvedValue({ uid: 'user-123', email: 'test@test.com' })
    _mockDocGet.mockResolvedValue({ exists: false })

    const req = mockReq({ authorization: 'Bearer valid-token' })
    const res = mockRes()
    const next: NextFunction = jest.fn()

    await requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: user profile not found' })
    expect(next).not.toHaveBeenCalled()
  })

  it('attaches user profile to request on success', async () => {
    const profile = {
      name: 'Test Owner',
      email: 'owner@test.com',
      role: 'OWNER',
      factoryId: 'factory-1',
      departmentId: 'dept-1',
    }

    _mockVerifyIdToken.mockResolvedValue({ uid: 'user-123', email: 'owner@test.com' })
    _mockDocGet.mockResolvedValue({ exists: true, data: () => profile })

    const req = mockReq({ authorization: 'Bearer valid-token' })
    const res = mockRes()
    const next: NextFunction = jest.fn()

    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.uid).toBe('user-123')
    expect(req.email).toBe('owner@test.com')
    expect(req.role).toBe('OWNER')
    expect(req.factoryId).toBe('factory-1')
    expect(req.departmentId).toBe('dept-1')
  })
})
