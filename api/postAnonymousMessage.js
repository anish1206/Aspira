// /api/postAnonymousMessage.js

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const crypto = require("crypto");

// --- (Firebase Admin SDK initialization remains the same) ---
const firebaseServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
if (!getApps().length) { initializeApp({ credential: cert(firebaseServiceAccount) }); }
const db = getFirestore();
const auth = getAuth();

// --- We no longer need the BigQuery library ---

module.exports = async (request, response) => {
  // (CORS and method checks remain the same)
  // ...

  try {
    const { message, groupId } = request.body;
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({ message: 'Unauthorized.' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const realUserId = decodedToken.uid;

    const timestamp = Timestamp.now();
    const hash = crypto.createHash('sha256').update(message + timestamp.toMillis() + realUserId).digest('hex');

    // --- THE NEW LOGIC ---
    
    // 1. Prepare the two documents
    const ledgerEntry = {
      messageHash: hash,
      realUserId: realUserId,
      groupId: groupId,
      timestamp: timestamp,
      text: message, // Storing the text here for moderation purposes
    };

    const anonymousMessage = {
      text: message,
      timestamp: timestamp,
      messageHash: hash,
    };

    // 2. Create references to the locations we need to write to
    const ledgerRef = db.collection('secureLedger').doc(hash); // Use hash as ID for uniqueness
    const messageRef = db.collection('groupMessages').doc(groupId).collection('messages').doc();

    // 3. Use a "batch write" to save both at the same time.
    // This ensures that one can't succeed without the other.
    const batch = db.batch();
    batch.set(ledgerRef, ledgerEntry);
    batch.set(messageRef, anonymousMessage);
    await batch.commit();

    console.log("Successfully wrote to both Firestore ledger and chat.");

    return response.status(200).json({ success: true, message: "Message posted anonymously." });

  } catch (error) {
    console.error("Anonymous posting error:", error);
    // ... (error handling remains the same)
  }
};