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
        // Fetch user details from Firestore
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return response.status(404).json({ message: 'User not found' });
        }

        const userData = userDoc.data();
        const accountType = userData.accountType || 'individual';
        const emergencyPreference = userData.emergencyPreference || 'guardian';
        const guardianPhone = userData.guardianPhone;
        const guardianName = userData.guardianName || 'Guardian';

        // Initialize Twilio client
        const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
            console.error('Twilio credentials not configured');
            return response.status(500).json({ message: 'SMS service not configured' });
        }

        const client = twilio(twilioAccountSid, twilioAuthToken);
        const timestamp = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        const sentMessages = [];

        // Handle based on emergency preference
        if (emergencyPreference === 'emergency_services' && userData.emergencyServicesConsent) {
            // Contact emergency services (112 for India, 911 for US)
            // Note: This is a placeholder - actual emergency services contact requires special setup
            console.log(`🚨 Emergency services contact needed for user ${userId}`);
            
            const emergencyMessage = `🚨 EMERGENCY ALERT from Aspira Mental Health\n\nEmergency services needed for a user experiencing mental health crisis.\n\nTimestamp: ${timestamp}\n\nUser ID: ${userId}\n\nPlease respond immediately.`;

            // Log emergency services alert (would need actual emergency services integration)
            await db.collection('emergency_alerts').add({
                userId: userId,
                timestamp: new Date(),
                type: 'emergency_services',
                status: 'logged'
            });

            sentMessages.push({ type: 'emergency_services', status: 'logged' });
        }

        // Send to guardian if available (for guardian preference or as backup)
        if (guardianPhone && (emergencyPreference === 'guardian' || accountType === 'minor')) {
            const guardianMessage = `⚠️ URGENT ALERT from Aspira\n\nDear ${guardianName},\n\nYour ward may need immediate support. They expressed concerning thoughts during a conversation on ${timestamp}.\n\nPlease reach out to them as soon as possible.\n\nIf this is an emergency, please contact local crisis helplines:\n🇮🇳 India: 9152987821 (iCall)\n🇺🇸 US: 988 (Suicide & Crisis Lifeline)\n\n- Aspira Care Team`;

            try {
                const message = await client.messages.create({
                    body: guardianMessage,
                    from: twilioPhoneNumber,
                    to: guardianPhone
                });

                console.log(`Guardian alert sent. SID: ${message.sid}`);
                sentMessages.push({ type: 'guardian', phone: guardianPhone, sid: message.sid });

                await db.collection('guardian_alerts').add({
                    userId: userId,
                    recipientType: 'guardian',
                    guardianPhone: guardianPhone,
                    timestamp: new Date(),
                    messageSid: message.sid,
                    status: 'sent'
                });
            } catch (smsError) {
                console.error('Error sending guardian SMS:', smsError);
                sentMessages.push({ type: 'guardian', status: 'failed', error: smsError.message });
            }
        }

        // Send to company HR if applicable
        if (accountType === 'company' && userData.companyHrConsent && userData.companyName) {
            // In production, you'd fetch company HR contact from a companies collection
            // For now, we'll log it
            console.log(`Company HR alert needed for ${userData.companyName}`);

            const companyAlert = {
                userId: userId,
                companyName: userData.companyName,
                timestamp: new Date(),
                type: 'company_hr',
                status: 'logged',
                message: 'Employee needs mental health support'
            };

            await db.collection('company_alerts').add(companyAlert);
            sentMessages.push({ type: 'company_hr', company: userData.companyName, status: 'logged' });
        }

        if (sentMessages.length === 0) {
            console.log(`No alert recipients configured for user ${userId}`);
            return response.status(404).json({ message: 'No emergency contacts configured' });
        }

        return response.status(200).json({
            success: true,
            message: 'Emergency alerts sent',
            alerts: sentMessages
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
