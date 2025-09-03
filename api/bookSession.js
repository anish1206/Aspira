// /api/bookSession.js

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

// --- We ONLY need the Firebase Admin SDK now ---
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}
const db = getFirestore();

// --- The Main Handler Function ---
module.exports = async (request, response) => {
  // CORS Headers and method checks
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') { return response.status(200).end(); }
  if (request.method !== 'POST') { return response.status(405).json({ message: 'Method not allowed' }); }

  try {
    const { mentorId, slot, userId } = request.body;
    const mentorRef = db.collection('mentors').doc(mentorId);
    const availabilityRef = db.collection('mentorAvailability').doc(mentorId);

    // Run the Firestore Transaction to book the slot
    await db.runTransaction(async (transaction) => {
      // THIS IS THE LINE THAT WAS FIXED
      const availabilityDoc = await transaction.get(availabilityRef); // <-- CORRECTED: Was 'availabilityref'
      
      if (!availabilityDoc.exists) {
          throw new Error("Mentor availability not found!");
      }

      const allSlots = availabilityDoc.data().slots;
      const selectedSlotIndex = allSlots.findIndex(s => s.startTime.seconds === slot.startTime.seconds);
      
      if (selectedSlotIndex === -1 || allSlots[selectedSlotIndex].isBooked) {
          throw new Error("This slot is no longer available.");
      }

      allSlots[selectedSlotIndex].isBooked = true;
      allSlots[selectedSlotIndex].bookedBy = userId;
      transaction.update(availabilityRef, { slots: allSlots });
    });

    // Get the mentor's document to find their static meeting link
    const mentorDoc = await mentorRef.get();
    const meetLink = mentorDoc.data().staticMeetLink;

    if (!meetLink) {
        throw new Error("The mentor has not set their meeting link yet.");
    }
    
    // Save the confirmed session details with the pre-saved link
    await db.collection('sessions').add({
        mentorId,
        userId,
        sessionStartTime: Timestamp.fromMillis(slot.startTime.seconds * 1000),
        sessionEndTime: Timestamp.fromMillis(slot.endTime.seconds * 1000),
        googleMeetLink: meetLink, // Using the static link here!
        status: 'confirmed',
        createdAt: Timestamp.now(),
    });

    // Send the successful response back to the user
    return response.status(200).json({ success: true, message: "Session booked successfully!", meetLink });

  } catch (error) {
    console.error("Booking Error:", error);
    return response.status(500).json({ success: false, message: error.message });
  }
};