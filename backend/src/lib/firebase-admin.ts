import admin from 'firebase-admin'

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  const projectId = process.env.FIREBASE_PROJECT_ID || 'factorymind-msme'

  if (serviceAccountBase64) {
    const decoded = JSON.parse(
      Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
    )
    admin.initializeApp({
      credential: admin.credential.cert(decoded as admin.ServiceAccount),
    })
  } else {
    // No service account — initialize with just project ID.
    // Firestore will still work for reads/writes using the client SDK approach,
    // but token verification is handled via Firebase REST API instead.
    admin.initializeApp({
      projectId,
    })
  }

  return admin
}

const firebaseAdmin = getFirebaseAdmin()
export const adminAuth = firebaseAdmin.auth()
export const adminDb = firebaseAdmin.firestore()
export default firebaseAdmin
