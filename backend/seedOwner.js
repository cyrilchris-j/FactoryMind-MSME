const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function seedOwner() {
  const email = 'cyrilchrisj@gmail.com';
  const password = 'MaxVerstappen33';
  
  try {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('User already exists, updating password...');
      await auth.updateUser(userRecord.uid, { password });
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        console.log('Creating new user...');
        userRecord = await auth.createUser({
          email,
          password,
          displayName: 'Cyril Chris J',
        });
      } else {
        throw e;
      }
    }

    console.log('Setting custom claims...');
    await auth.setCustomUserClaims(userRecord.uid, { role: 'OWNER' });

    console.log('Adding to Firestore...');
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name: 'Cyril Chris J',
      role: 'OWNER',
      createdAt: new Date().toISOString()
    });

    console.log('Successfully seeded OWNER user.');
  } catch (error) {
    console.error('Error seeding owner user:', error);
  }
}

seedOwner();
