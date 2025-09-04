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

    // (Firestore transaction is correct and remains the same)
    await db.runTransaction(async (transaction) => {
      const availabilityDoc = await transaction.get(availabilityRef);
      if (!availabilityDoc.exists) throw new Error("Mentor availability not found!");
      const allSlots = availabilityDoc.data().slots;
      const selectedSlotIndex = allSlots.findIndex(s => s.startTime.seconds === slot.startTime.seconds);
      if (selectedSlotIndex === -1 || allSlots[selectedSlotIndex].isBooked) throw new Error("This slot is no longer available.");
      allSlots[selectedSlotIndex].isBooked = true;
      allSlots[selectedSlotIndex].bookedBy = userId;
      transaction.update(availabilityRef, { slots: allSlots });
    });

    const mentorDoc = await mentorRef.get();
    const mentorData = mentorDoc.data();
    const meetLink = mentorData.staticMeetLink;
    const mentorEmail = mentorData.email;

    if (!meetLink) throw new Error("The mentor has not set their meeting link yet.");
    
    // (Create Calendar Event logic is correct and remains the same)
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

    // --- THE FIX IS HERE ---
    // We are replacing the placeholder with a real, dynamic HTML email body.
    const sessionTime = new Date(slot.startTime.seconds * 1000).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
    await resend.emails.send({
      from: 'Mindsync <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'Your Mindsync Mentorship Session is Confirmed!',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #333;">Your Session is Booked!</h1>
          <p>Hi there,</p>
          <p>This is a confirmation that your mentorship session with <strong>${mentorData.name}</strong> has been successfully booked.</p>
          <hr>
          <h3>Session Details:</h3>
          <p><strong>Time:</strong> ${sessionTime}</p>
          <p><strong>Link to Join:</strong></p>
          <p><a href="${meetLink}" style="padding: 12px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Join Google Meet</a></p>
          <hr>
          <p>We recommend joining the call a few minutes early to ensure your connection is working.</p>
          <p>We look forward to seeing you!</p>
          <br>
          <p>- The Mindsync Team</p>
        </div>
      `,
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