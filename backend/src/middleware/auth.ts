import { Request, Response, NextFunction } from 'express'
import { adminAuth, adminDb } from '../lib/firebase-admin'

export interface AuthRequest extends Request {
  uid?: string
  email?: string
  name?: string
  role?: string
  factoryId?: string
  departmentId?: string
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: no token provided' })
    return
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    if (!decoded) {
      res.status(401).json({ error: 'Unauthorized: invalid token' })
      return
    }

    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    if (!userDoc.exists) {
      res.status(401).json({ error: 'Unauthorized: user profile not found' })
      return
    }

    const profile = userDoc.data()!

    req.uid = decoded.uid
    req.email = decoded.email || profile.email
    req.name = profile.name as string
    req.role = profile.role as string
    req.factoryId = profile.factoryId as string
    req.departmentId = profile.departmentId as string

    next()
  } catch (err: any) {
    console.error('Auth error:', err)
    res.status(401).json({ error: 'Unauthorized: invalid token' })
  }
}
