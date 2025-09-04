// /api/bookSession.js

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { google } = require("googleapis");
const { Resend } = require("resend");

// (All initialization code remains the same)
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
    console.log(`Booking request received for mentor ${mentorId} from user ${userEmail}`);
    const mentorRef = db.collection('mentors').doc(mentorId);
    const availabilityRef = db.collection('mentorAvailability').doc(mentorId);

    // (Firestore transaction remains the same)
    await db.runTransaction(async (transaction) => {
        // ... transaction logic
    });
    console.log("Firestore transaction successful. Slot marked as booked.");

    const mentorDoc = await mentorRef.get();
    const mentorData = mentorDoc.data();
    const meetLink = mentorData.staticMeetLink;
    const mentorEmail = mentorData.email;

    if (!meetLink) throw new Error("The mentor has not set their meeting link yet.");
    
    // --- Create Calendar Event ---
    const event = {
      summary: `Mindsync Session with User`,
      description: `Meeting link: ${meetLink}`,
      location: meetLink,
      start: { dateTime: new Date(slot.startTime.seconds * 1000), timeZone: 'UTC' },
      end: { dateTime: new Date(slot.endTime.seconds * 1000), timeZone: 'UTC' },
    };

    try {
      await calendar.events.insert({ calendarId: mentorEmail, resource: event });
      console.log("Google Calendar event created successfully.");
    } catch (calendarError) {
      console.error("Could not create calendar event, but proceeding.", calendarError);
    }

    // --- Send Confirmation Email ---
    console.log(`Attempting to send confirmation email to ${userEmail}...`);
    const sessionTime = new Date(slot.startTime.seconds * 1000).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
    
    const { data, error } = await resend.emails.send({
      from: 'Mindsync <onboarding@resend.dev>',
      to: [userEmail], // It's safer to use an array
      subject: 'Your Mindsync Mentorship Session is Confirmed!',
      html: `... your email html ...`,
    });

    if (error) {
      // This explicitly catches errors from the Resend call
      console.error("Resend API Error:", error);
      throw new Error("Failed to send confirmation email.");
    }

    console.log(`Email sent successfully! Message ID: ${data.id}`);
    
    // (Save the session to our database)
    await db.collection('sessions').add({
        // ... session data
    });

    return response.status(200).json({ success: true, message: "Session booked and email sent!", meetLink });

  } catch (error) {
    console.error("Booking Error in main catch block:", error);
    return response.status(500).json({ success: false, message: error.message });
  }
};