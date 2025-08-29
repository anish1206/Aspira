// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.chatHistory = new Map(); // userId -> conversation history
  }

  async generateResponse(message, userId, context = {}) {
    try {
      const { language = 'en', mood = null, previousMessages = [] } = context;
      
      // Create culturally-aware prompt for Indian youth
      const systemPrompt = `You are a compassionate AI counselor for Mindsync, specifically designed to support Indian youth (13-28 years) with mental health challenges. 

Key guidelines:
- Be empathetic, non-judgmental, and culturally sensitive
- Use ${language === 'hi' ? 'Hindi mixed with English (Hinglish)' : 
                   language === 'ta' ? 'Tamil concepts with English' :
                   language === 'bn' ? 'Bengali concepts with English' : 'English'}
- Reference Indian cultural contexts, festivals, family dynamics when relevant
- Provide practical coping strategies suitable for Indian lifestyle
- If crisis indicators detected, gently suggest professional help
- Keep responses warm but professional, around 2-3 sentences
- Use inclusive language for all genders and backgrounds

Current user mood: ${mood || 'unknown'}
Previous context: ${previousMessages.slice(-2).map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

User message: ${message}`;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Store conversation history
      if (!this.chatHistory.has(userId)) {
        this.chatHistory.set(userId, []);
      }
      
      const history = this.chatHistory.get(userId);
      history.push(
        { sender: 'user', text: message, timestamp: new Date() },
        { sender: 'ai', text: text, timestamp: new Date() }
      );
      
      // Keep only last 10 messages to manage memory
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }
      
      return {
        response: text,
        sentiment: await this.analyzeSentiment(message),
        crisisScore: await this.assessCrisis(message)
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        response: "I'm having trouble processing your message right now. Please try again in a moment.",
        sentiment: 'neutral',
        crisisScore: 0
      };
    }
  }

  async analyzeSentiment(text) {
    try {
      const prompt = `Analyze the emotional sentiment of this text. Return only one word: positive, negative, or neutral. Text: "${text}"`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim().toLowerCase();
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return 'neutral';
    }
  }

  async assessCrisis(text) {
    try {
      const prompt = `Assess if this text indicates mental health crisis, self-harm, or suicide ideation. Return a number 0-10 where 0 = no risk, 10 = immediate crisis. Text: "${text}"`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const score = parseInt(response.text().trim());
      return isNaN(score) ? 0 : Math.max(0, Math.min(10, score));
    } catch (error) {
      console.error('Crisis assessment error:', error);
      return 0;
    }
  }

  async moderateContent(text, context = {}) {
    try {
      const { userType = 'peer', groupTopic = 'general', userHistory = [] } = context;
      
      const moderationPrompt = `You are a content moderator for a mental health support platform for Indian youth. 

Analyze this message for:
1. Inappropriate content (hate speech, harassment, spam)
2. Self-harm or suicide ideation (flag for crisis intervention)
3. Medical misinformation or harmful advice
4. Privacy violations or personal information sharing
5. Off-topic content for mental health discussions
6. Cultural insensitivity or discrimination

Context:
- Group topic: ${groupTopic}
- User type: ${userType}
- Platform: Mental health support for Indian youth (13-28 years)

Message to moderate: "${text}"

Return JSON with:
{
  "appropriate": true/false,
  "confidence": 0.0-1.0,
  "reason": "specific explanation if inappropriate",
  "severity": "low/medium/high/critical",
  "categories": ["list of issues found"],
  "crisisFlag": true/false,
  "suggestedAction": "block/warn/review/allow",
  "culturalSensitivity": true/false
}`;

      const result = await this.model.generateContent(moderationPrompt);
      const response = await result.response;
      
      try {
        const moderation = JSON.parse(response.text().trim());
        
        // Additional keyword-based safety checks
        const keywordCheck = this.performKeywordModeration(text);
        
        // Combine AI and keyword results
        return {
          ...moderation,
          keywordFlags: keywordCheck,
          appropriate: moderation.appropriate && keywordCheck.appropriate,
          finalReason: moderation.appropriate && !keywordCheck.appropriate ? 
            keywordCheck.reason : moderation.reason
        };
      } catch (parseError) {
        console.error('Error parsing moderation response:', parseError);
        // Fallback to keyword-based moderation
        return this.performKeywordModeration(text);
      }
    } catch (error) {
      console.error('Content moderation error:', error);
      // Fail-safe: allow content but log for manual review
      return { 
        appropriate: true, 
        confidence: 0.0,
        reason: "Moderation system temporarily unavailable",
        severity: "unknown",
        suggestedAction: "review",
        error: true
      };
    }
  }

  performKeywordModeration(text) {
    const lowerText = text.toLowerCase();
    
    const moderationRules = {
      critical: {
        keywords: ['kill myself', 'suicide', 'end my life', 'want to die', 'self harm', 'cutting'],
        reason: 'Contains crisis/self-harm language requiring immediate intervention',
        crisisFlag: true
      },
      high: {
        keywords: ['fuck', 'shit', 'bitch', 'asshole', 'hate you', 'kill you'],
        reason: 'Contains inappropriate language or harassment'
      },
      medium: {
        keywords: ['phone number', 'address', 'email@', 'instagram.com', 'facebook.com'],
        reason: 'Contains personal information that should not be shared'
      },
      spam: {
        keywords: ['buy now', 'click here', 'free money', 'guaranteed', 'limited offer'],
        reason: 'Appears to be spam or promotional content'
      }
    };
    
    for (const [level, rule] of Object.entries(moderationRules)) {
      for (const keyword of rule.keywords) {
        if (lowerText.includes(keyword)) {
          return {
            appropriate: false,
            reason: rule.reason,
            severity: level,
            categories: [level],
            crisisFlag: rule.crisisFlag || false,
            suggestedAction: level === 'critical' ? 'block' : level === 'high' ? 'warn' : 'review',
            confidence: 0.9
          };
        }
      }
    }
    
    return {
      appropriate: true,
      reason: '',
      severity: 'none',
      categories: [],
      crisisFlag: false,
      suggestedAction: 'allow',
      confidence: 0.8
    };
  }

  async generateSupportiveResponse(originalMessage, context = {}) {
    try {
      const supportPrompt = `A user in a mental health support group shared: "${originalMessage}"

Generate a brief, empathetic, and supportive response (1-2 sentences) that:
- Acknowledges their feelings
- Offers gentle encouragement
- Is culturally appropriate for Indian youth
- Maintains appropriate boundaries
- Encourages professional help if needed

Do not provide medical advice. Focus on emotional support and validation.`;

      const result = await this.model.generateContent(supportPrompt);
      const response = await result.response;
      
      return {
        response: response.text().trim(),
        type: 'supportive_ai_response'
      };
    } catch (error) {
      console.error('Error generating supportive response:', error);
      return {
        response: "Thank you for sharing. Your feelings are valid and you're not alone in this journey. 💙",
        type: 'fallback_response'
      };
    }
  }

  getChatHistory(userId) {
    return this.chatHistory.get(userId) || [];
  }
}

export default new GeminiService();
