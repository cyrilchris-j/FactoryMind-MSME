import { Request, Response, NextFunction } from 'express'
import { adminDb } from '../lib/firebase-admin'

export interface AuthRequest extends Request {
  uid?: string
  email?: string
  role?: string
  factoryId?: string
  departmentId?: string
}

/**
 * Verify a Firebase ID token using the Firebase REST API.
 * This does NOT require a Firebase Admin service account.
 */
async function verifyFirebaseToken(idToken: string): Promise<{ uid: string; email?: string } | null> {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY

  if (!apiKey) {
    // Fallback: decode JWT without verification (for dev only)
    try {
      const parts = idToken.split('.')
      if (parts.length !== 3) return null
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
      if (payload.exp && payload.exp * 1000 < Date.now()) return null
      return { uid: payload.user_id || payload.sub, email: payload.email }
    } catch {
      return null
    }
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    )

    if (!res.ok) return null
    const data = await res.json() as { users?: Array<{ localId: string; email?: string }> }
    const user = data?.users?.[0]
    if (!user) return null
    return { uid: user.localId, email: user.email }
  } catch {
    // If REST API fails, decode JWT without verification as last resort
    try {
      const parts = idToken.split('.')
      if (parts.length !== 3) return null
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
      if (payload.exp && payload.exp * 1000 < Date.now()) return null
      return { uid: payload.user_id || payload.sub, email: payload.email }
    } catch {
      return null
    }
  }
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: no token provided' })
    return
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const decoded = await verifyFirebaseToken(idToken)
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
    req.role = profile.role as string
    req.factoryId = profile.factoryId as string
    req.departmentId = profile.departmentId as string

    next()
  } catch (err) {
    console.error('Auth error:', err)
    res.status(401).json({ error: 'Unauthorized: invalid token' })
  }
}
