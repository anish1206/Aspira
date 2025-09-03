// /api/bookSession.js

const { google } = require("googleapis");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

// --- Initialize Firebase Admin SDK ---
// This uses the key you added to Vercel to let your function talk to Firestore
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}
const db = getFirestore();

// --- Initialize Google Calendar API ---
// This uses the key for your "robot user" to let your function talk to Google Calendar
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const googleCredentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials: googleCredentials,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });

// --- The Main Handler Function ---
module.exports = async (request, response) => {
  // Set CORS Headers for every request
  response.setHeader('Access-Control-Allow-Origin', '*'); // Or your specific Vercel domain
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle the browser's preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Ensure only POST requests proceed
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mentorId, slot, userId } = request.body;
    const mentorRef = db.collection('mentors').doc(mentorId);
    const availabilityRef = db.collection('mentorAvailability').doc(mentorId);

    // Run a Firestore Transaction to safely book the slot and prevent double-bookings
    await db.runTransaction(async (transaction) => {
      const availabilityDoc = await transaction.get(availabilityRef);
      if (!availabilityDoc.exists) {
        throw new Error("Mentor availability not found!");
      }

      const allSlots = availabilityDoc.data().slots;
      const selectedSlotIndex = allSlots.findIndex(s => 
        s.startTime.seconds === slot.startTime.seconds
      );

      // Check if the slot is still available
      if (selectedSlotIndex === -1 || allSlots[selectedSlotIndex].isBooked) {
        throw new Error("This slot is no longer available.");
      }

      // If available, mark the slot as booked in the transaction
      allSlots[selectedSlotIndex].isBooked = true;
      allSlots[selectedSlotIndex].bookedBy = userId;
      transaction.update(availabilityRef, { slots: allSlots });
    });

    // Get the mentor's email to know which calendar to add the event to
    const mentorDoc = await mentorRef.get();
    const mentorEmail = mentorDoc.data().email;

    // Create the event object for the Google Calendar API
    const event = {
      summary: `Mindsync Mentorship Session`,
      description: `A 30-minute check-in session with a Mindsync user.`,
      start: {
        dateTime: new Date(slot.startTime.seconds * 1000),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(slot.endTime.seconds * 1000),
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: `mindsync-${userId}-${Date.now()}`,
          // THIS IS THE CRITICAL FIX FROM THE LAST ERROR
          conferenceSolutionKey: { type: 'eventHangout' },
        },
      },
    };

    // Call the Google Calendar API to insert the event
    const calendarResponse = await calendar.events.insert({
      calendarId: mentorEmail,
      resource: event,
      conferenceDataVersion: 1,
    });

    // Get the Google Meet link from the successful response
    const meetLink = calendarResponse.data.hangoutLink;

    // Save the confirmed session details into our 'sessions' collection
    await db.collection('sessions').add({
        mentorId,
        userId,
        sessionStartTime: Timestamp.fromMillis(slot.startTime.seconds * 1000),
        sessionEndTime: Timestamp.fromMillis(slot.endTime.seconds * 1000),
        googleMeetLink: meetLink,
        status: 'confirmed',
        createdAt: Timestamp.now(),
    });

    // Send a success response back to the frontend
    return response.status(200).json({ success: true, message: "Session booked successfully!", meetLink });

  } catch (error) {
    console.error("Booking Error:", error);
    // Send a detailed error message back to the frontend if something fails
    return response.status(500).json({ success: false, message: error.message });
  }
};