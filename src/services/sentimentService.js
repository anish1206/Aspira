// src/services/sentimentService.js
import axios from 'axios';

const API_KEY = process.env.REACT_APP_GOOGLE_NLP_API_KEY;
const BASE_URL = 'https://language.googleapis.com/v1/documents';

class SentimentService {
  constructor() {
    // IMPROVEMENT: Keywords are pre-lowercased for efficiency.
    this.crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'worthless', 'hopeless', 
      "can't go on", 'self harm', 'cutting', 'overdose', 'jump off',
      'marne ka mann', 'खुदकुशी', 'आत्महत्या', 'मरना चाहता हूं'
    ].map(k => k.toLowerCase());
    
    // NOTE: Helpline numbers should be verified for accuracy and relevance.
    this.emergencyContacts = {
      india: {
        national: '9152987821', // AASRA (Removed country code for easier tel: links)
        // Vandrevala Foundation is a prominent helpline with a Mumbai presence
        mumbai: '9999666555', 
        // Sneha Foundation is primarily Chennai-based, but helps all over.
        chennai: '04424640050', 
        delhi: '01140769002' // Sumaitri
      }
    };
  }

  async analyzeSentiment(text, language = 'en') {
    if (!API_KEY) {
        console.warn('Google NLP API Key not found. Falling back to basic analysis.');
        return this.basicSentimentAnalysis(text);
    }
    try {
      const response = await axios.post(
        `${BASE_URL}:analyzeSentiment?key=${API_KEY}`,
        {
          document: {
            type: 'PLAIN_TEXT',
            content: text,
            language: language
          },
          encodingType: 'UTF8'
        }
      );

      const sentiment = response.data.documentSentiment;
      return {
        score: sentiment.score, // -1 to 1
        magnitude: sentiment.magnitude, // 0 to infinity
        label: this.getSentimentLabel(sentiment.score),
        confidence: Math.abs(sentiment.score)
      };
    } catch (error) {
      console.error('Sentiment Analysis API Error:', error);
      // Fallback to basic keyword analysis
      return this.basicSentimentAnalysis(text);
    }
  }

  getSentimentLabel(score) {
    if (score > 0.25) return 'positive';
    if (score < -0.25) return 'negative';
    return 'neutral';
  }

  // IMPROVEMENT: Uses word boundaries for more accurate matching.
  basicSentimentAnalysis(text) {
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'better', 'improved'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'depressed', 'anxious', 'worried', 'scared', 'upset'];
    
    const lowerText = text.toLowerCase();
    
    const countWords = (wordList) => {
        return wordList.reduce((count, word) => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = lowerText.match(regex);
            return count + (matches ? matches.length : 0);
        }, 0);
    };

    let positiveCount = countWords(positiveWords);
    let negativeCount = countWords(negativeWords);
    
    const totalWords = positiveCount + negativeCount;
    if (totalWords === 0) {
        return { score: 0, magnitude: 0, label: 'neutral', confidence: 0.5 };
    }

    const score = (positiveCount - negativeCount) / totalWords;
    
    return {
      score,
      magnitude: Math.abs(score),
      label: this.getSentimentLabel(score),
      confidence: 0.5
    };
  }

  async detectCrisis(text, moodScore = 3) {
    const lowerText = text.toLowerCase();
    
    // IMPROVEMENT: Use regex with word boundaries for safer and more accurate matching.
    const keywordMatches = this.crisisKeywords.filter(keyword => {
        const regex = new RegExp(`\\b${keyword.replace(/\s/g, '\\s')}\\b`);
        return regex.test(lowerText);
    });
    
    let riskScore = 0;
    
    if (keywordMatches.length > 0) {
      riskScore += keywordMatches.length * 3;
    }
    
    if (moodScore <= 2) riskScore += 2;
    if (moodScore === 1) riskScore += 3; // Cumulative with the above line
    
    const sentiment = await this.analyzeSentiment(text);
    if (sentiment.score < -0.5) riskScore += 2;
    // High magnitude can indicate strong emotion, either positive or negative.
    // Only add risk if the sentiment is not positive.
    if (sentiment.magnitude > 1.5 && sentiment.score <= 0.25) riskScore += 1;
    
    const crisisLevel = Math.min(10, riskScore);
    
    return {
      riskScore: crisisLevel,
      level: this.getCrisisLevel(crisisLevel),
      keywordsFound: keywordMatches,
      recommendation: this.getCrisisRecommendation(crisisLevel),
      emergencyContacts: crisisLevel >= 7 ? this.getEmergencyContacts('india') : null
    };
  }

  getCrisisLevel(score) {
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 4) return 'moderate';
    if (score >= 2) return 'low';
    return 'none';
  }

  getCrisisRecommendation(score) {
    if (score >= 8) {
      return {
        message: 'Please reach out for immediate support. You are not alone.',
        actions: ['call_emergency', 'contact_counselor', 'reach_friend'],
        urgency: 'immediate'
      };
    } else if (score >= 6) {
      return {
        // FIXED: Corrected escape character
        message: "It sounds like you're going through a difficult time. Consider talking to someone.",
        actions: ['schedule_counselor', 'use_ai_chat', 'join_support_group'],
        urgency: 'soon'
      };
    } else if (score >= 4) {
      return {
        message: 'Take care of yourself. Here are some resources that might help.',
        actions: ['ai_chat', 'mood_exercises', 'peer_support'],
        urgency: 'when_ready'
      };
    }
    return null;
  }

  async analyzeEmotions(text) {
    if (!API_KEY) return [];
    try {
      const response = await axios.post(
        `${BASE_URL}:classifyText?key=${API_KEY}`,
        {
          document: {
            type: 'PLAIN_TEXT',
            content: text
          }
        }
      );
      return response.data.categories || [];
    } catch (error) {
      console.error('Emotion analysis error:', error);
      return [];
    }
  }

  getEmergencyContacts(region = 'india') {
    return this.emergencyContacts[region] || this.emergencyContacts.india;
  }

  /**
   * Assess mental health patterns from a series of check-ins.
   * CRITICAL: The 'checkins' array MUST be sorted chronologically, with the most recent check-in at index 0.
   * @param {Array<Object>} checkins - An array of checkin objects, e.g., [{ mood: 4, date: ... }, { mood: 2, date: ... }]
   */
  assessMentalHealthPatterns(checkins) {
    if (!checkins || checkins.length < 3) return { pattern: 'insufficient_data' };
    
    const moods = checkins.map(c => c.mood);
    const avgMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    const trend = this.calculateTrend(moods);
    const recentLowMoods = checkins.slice(0, 3).filter(c => c.mood <= 2).length;
    
    return {
      averageMood: avgMood.toFixed(1),
      trend, // 'improving', 'declining', 'stable'
      recentConcern: recentLowMoods >= 2,
      recommendation: this.getPatternRecommendation(avgMood, trend, recentLowMoods >= 2)
    };
  }

  calculateTrend(moodArray) {
    if (moodArray.length < 2) return 'stable';
    
    // Split array into first half and second half
    const midpoint = Math.ceil(moodArray.length / 2);
    const recentHalf = moodArray.slice(0, midpoint);
    const olderHalf = moodArray.slice(midpoint);

    // Handle case with only two points
    if(olderHalf.length === 0) {
        if (recentHalf[0] > recentHalf[1]) return 'improving';
        if (recentHalf[0] < recentHalf[1]) return 'declining';
        return 'stable';
    }

    const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length;
    const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  getPatternRecommendation(avgMood, trend, recentConcern) {
    if (recentConcern && trend === 'declining') {
      return {
        message: 'Your recent mood pattern shows some concerning trends. Consider reaching out for support.',
        priority: 'high',
        suggestions: ['schedule_counselor', 'increase_checkins', 'use_ai_chat']
      };
    } else if (avgMood < 2.5 && trend !== 'improving') {
      return {
        // FIXED: Corrected escape character
        message: "Your overall mood has been low recently. Let's work on some strategies together.",
        priority: 'medium',
        suggestions: ['mood_exercises', 'peer_support', 'regular_checkins']
      };
    } else if (trend === 'improving') {
      return {
        message: 'Great progress! Your mood has been improving. Keep up the good work!',
        priority: 'positive',
        suggestions: ['maintain_habits', 'celebrate_progress', 'help_others']
      };
    }
    
    return {
      // FIXED: Corrected escape character
      message: "You're doing well with regular check-ins. Keep taking care of yourself!",
      priority: 'normal',
      suggestions: ['continue_checkins', 'explore_features']
    };
  }
}

export default new SentimentService();