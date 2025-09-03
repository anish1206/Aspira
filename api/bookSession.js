// /api/bookSession.js

const { google } = require("googleapis");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

// --- Initialize Firebase Admin SDK ---
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
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const googleCredentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials: googleCredentials,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });

// --- The Main Handler Function ---
module.exports = async (request, response) => {
  // Set CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mentorId, slot, userId } = request.body; // userEmail is no longer needed here
    const mentorRef = db.collection('mentors').doc(mentorId);
    const availabilityRef = db.collection('mentorAvailability').doc(mentorId);

    // Firestore Transaction to prevent double booking
    await db.runTransaction(async (transaction) => {
      const availabilityDoc = await transaction.get(availabilityRef);
      if (!availabilityDoc.exists) {
        throw new Error("Mentor availability not found!");
      }

      const allSlots = availabilityDoc.data().slots;
      const selectedSlotIndex = allSlots.findIndex(s => 
        s.startTime.seconds === slot.startTime.seconds
      );

      if (selectedSlotIndex === -1 || allSlots[selectedSlotIndex].isBooked) {
        throw new Error("This slot is no longer available.");
      }

      allSlots[selectedSlotIndex].isBooked = true;
      allSlots[selectedSlotIndex].bookedBy = userId;
      transaction.update(availabilityRef, { slots: allSlots });
    });

    const mentorDoc = await mentorRef.get();
    const mentorEmail = mentorDoc.data().email;

    // --- CHANGE IS HERE ---
    // Create Google Calendar Event WITHOUT attendees to avoid the error
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
      // attendees: [{ email: userEmail }, { email: mentorEmail }], // <--- THIS LINE IS REMOVED
      conferenceData: {
        createRequest: {
          requestId: `mindsync-${userId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: mentorEmail,
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = calendarResponse.data.hangoutLink;

    await db.collection('sessions').add({
        mentorId,
        userId,
        sessionStartTime: Timestamp.fromMillis(slot.startTime.seconds * 1000),
        sessionEndTime: Timestamp.fromMillis(slot.endTime.seconds * 1000),
        googleMeetLink: meetLink,
        status: 'confirmed',
        createdAt: Timestamp.now(),
    });

    return response.status(200).json({ success: true, message: "Session booked successfully!", meetLink });

  } catch (error) {
    console.error("Booking Error:", error);
    return response.status(500).json({ success: false, message: error.message });
  }
};