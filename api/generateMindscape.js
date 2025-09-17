// /api/generateMindscape.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Initialize the Google AI Client ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- The Main Handler Function ---
module.exports = async (request, response) => {
  // (CORS headers and method checks)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') { return response.status(200).end(); }
  if (request.method !== 'POST') { return response.status(405).json({ message: 'Method not allowed' }); }

  try {
    const { userInput } = request.body;
    if (!userInput) {
      return response.status(400).json({ message: 'User input is required.' });
    }

    // --- STEP 1: The "Prompt Enhancer" (Text-to-Text) ---
    console.log("Step 1: Enhancing user prompt...");
    const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const enhancerSystemPrompt = `You are an artistic prompt engineer. Your job is to take a user's simple feeling or idea and expand it into a rich, detailed, and artistic prompt for an image generation model. The style should be tranquil, beautiful, and photorealistic, focusing on serene landscapes or abstract concepts. Do not include any people or animals. Focus on atmosphere, light, and color. Make it one single paragraph.`;
    
    const enhancerResult = await textModel.generateContent([enhancerSystemPrompt, userInput]);
    const enhancedPrompt = enhancerResult.response.text();
    console.log("Enhanced Prompt:", enhancedPrompt);


    // --- STEP 2: The "Image Generator" (Text-to-Image) ---
    console.log("Step 2: Generating image with the enhanced prompt...");
    // Initialize the specific image model
    const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    // The image model takes the prompt as a simple string
    const imageResult = await imageModel.generateContent(enhancedPrompt);
    
    // The image data is in the response as a Base64 encoded string
    const base64ImageData = imageResult.response.candidates[0].content.parts[0].inlineData.data;

    if (!base64ImageData) {
        throw new Error("Image generation failed to produce data.");
    }
    console.log("Image generation successful.");


    // --- STEP 3: Send the Image Data Back to the Frontend ---
    return response.status(200).json({
      success: true,
      imageData: base64ImageData,
      promptUsed: enhancedPrompt // Sending this back is good for debugging
    });

  } catch (error) {
    console.error("Mindscape generation error:", error);
    // It's helpful to see the error details in the logs
    if (error.response) {
      console.error(error.response.data);
    }
    return response.status(500).json({ success: false, message: error.message || "An internal error occurred." });
  }
};