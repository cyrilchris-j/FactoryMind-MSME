import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

// Helper: verify owner token
async function verifyOwner(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  if (!authHeader.startsWith('Bearer ')) return { error: 'Unauthorized', status: 401 }
  const token = authHeader.split('Bearer ')[1]
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    if (!userDoc.exists) return { error: 'User not found', status: 401 }
    const profile = userDoc.data()!
    if (profile.role !== 'OWNER') return { error: 'Only owners can change manager passwords', status: 403 }
    return { uid: decoded.uid, factoryId: profile.factoryId as string }
  } catch {
    return { error: 'Invalid token', status: 401 }
  }
}

// PATCH /api/managers/[id]/password — change manager password
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyOwner(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const managerId = params.id
  try {
    const body = await req.json()
    const { password } = body

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const managerDoc = await adminDb.collection('users').doc(managerId).get()
    if (!managerDoc.exists) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 })
    }
    const managerData = managerDoc.data()!
    if (managerData.factoryId !== auth.factoryId) {
      return NextResponse.json({ error: 'Manager does not belong to your factory' }, { status: 403 })
    }

    // Update password in Firebase Auth
    await adminAuth.updateUser(managerId, { password })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (err: any) {
    console.error('Update password error:', err)
    if (err.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'Manager Firebase account not found' }, { status: 404 })
    }
    return NextResponse.json({ error: err.message || 'Failed to update password' }, { status: 500 })
  }
}
