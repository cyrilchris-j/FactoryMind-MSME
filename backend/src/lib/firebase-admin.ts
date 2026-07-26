import admin from 'firebase-admin'

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64

  if (serviceAccountBase64) {
    const decoded = JSON.parse(
      Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
    )
    admin.initializeApp({
      credential: admin.credential.cert(decoded as admin.ServiceAccount),
    })
  } else {
    admin.initializeApp({
      projectId: 'factorymind-msme',
    })
  }

  return admin
}

const firebaseAdmin = getFirebaseAdmin()
export const adminAuth = firebaseAdmin.auth()
export const adminDb = firebaseAdmin.firestore()
export default firebaseAdmin
