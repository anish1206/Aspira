// /api/askGemini.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get the API key from Vercel's environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This is the main function that will be executed
export default async function handler(request, response) {
  // We only want to allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }
  
  const { history, message } = request.body;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const systemPrompt = `You are Mindsync, a supportive and empathetic AI assistant for a youth mental wellness app... (rest of your prompt here)`;

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Hello! I'm Mindsync. How can I help you today?" }] },
      ...history,
    ],
  });

  try {
    const result = await chat.sendMessage(message);
    const modelResponse = result.response;
    const text = modelResponse.text();
    
    // Send the response back to the React app
    return response.status(200).json({ text });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return response.status(500).json({ message: "Failed to get a response from the AI." });
  }
}