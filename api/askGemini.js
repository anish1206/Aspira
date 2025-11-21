// /api/askGemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";

// Get the API key from Vercel's environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// IMPORTANT: Define which website(s) are allowed to make requests to this API
// Allow both Firebase Hosting (web.app and firebaseapp.com) and local dev
const allowedOrigins = new Set([
    'https://genai2505.web.app',
    'https://genai2505.firebaseapp.com',
    'http://localhost:3000',
    // Vercel preview and production domains
    'https://mindsync.vercel.app',
    'https://mindsync-6p3xfn6ko-anishs-projects-799e04e9.vercel.app',
    'https://mindsync-majg12jao-anishs-projects-799e04e9.vercel.app',
]);

// This is the main function that will be executed
export default async function handler(request, response) {
    // --- Start of CORS Preflight Check ---
    // This part handles the initial "permission check" request from the browser
    const origin = request.headers.origin || '';
    const corsOrigin = allowedOrigins.has(origin) ? origin : '';
    response.setHeader('Access-Control-Allow-Credentials', true);
    if (corsOrigin) {
        response.setHeader('Access-Control-Allow-Origin', corsOrigin);
    }
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // If this is a preflight OPTIONS request, we're done.
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }
    // --- End of CORS Preflight Check ---


    // We only want to allow POST requests for the actual chat logic
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method not allowed' });
    }

    const { history, message } = request.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        const systemPrompt = `You are Mindsync, you are a friendly AI mental health companion for Indian users. 
Always reply in a natural Hinglish style (mix of Hindi and English, like how Indians speak casually). 
Keep your tone empathetic, supportive, and non-judgmental.  
Give examples, metaphors, or references that are culturally relevant in India (like Bollywood, cricket, Indian family life, festivals, or local proverbs).  
Avoid sounding robotic or overly formal.  
Keep replies short, simple, and easy to understand. 
`;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Hello! I'm Mindsync. I am here to listen." }] },
                ...history,
            ],
        });

        const result = await chat.sendMessage(message);
        const modelResponse = result.response;
        const text = modelResponse.text();

        // Send the response back to the React app
        return response.status(200).json({ text });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return response.status(500).json({ message: "Failed to get a response from the AI.", error: error.message, stack: error.stack });
    }
}