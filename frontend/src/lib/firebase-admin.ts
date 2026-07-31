import admin from 'firebase-admin'

function getAdmin() {
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
    } catch {
      admin.initializeApp({ projectId })
    }
  } else {
    admin.initializeApp({ projectId })
  }

  return admin
}

const firebaseAdmin = getAdmin()
export const adminAuth = firebaseAdmin.auth()
export const adminDb = firebaseAdmin.firestore()
