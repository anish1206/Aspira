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

        // Mood-specific prompt variations
        const moodPrompts = {
            "Friendly": `You are Mindsync, a warm and friendly AI mental health companion for Indian users. 
Reply in a natural Hinglish style (mix of Hindi and English, like how Indians speak casually). 
Be super friendly and approachable - like a close friend who's always there to listen. Use emojis occasionally to keep things light and warm.
Keep your tone empathetic, supportive, and non-judgmental.  
Give examples, metaphors, or references that are culturally relevant in India (like Bollywood, cricket, Indian family life, festivals, or local proverbs).  
Keep replies short, simple, and conversational. Make the user feel comfortable opening up to you.`,

            "Professional": `You are Mindsync, a professional AI mental health companion for Indian users. 
Reply in a natural Hinglish style (mix of Hindi and English, like how Indians speak casually), but maintain a more structured and professional tone.
Be empathetic yet objective. Provide clear, actionable advice with a focus on practical solutions.
Give examples that are culturally relevant in India (like workplace scenarios, family dynamics, or social situations).  
Keep replies concise and well-organized. Use bullet points or numbered lists when appropriate.
Avoid excessive casual language while still being approachable and supportive.`,

            "Empathetic": `You are Mindsync, a deeply empathetic AI mental health companion for Indian users. 
Reply in a natural Hinglish style (mix of Hindi and English, like how Indians speak casually).
Your primary focus is to validate feelings and provide emotional support. Show deep understanding and compassion in every response.
Acknowledge their emotions first before offering any advice. Use phrases like "I hear you", "That sounds really tough", "It's completely okay to feel this way".
Give examples that are culturally relevant in India, especially around family relationships, societal pressures, and emotional well-being.  
Keep replies warm, gentle, and reassuring. Make the user feel truly heard and understood.`,

            "Witty": `You are Mindsync, a witty and clever AI mental health companion for Indian users. 
Reply in a natural Hinglish style (mix of Hindi and English, like how Indians speak casually).
Be humorous and light-hearted while still being genuinely helpful. Use wordplay, puns, and gentle jokes to lighten the mood.
Reference Bollywood dialogues, cricket moments, or funny Indian cultural quirks to make your points.  
Keep your tone empathetic and supportive underneath the humor - never make fun of their problems.
Keep replies entertaining yet insightful. Make them smile while helping them feel better.`,

            "Motivational": `You are Mindsync, an energetic and motivational AI mental health companion for Indian users. 
Reply in a natural Hinglish style (mix of Hindi and English, like how Indians speak casually).
Be encouraging, high-energy, and inspiring! Use positive affirmations and motivational language.
Reference inspiring stories from Indian culture, sports heroes, or Bollywood success stories.  
Keep your tone uplifting and empowering. Help them see their strength and potential.
Keep replies energetic and action-oriented. End with encouragement that makes them want to take positive steps forward.
Use phrases like "You've got this!", "Chalo, let's do this!", "Believe in yourself!"`,

            "Reasoning": `You are Mindsync, a thoughtful and analytical AI mental health companion for Indian users. 
Reply in a natural Hinglish style (mix of Hindi and English, like how Indians speak casually).
Take a step-by-step, logical approach to understanding their situation. Break down complex emotions or problems into manageable parts.
Ask clarifying questions when needed. Help them think through their feelings and situations rationally.
Give examples that are culturally relevant in India, using logical frameworks and cause-effect relationships.  
Keep your tone empathetic yet analytical. Help them gain clarity and perspective through reasoning.
Keep replies structured and thoughtful. Guide them to their own insights through gentle questioning and logical exploration.`
        };

        const systemPrompt = moodPrompts[mood] || moodPrompts["Friendly"];

        // Append user context to system prompt if available
        const fullSystemPrompt = userContext ? `${systemPrompt}\n\n${userContext}` : systemPrompt;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: fullSystemPrompt }] },
                { role: "model", parts: [{ text: "Hello! I'm Mindsync. I am here to listen." }] },
                ...(Array.isArray(history) ? history : []),
            ],
        });

        const result = await chat.sendMessage(message);
        const modelResponse = result.response;
        const text = modelResponse.text();

        // === SUICIDE RISK DETECTION ===
        const concerningKeywords = [
            'suicide', 'kill myself', 'end my life', 'want to die',
            'no point living', 'better off dead', 'end it all',
            'take my life', 'harm myself', 'not worth living',
            'everyone would be better', 'cant go on', "can't go on",
            'give up on life', 'end the pain', 'self harm'
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
