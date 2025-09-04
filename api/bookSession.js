// /api/bookSession.js

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { google } = require("googleapis");
const { Resend } = require("resend");

// --- (All initialization code remains the same) ---
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
if (!getApps().length) { initializeApp({ credential: cert(serviceAccount) }); }
const db = getFirestore();
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const googleCredentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
const auth = new google.auth.GoogleAuth({ credentials: googleCredentials, scopes: SCOPES });
const calendar = google.calendar({ version: "v3", auth });
const resend = new Resend(process.env.RESEND_API_KEY);

// --- The Main Handler Function ---
module.exports = async (request, response) => {
  // (CORS headers and method checks)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') { return response.status(200).end(); }
  if (request.method !== 'POST') { return response.status(405).json({ message: 'Method not allowed' }); }

  try {
    const { mentorId, slot, userId, userEmail } = request.body;
    const mentorRef = db.collection('mentors').doc(mentorId);
    const availabilityRef = db.collection('mentorAvailability').doc(mentorId);

    // --- Firestore Transaction ---
    // This is the part that will now work correctly.
    await db.runTransaction(async (transaction) => {
      // THE TYPO IS FIXED ON THE LINE BELOW
      const availabilityDoc = await transaction.get(availabilityRef); 

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

    const mentorDoc = await mentorRef.get();
    const mentorData = mentorDoc.data();
    const meetLink = mentorData.staticMeetLink;
    const mentorEmail = mentorData.email;

    if (!meetLink) throw new Error("The mentor has not set their meeting link yet.");
    
    // (Create Calendar Event logic remains the same)
    const event = {
      summary: `Mindsync Session with User`,
      description: `Meeting link: ${meetLink}`,
      location: meetLink,
      start: { dateTime: new Date(slot.startTime.seconds * 1000), timeZone: 'UTC' },
      end: { dateTime: new Date(slot.endTime.seconds * 1000), timeZone: 'UTC' },
    };
    try {
      await calendar.events.insert({ calendarId: mentorEmail, resource: event });
    } catch (calendarError) {
      console.error("Could not create calendar event, but proceeding.", calendarError);
    }

    // (Send Confirmation Email logic remains the same)
    const sessionTime = new Date(slot.startTime.seconds * 1000).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
    await resend.emails.send({
      from: 'Mindsync <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'Your Mindsync Mentorship Session is Confirmed!',
      html: `... your email html ...`,
    });
    
    // (Save session to database logic remains the same)
    await db.collection('sessions').add({
        mentorId, userId,
        sessionStartTime: Timestamp.fromMillis(slot.startTime.seconds * 1000),
        sessionEndTime: Timestamp.fromMillis(slot.endTime.seconds * 1000),
        googleMeetLink: meetLink, status: 'confirmed', createdAt: Timestamp.now(),
    });

    return response.status(200).json({ success: true, message: "Session booked successfully! A confirmation email has been sent.", meetLink });

  } catch (error) {
    console.error("Booking Error:", error);
    return response.status(500).json({ success: false, message: error.message });
  }
};