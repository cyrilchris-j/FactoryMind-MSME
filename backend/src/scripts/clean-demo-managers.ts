import { adminAuth, adminDb } from '../lib/firebase-admin'
import dotenv from 'dotenv'
dotenv.config()

async function cleanDemoManagers() {
  console.log('🧹 Cleaning up demo managers from Firebase Auth and Firestore...')

  const ownerEmail = 'cyrilchrisj@gmail.com'

  try {
    const snap = await adminDb.collection('users').get()
    for (const doc of snap.docs) {
      const data = doc.data()
      if (data.email !== ownerEmail && data.role === 'MANAGER') {
        console.log(`Deleting manager: ${data.name} (${data.email}) - id: ${doc.id}`)
        
        // Delete from Auth if exists
        try {
          await adminAuth.deleteUser(doc.id)
          console.log(`   Deleted from Auth: ${doc.id}`)
        } catch (authErr: any) {
          if (authErr.code !== 'auth/user-not-found') {
            console.warn(`   Auth deletion warning for ${doc.id}:`, authErr.message)
          }
        }

        // Delete from Firestore
        await adminDb.collection('users').doc(doc.id).delete()
        console.log(`   Deleted from Firestore: ${doc.id}`)
      }
    }

    console.log('✨ Cleanup complete! Only Owner account remains.')
    process.exit(0)
  } catch (err) {
    console.error('❌ Cleanup failed:', err)
    process.exit(1)
  }
}

cleanDemoManagers()
