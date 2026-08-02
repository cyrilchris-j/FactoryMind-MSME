import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

// Helper: verify the owner token and get their factoryId
async function verifyOwner(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  if (!authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 }
  }
  const token = authHeader.split('Bearer ')[1]
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    if (!userDoc.exists) return { error: 'User not found', status: 401 }
    const profile = userDoc.data()!
    if (profile.role !== 'OWNER') return { error: 'Only owners can manage managers', status: 403 }
    if (!profile.factoryId) return { error: 'Owner account has no factory assigned', status: 400 }
    return { uid: decoded.uid, factoryId: profile.factoryId as string }
  } catch (err: any) {
    console.error('verifyOwner error:', err)
    return { error: 'Invalid token', status: 401 }
  }
}

// GET /api/managers — list managers for this factory
export async function GET(req: NextRequest) {
  const auth = await verifyOwner(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const snap = await adminDb.collection('users')
      .where('factoryId', '==', auth.factoryId)
      .where('role', '==', 'MANAGER')
      .get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('GET /api/managers error:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch managers' }, { status: 500 })
  }
}

// POST /api/managers — create a new manager
export async function POST(req: NextRequest) {
  const auth = await verifyOwner(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { email, password, name, department, machineNumber } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields: name, email, password' }, { status: 400 })
    }

    // Check machine number uniqueness
    if (machineNumber) {
      const existing = await adminDb.collection('users')
        .where('factoryId', '==', auth.factoryId)
        .where('role', '==', 'MANAGER')
        .where('machineNumber', '==', Number(machineNumber))
        .get()
      if (!existing.empty) {
        return NextResponse.json({ error: 'A manager for this machine number already exists' }, { status: 400 })
      }
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    })

    // Save to Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      email,
      name,
      role: 'MANAGER',
      department: department || 'Unassigned',
      machineNumber: machineNumber ? Number(machineNumber) : null,
      factoryId: auth.factoryId,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ id: userRecord.uid, message: 'Manager created successfully' }, { status: 201 })
  } catch (err: any) {
    console.error('Create manager error:', err)
    if (err.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }
    return NextResponse.json({ error: err.message || 'Failed to create manager' }, { status: 500 })
  }
}
