// /api/askGemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// IMPORTANT: Define which website(s) are allowed to make requests to this API
const allowedOrigins = new Set([
    'https://genai2505.web.app',
    'https://genai2505.firebaseapp.com',
    'http://localhost:3000',
    'https://mindsync.vercel.app',
    'https://mindsync-web.vercel.app',
    'https://mindsync-6p3xfn6ko-anishs-projects-799e04e9.vercel.app',
    'https://mindsync-majg12jao-anishs-projects-799e04e9.vercel.app',
]);

export default async function handler(request, response) {
    // --- Start of CORS Preflight Check ---
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

    const { history = [], message = "", userId, mood } = request.body || {};

    try {
        // Fetch User Context if userId is provided
        let userContext = "";
        if (userId) {
            try {
                // 0. Check User Preferences
                const userDoc = await db.collection('users').doc(userId).get();
                const aiAccessEnabled = userDoc.exists && userDoc.data().aiAccessEnabled;

                // 1. Fetch recent Diary Entries (Last 3) - ONLY if allowed
                let diaryEntries = "";
                if (aiAccessEnabled) {
                    const diarySnapshot = await db.collection('diary')
                        .where('userId', '==', userId)
                        .orderBy('createdAt', 'desc')
                        .limit(3)
                        .get();

                    diaryEntries = diarySnapshot.docs.map(doc => {
                        const data = doc.data();
                        if (data.type === 'gratitude') {
                            try {
                                const content = JSON.parse(data.content);
                                return `[Gratitude] Highlight: ${content.highlight}, Person: ${content.person}, Lesson: ${content.lesson}`;
                            } catch (e) { return `[Gratitude] ${data.content}`; }
                        }
                        return `[Journal] ${data.content}`;
                    }).join('\n');
                } else {
                    diaryEntries = "User has disabled AI access to diary entries.";
                }

                // 2. Fetch Active Intentions
                const intentionsSnapshot = await db.collection('intentions')
                    .where('userId', '==', userId)
                    .where('completed', '==', false)
                    .get();
                const intentions = intentionsSnapshot.docs.map(doc => `- ${doc.data().text}`).join('\n');

                // 3. Fetch Active Tasks
                const tasksSnapshot = await db.collection('tasks')
                    .where('userId', '==', userId)
                    .where('completed', '==', false)
                    .get();
                const tasks = tasksSnapshot.docs.map(doc => `- ${doc.data().text} (${doc.data().category})`).join('\n');

                userContext = `
Here is some context about the user based on their recent activity:

RECENT DIARY ENTRIES:
${diaryEntries || "No recent entries."}

CURRENT INTENTIONS:
${intentions || "No active intentions."}

PENDING TASKS:
${tasks || "No pending tasks."}

Use this information to be more empathetic and helpful. If they talk about stress, refer to their tasks or diary. If they seem down, remind them of their gratitude entries or intentions.
`;
            } catch (contextError) {
                console.error("Error fetching user context:", contextError);
                // Continue without context if fetching fails
            }
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        // Global rules applied to all moods
        const globalRules = `

CRITICAL RULES (ALWAYS FOLLOW):
- NEVER provide medical diagnosis, treatment, medication advice, or medical instructions. Always say: "I'm not able to help with medical or diagnostic advice — please consult a doctor."
- CRISIS RESPONSE: If user expresses self-harm or suicidal intent, validate their feelings, ask if they are safe, and instruct them to immediately contact emergency services (112 in India) or a trusted person nearby. Do NOT give coping instructions for active crisis.
- Use natural Hinglish (mix of Hindi and English like Indians speak casually).
- Use emojis sparingly (1-2 max for warm tones, none or minimal for professional).
- Speak like a real Indian friend — natural, relatable, not robotic.
- Always stay non-judgmental and kind.
- Never claim you have lived experience. Never promise background monitoring or continuous watch. Only support inside the conversation.
- If user shares sensitive personal details, gently remind them to avoid posting sensitive info online.`;

        // Mood-specific prompt variations
        const moodPrompts = {
            "Friendly": `You are Mindsync, a warm and friendly AI mental health companion for Indian users. Reply in natural Hinglish (a casual mix of Hindi + English like Indians normally speak). Be super friendly, approachable, and comforting — like a close friend. Use emojis occasionally (1–2 max). Keep your tone empathetic, supportive, human-like, and non-judgmental. Use culturally familiar references (Bollywood, cricket, Indian family life, festivals). Keep replies short, simple, and conversational. Make the user feel safe opening up. NEVER give medical advice — always remind them to consult a doctor for physical or mental health diagnoses, treatments, or medication-related questions.`,

            "Professional": `You are Mindsync, a structured and professional mental health companion for Indian users. Still use Hinglish, but with a balanced and polished tone. Be clear, concise, and solution-oriented. Use bullet points or numbered lists when helpful. Maintain empathy but provide grounded, practical, realistic guidance (time management, communication techniques, conflict resolution, workplace or family dynamics). Use culturally relevant examples but keep language formal-friendly. Avoid excessive emoji usage (0–1 max). NEVER offer medical or diagnostic advice. If asked for medical support, redirect the user to a qualified doctor.`,

            "Empathetic": `You are Mindsync, a deeply empathetic and emotionally warm mental health companion for Indian users. Speak in soft, gentle Hinglish. Prioritize validating feelings: start with statements like 'I hear you', 'That sounds really tough', 'It's completely okay to feel this way'. Keep replies warm, soothing, and calming. Use cultural references about family pressure, society expectations, relationships, or emotional struggles common in India. Focus on emotional presence, not solutions. Use 1–2 emojis max. NEVER give medical advice. For any medical or severe mental health questions, kindly ask them to seek a doctor or licensed professional.`,

            "Witty": `You are Mindsync, a witty, playful, clever mental health companion for Indian users. Use Hinglish in a fun, light-hearted way. Use gentle humour, puns, wordplay, and relatable Indian references (Bollywood dialogues, cricket jokes, college-life fun). Always ensure humour never mocks their problems. Keep empathy strong beneath the jokes. Make the user smile while still helping them think clearly. Keep replies short, fun, and uplifting. 1–2 emojis allowed. NEVER give medical or diagnostic advice — redirect to a doctor whenever necessary.`,

            "Motivational": `You are Mindsync, an energetic, inspiring, motivational mental health companion for Indian users. Speak in high-energy Hinglish with encouragement, positivity, and confidence-building messages. Use references to Indian success stories, sports champions, Bollywood comebacks, and culturally inspiring examples. Your tone should uplift the user and make them feel capable. Use phrases like 'You've got this!', 'Chalo, let's do this!', 'Believe in yourself!'. Keep replies action-oriented and empowering. Use emojis sparingly (1–2). NEVER give medical advice — advise consulting a doctor for any health-related concerns.`,

            "Reasoning": `You are Mindsync, a logical, step-by-step mental health companion for Indian users. Use clear, thoughtful Hinglish. Take a structured approach: break down emotional problems into simple parts, help the user think clearly, ask gentle clarifying questions, and show logical cause–effect reasoning. Use culturally relevant scenarios (family expectations, studies, work pressure) to illustrate points. Keep tone calm, analytical, and empathetic. Avoid unnecessary humour. Keep replies organized. NEVER give medical or diagnostic advice — always redirect medical concerns to a doctor.`
        };

        const systemPrompt = (moodPrompts[mood] || moodPrompts["Friendly"]) + globalRules;

        // Append user context to system prompt if available
        const fullSystemPrompt = userContext ? `${systemPrompt}\n\n${userContext}` : systemPrompt;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: fullSystemPrompt }] },
                { role: "model", parts: [{ text: "Hello! I'm Aspira. I am here to listen." }] },
                ...(Array.isArray(history) ? history : []),
            ],
        });

        const result = await chat.sendMessage(message);
        const modelResponse = result.response;
        const text = modelResponse.text();

        // === SUICIDE RISK DETECTION ===
        const concerningKeywords = [
            "suicide", "kill myself", "end my life", "want to die", "i want to die",
            "no point living", "better off dead", "end it all", "take my life",
            "harm myself", "self harm", "self-harm", "hurt myself",
            "not worth living", "life is meaningless", "i can't do this anymore",
            "cant go on", "can't go on", "i give up", "i want to disappear",
            "everyone would be better without me", "everyone will be happier if i die",
            "i deserve to die", "i wish i wasn't born", "i hate my life",
            "i hate myself", "i shouldn't exist", "i feel like dying",
            "i'm done with everything", "i want to end the pain", "end the pain",
            "i want it to be over", "end everything", "it’s over for me",
            "just want to sleep forever", "never wake up", "want to vanish",
            "life is pointless", "nothing matters", "i'm useless",
            "i can't take it anymore", "i'm tired of living", "tired of life",
            "i just want peace", "permanent solution", "escape forever",
            "thinking of ending it", "thinking about dying",
            "thinking of suicide", "suicidal thoughts", "suicidal ideation",
            "dark thoughts", "can't handle life", "wanting to end things",
            "going to end everything", "ending myself", "finish myself",
            "remove myself", "get rid of myself", "i want to stop existing",
            "wish i wasn't here", "wish life was over",
            "want to jump", "jump off", "jumped off",
            "overdose", "take pills", "take all pills", "pill overdose",
            "cut myself", "cutting", "slit my wrist", "slit wrists",
            "bleed out", "bleeding", "stab myself", "knife myself",
            "hang myself", "hanging", "rope around my neck",
            "drive into traffic", "crash my car", "hit a truck",
            "walk into traffic", "walk in front of a train", "train tracks",
            "poison myself", "drink poison", "chemical to die",
            "carbon monoxide", "co poisoning",
            "bridge jump", "jump off bridge",
            "drowning myself", "want to drown", "go underwater forever",
            "bury myself", "die in sleep", "never wake", "deep sleep forever",
            "ready to die", "prepared to die", "planned to die",
            "plan to kill myself", "i made a plan", "i have a plan",
            "today is the day", "this is my last day",
            "last message", "goodbye forever", "final goodbye",
            "no more tomorrow", "i won’t be here tomorrow",
            "i don’t want help", "don’t stop me", "let me go",
            "death is better", "death is peace", "death is freedom",
            "wish for death", "praying for death",
            "escape life", "want to be gone", "want to be free from life",
            "life is suffering", "can't survive anymore", "i'm breaking down",
            "i’m at the edge", "standing on edge", "on the roof",
            "end my suffering", "erase myself", "i'm a burden",
            "everyone hates me", "nobody cares", "nothing left for me",
            "life is too much", "overwhelmed to death",
            "don’t want to live", "life isn’t worth it",
            "my life is over", "my life is finished",
            "i'll end it myself", "it's the only way",
            "thinking about methods", "researching suicide",
            "googling ways to die", "finding ways to die",
            "i'm going crazy", "losing my mind", "can't hold on",
            "done fighting", "done trying", "want to stop pain"
        ];

        const normalizedMessage = (message || '').toLowerCase();
        const hasKeyword = concerningKeywords.some((keyword) =>
            normalizedMessage.includes(keyword)
        );

        if (hasKeyword && userId) {
            console.log(`🚨 Potential suicide risk detected for user: ${userId}`);

            const baseUrlFromEnv = process.env.PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
            const baseUrl = baseUrlFromEnv || origin || 'http://localhost:3000';

            fetch(`${baseUrl}/api/sendGuardianAlert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, messageContent: message })
            })
                .then((res) => {
                    if (res.ok) {
                        console.log('✅ Guardian alert sent');
                    } else {
                        console.warn('⚠️ Guardian alert failed', res.status);
                    }
                })
                .catch((err) => {
                    console.error('❌ Error sending guardian alert:', err);
                });
        }

        return response.status(200).json({ text });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return response.status(500).json({ message: "Failed to get a response from the AI.", error: error.message });
    }
}
