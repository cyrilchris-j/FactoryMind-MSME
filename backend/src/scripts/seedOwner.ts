import { adminAuth, adminDb } from '../lib/firebase-admin';

async function seedOwner() {
  const email = 'cyrilchrisj@gmail.com';
  const password = 'MaxVerstappen33';
  
  try {
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
      console.log('User already exists, updating password...');
      await adminAuth.updateUser(userRecord.uid, { password });
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        console.log('Creating new user...');
        userRecord = await adminAuth.createUser({
          email,
          password,
          displayName: 'Cyril Chris J',
        });
      } else {
        throw e;
      }
    }

    console.log('Setting custom claims...');
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'OWNER' });

    console.log('Adding to Firestore...');
    await adminDb.collection('users').doc(userRecord.uid).set({
      email,
      name: 'Cyril Chris J',
      role: 'OWNER',
      createdAt: new Date().toISOString()
    });

    console.log('Successfully seeded OWNER user.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding owner user:', error);
    process.exit(1);
  }
}

seedOwner();
