// /api/sendGuardianAlert.js

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const twilio = require("twilio");

// Get Firestore instance (Firebase Admin already initialized in askGemini.js)
const db = getFirestore();

// CORS Configuration - same as askGemini.js
const allowedOrigins = new Set([
    'https://genai2505.web.app',
    'https://genai2505.firebaseapp.com',
    'http://localhost:3000',
    'https://mindsync.vercel.app',
    'https://mindsync-6p3xfn6ko-anishs-projects-799e04e9.vercel.app',
    'https://mindsync-majg12jao-anishs-projects-799e04e9.vercel.app',
]);

export default async function handler(request, response) {
    // --- CORS Preflight Check ---
    const origin = request.headers.origin || '';
    const corsOrigin = allowedOrigins.has(origin) ? origin : '';
    response.setHeader('Access-Control-Allow-Credentials', true);
    if (corsOrigin) {
        response.setHeader('Access-Control-Allow-Origin', corsOrigin);
    }
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }
    // --- End of CORS Preflight Check ---

    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, messageContent } = request.body;

    if (!userId) {
        return response.status(400).json({ message: 'userId is required' });
    }

    try {
        // Fetch guardian details from user's Firestore document
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return response.status(404).json({ message: 'User not found' });
        }

        const userData = userDoc.data();
        const guardianPhone = userData.guardianPhone;
        const guardianName = userData.guardianName || 'Guardian';

        if (!guardianPhone) {
            console.log(`No guardian phone found for user ${userId}`);
            return response.status(404).json({ message: 'No guardian contact configured' });
        }

        // Initialize Twilio client
        const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
            console.error('Twilio credentials not configured');
            return response.status(500).json({ message: 'SMS service not configured' });
        }

        const client = twilio(twilioAccountSid, twilioAuthToken);

        // Get timestamp for alert
        const timestamp = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        // Construct alert message (without exposing full message content)
        const alertMessage = `⚠️ URGENT ALERT from MindSync\n\nDear ${guardianName},\n\nYour ward may need immediate support. They expressed concerning thoughts during a conversation on ${timestamp}.\n\nPlease reach out to them as soon as possible.\n\nIf this is an emergency, please contact local crisis helplines:\n🇮🇳 India: 9152987821 (iCall)\n\n- MindSync Care Team`;

        // Send SMS via Twilio
        const message = await client.messages.create({
            body: alertMessage,
            from: twilioPhoneNumber,
            to: guardianPhone
        });

        console.log(`Guardian alert sent successfully. SID: ${message.sid}`);

        // Log the alert (without sensitive message content)
        await db.collection('guardian_alerts').add({
            userId: userId,
            guardianPhone: guardianPhone,
            timestamp: new Date(),
            messageSid: message.sid,
            status: 'sent'
        });

        return response.status(200).json({
            success: true,
            message: 'Guardian alert sent successfully',
            messageSid: message.sid
        });

    } catch (error) {
        console.error("Error sending guardian alert:", error);

        // Log failed attempt
        try {
            await db.collection('guardian_alerts').add({
                userId: userId,
                timestamp: new Date(),
                status: 'failed',
                error: error.message
            });
        } catch (logError) {
            console.error("Error logging failed alert:", logError);
        }

        return response.status(500).json({
            message: "Failed to send guardian alert",
            error: error.message
        });
    }
}
