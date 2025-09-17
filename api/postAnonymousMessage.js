// /api/postAnonymousMessage.js

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { BigQuery } = require("@google-cloud/bigquery");
const crypto = require("crypto");

// --- Initialize Firebase Admin SDK ---
const firebaseServiceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY
);
if (!getApps().length) {
  initializeApp({ credential: cert(firebaseServiceAccount) });
}
const db = getFirestore();
const auth = getApps()[0].auth();

// --- Initialize Google BigQuery ---
// We use the same service account credentials from the Calendar feature
const bigqueryCredentials = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
);
const bigquery = new BigQuery({
  projectId: bigqueryCredentials.project_id,
  credentials: {
    client_email: bigqueryCredentials.client_email,
    private_key: bigqueryCredentials.private_key,
  },
});

// --- The Main Handler Function ---
module.exports = async (request, response) => {
  // (CORS headers and method checks)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') { return response.status(200).end(); }
  if (request.method !== 'POST') { return response.status(405).json({ message: 'Method not allowed' }); }

  try {
    // 1. VERIFY THE USER IS AUTHENTICATED (SECURITY)
    const { message, groupId } = request.body;
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({ message: 'Unauthorized: No token provided.' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const realUserId = decodedToken.uid; // This is the real, verified Firebase user ID

    // 2. CREATE A UNIQUE, VERIFIABLE HASH FOR THE MESSAGE
    const timestamp = Timestamp.now();
    const hash = crypto.createHash('sha256')
      .update(message + timestamp.toMillis() + realUserId)
      .digest('hex');

    // 3. WRITE TO THE SECURE LEDGER (BIGQUERY)
    const ledgerEntry = {
      messageHash: hash,
      realUserId: realUserId,
      groupId: groupId,
      timestamp: new Date(), // BigQuery prefers standard JS Date objects
    };
    await bigquery.dataset('aspira_ledger').table('anonymous_posts').insert(ledgerEntry);
    console.log("Successfully wrote to BigQuery ledger.");

    // 4. WRITE TO THE FAST, ANONYMOUS CHAT LAYER (FIRESTORE)
    const anonymousMessage = {
      text: message,
      timestamp: timestamp,
      messageHash: hash,
      // CRITICAL: NO realUserId is stored here
    };
    const messagesRef = db.collection('groupMessages').doc(groupId).collection('messages');
    await messagesRef.add(anonymousMessage);
    console.log("Successfully wrote to Firestore chat.");

    // 5. SEND SUCCESS RESPONSE
    return response.status(200).json({ success: true, message: "Message posted anonymously." });

  } catch (error)
  {
    console.error("Anonymous posting error:", error);
    if (error.code === 'auth/id-token-expired') {
        return response.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    return response.status(500).json({ success: false, message: error.message });
  }
};