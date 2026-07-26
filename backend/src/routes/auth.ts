import { Router, Request, Response } from 'express'
import { adminAuth, adminDb } from '../lib/firebase-admin'

const router = Router()

router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
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
