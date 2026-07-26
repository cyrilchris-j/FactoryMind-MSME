import { Router, Request, Response } from 'express'
import { adminDb } from '../lib/firebase-admin'

const router = Router()

async function verifyFirebaseToken(idToken: string): Promise<{ uid: string; email?: string } | null> {
  const apiKey = process.env.FIREBASE_API_KEY

  if (!apiKey) {
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

router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const decoded = await verifyFirebaseToken(idToken)
    if (!decoded) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }

    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()

    if (!userDoc.exists) {
      res.status(401).json({ error: 'User profile not found' })
      return
    }

    const profile = userDoc.data()!
    res.json({
      id: decoded.uid,
      email: decoded.email || profile.email,
      name: profile.name,
      role: profile.role,
      factoryId: profile.factoryId,
      departmentId: profile.departmentId,
      department: profile.department,
    })
  } catch (err) {
    console.error('Token verification failed:', err)
    res.status(401).json({ error: 'Invalid or expired token' })
  }
})

export default router
