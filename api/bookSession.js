// /api/bookSession.js

const { google } = require("googleapis");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

// --- Initialize Firebase Admin SDK ---
let db;
try {
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!rawServiceAccount) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY env var (do not use NEXT_PUBLIC in production)");
  }
  const serviceAccount = JSON.parse(rawServiceAccount);
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  db = getFirestore();
} catch (e) {
  // Defer throwing to within the handler to return a proper 500 response
  db = null;
  global.__BOOKING_INIT_ERROR__ = e;
}

// --- Initialize Google Calendar API ---
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
let calendar;
try {
  const rawGoogleCreds = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!rawGoogleCreds) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS env var");
  }
  const googleCredentials = JSON.parse(rawGoogleCreds);
  const auth = new google.auth.GoogleAuth({
    credentials: googleCredentials,
    scopes: SCOPES,
  });
  calendar = google.calendar({ version: "v3", auth });
} catch (e) {
  calendar = null;
  global.__BOOKING_INIT_ERROR_CALENDAR__ = e;
}

// --- The Main Handler Function ---
module.exports = async (request, response) => {
  // Set CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for simplicity, or specify your domain
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (global.__BOOKING_INIT_ERROR__) {
      throw global.__BOOKING_INIT_ERROR__;
    }
    if (!db) {
      throw new Error("Firestore not initialized");
    }
    if (global.__BOOKING_INIT_ERROR_CALENDAR__) {
      throw global.__BOOKING_INIT_ERROR_CALENDAR__;
    }
    if (!calendar) {
      throw new Error("Google Calendar client not initialized");
    }
    const { mentorId, slot, userId, userEmail } = request.body;
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

      // Mark the slot as booked
      allSlots[selectedSlotIndex].isBooked = true;
      allSlots[selectedSlotIndex].bookedBy = userId;
      transaction.update(availabilityRef, { slots: allSlots });
    });

    // Get Mentor's Email
    const mentorDoc = await mentorRef.get();
    const mentorEmail = mentorDoc.data().email;

    // Create Google Calendar Event
    const event = {
      summary: `Mindsync Mentorship Session`,
      description: `A 30-minute check-in session.`,
      start: {
        dateTime: new Date(slot.startTime.seconds * 1000),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(slot.endTime.seconds * 1000),
        timeZone: 'UTC',
      },
      attendees: [{ email: userEmail }, { email: mentorEmail }],
      conferenceData: {
        createRequest: {
          requestId: `mindsync-${userId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: mentorEmail, // Use mentor's email as the calendar ID
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = calendarResponse.data.hangoutLink;

    // Save the confirmed session to our 'sessions' collection
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