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
    if (profile.role !== 'OWNER') return { error: 'Only owners can manage managers', status: 403 }
    return { uid: decoded.uid, factoryId: profile.factoryId as string }
  } catch {
    return { error: 'Invalid token', status: 401 }
  }
}

// DELETE /api/managers/[id] — remove a manager
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyOwner(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id: managerId } = await params
  try {
    const managerDoc = await adminDb.collection('users').doc(managerId).get()
    if (!managerDoc.exists) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 })
    }
    const managerData = managerDoc.data()!
    if (managerData.factoryId !== auth.factoryId) {
      return NextResponse.json({ error: 'Manager does not belong to your factory' }, { status: 403 })
    }

    // Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(managerId)
    } catch (authErr: any) {
      if (authErr.code !== 'auth/user-not-found') throw authErr
    }

    // Delete from Firestore
    await adminDb.collection('users').doc(managerId).delete()

    return NextResponse.json({ message: 'Manager removed successfully' })
  } catch (err: any) {
    console.error('Delete manager error:', err)
    return NextResponse.json({ error: err.message || 'Failed to remove manager' }, { status: 500 })
  }
}
