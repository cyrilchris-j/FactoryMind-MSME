import admin from 'firebase-admin'
import dotenv from 'dotenv'
dotenv.config()

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  const projectId = process.env.FIREBASE_PROJECT_ID || 'factorymind-msme'

  if (serviceAccountBase64) {
    try {
      const decoded = JSON.parse(
        Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
      )
      if (decoded.private_key) {
        decoded.private_key = decoded.private_key.replace(/\\n/g, '\n')
      }
      admin.initializeApp({
        credential: admin.credential.cert(decoded as admin.ServiceAccount),
      })
      console.log('✅ Firebase Admin initialized with Service Account successfully')
    } catch (err) {
      console.error('❌ Failed to initialize Firebase Admin with Service Account:', err)
      admin.initializeApp({ projectId })
    }
  } else {
    admin.initializeApp({ projectId })
  }

  return admin
}

const firebaseAdmin = getFirebaseAdmin()
export const adminAuth = firebaseAdmin.auth()
export const adminDb = firebaseAdmin.firestore()
export default firebaseAdmin
