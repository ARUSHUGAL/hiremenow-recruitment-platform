import admin from 'firebase-admin';

// Initialize Firebase Admin with mock credentials for demo
if (!admin.apps.length) {
  try {
    // Try to initialize with real credentials if available
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'hiremenow-demo',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY\n-----END PRIVATE KEY-----\n',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk@hiremenow-demo.iam.gserviceaccount.com',
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'hiremenow-demo'}-default-rtdb.firebaseio.com`,
    });
  } catch (error) {
    console.warn('Firebase Admin initialization failed, using mock mode:', error.message);
    // Initialize with mock credentials for demo
    admin.initializeApp({
      projectId: 'hiremenow-demo',
    });
  }
}

export const firebaseAdmin = admin;
export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();

export default admin;
