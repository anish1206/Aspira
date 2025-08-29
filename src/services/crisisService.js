// src/services/crisisService.js
import dataService from './dataService';
import geminiService from './geminiService';
import sentimentService from './sentimentService';
import notificationService from './notificationService';

class CrisisService {
  constructor() {
    this.crisisThresholds = {
      LOW: 3,
      MODERATE: 5,
      HIGH: 7,
      CRITICAL: 8
    };
    
    this.interventionProtocols = {
      LOW: {
        actions: ['ai_support', 'mood_exercises'],
        message: 'We noticed you might be having a tough day. Remember that it\'s okay to not be okay.',
        escalate: false
      },
      MODERATE: {
        actions: ['ai_support', 'peer_groups', 'self_care_resources'],
        message: 'It seems like you\'re going through something difficult. Would you like to connect with peer support or try some coping strategies?',
        escalate: false
      },
      HIGH: {
        actions: ['counselor_booking', 'crisis_resources', 'peer_support'],
        message: 'We\'re concerned about how you\'re feeling. Please consider talking to a counselor or reaching out to crisis support.',
        escalate: true,
        notifyCounselors: true
      },
      CRITICAL: {
        actions: ['immediate_counselor', 'emergency_contacts', 'crisis_hotline'],
        message: 'We\'re very worried about you right now. Please reach out for immediate help - you\'re not alone.',
        escalate: true,
        notifyCounselors: true,
        sendEmergencyAlert: true
      }
    };
    
    this.emergencyContacts = {
      india: {
        aasra: { name: 'AASRA', phone: '+91-9152987821', available: '24x7', languages: ['en', 'hi'] },
        sneha: { name: 'Sneha', phone: '+91-80-25497777', available: '24x7', languages: ['en', 'kn'] },
        sumaitri: { name: 'Sumaitri', phone: '+91-11-23389090', available: '10 AM - 10 PM', languages: ['en', 'hi'] },
        icall: { name: 'iCall', phone: '+91-9152987821', available: 'Mon-Sat 8AM-10PM', languages: ['en', 'hi', 'mr'] }
      }
    };
  }

  async assessCrisisLevel(text, mood = 3, voiceAnalysis = null, userHistory = []) {
    try {
      // Multi-factor crisis assessment
      let crisisScore = 0;
      const factors = [];

      // 1. Direct crisis keyword analysis
      const keywordAnalysis = this.analyzeKeywords(text);
      crisisScore += keywordAnalysis.score;
      if (keywordAnalysis.score > 0) {
        factors.push(`Crisis keywords detected: ${keywordAnalysis.matches.join(', ')}`);
      }

      // 2. Mood factor
      if (mood <= 1) {
        crisisScore += 3;
        factors.push('Extremely low mood reported');
      } else if (mood === 2) {
        crisisScore += 2;
        factors.push('Low mood reported');
      }

      // 3. AI sentiment analysis via Gemini
      const aiCrisisScore = await geminiService.assessCrisis(text);
      crisisScore += Math.round(aiCrisisScore * 0.7); // Weight AI assessment
      if (aiCrisisScore > 5) {
        factors.push('AI detected concerning language patterns');
      }

      // 4. Voice analysis if available
      if (voiceAnalysis) {
        const voiceCrisisScore = this.analyzeVoiceForCrisis(voiceAnalysis);
        crisisScore += voiceCrisisScore;
        if (voiceCrisisScore > 2) {
          factors.push('Voice analysis indicates distress');
        }
      }

      // 5. Historical pattern analysis
      const historyScore = this.analyzeHistoricalPatterns(userHistory);
      crisisScore += historyScore;
      if (historyScore > 1) {
        factors.push('Recent pattern of declining mood');
      }

      // Normalize crisis score (0-10)
      const finalScore = Math.min(10, Math.max(0, crisisScore));
      
      return {
        score: finalScore,
        level: this.getCrisisLevel(finalScore),
        factors,
        recommendation: this.getRecommendation(finalScore),
        protocol: this.interventionProtocols[this.getCrisisLevel(finalScore)]
      };
    } catch (error) {
      console.error('Error assessing crisis level:', error);
      return {
        score: 0,
        level: 'LOW',
        factors: [],
        recommendation: null,
        protocol: this.interventionProtocols.LOW
      };
    }
  }

  analyzeKeywords(text) {
    const crisisKeywords = {
      critical: {
        words: ['kill myself', 'suicide', 'end it all', 'want to die', 'take my life', 'jump off', 'overdose'],
        score: 5
      },
      high: {
        words: ['self harm', 'cutting', 'hurt myself', 'worthless', 'no point living', 'can\'t go on'],
        score: 3
      },
      moderate: {
        words: ['hopeless', 'useless', 'burden', 'hate myself', 'wish I was dead', 'better off dead'],
        score: 2
      }
    };

    const lowerText = text.toLowerCase();
    let totalScore = 0;
    const matches = [];

    Object.entries(crisisKeywords).forEach(([level, data]) => {
      data.words.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          totalScore += data.score;
          matches.push(`${keyword} (${level})`);
        }
      });
    });

    return { score: totalScore, matches };
  }

  analyzeVoiceForCrisis(voiceAnalysis) {
    let score = 0;
    
    // Check transcript content
    if (voiceAnalysis.transcript) {
      const keywordAnalysis = this.analyzeKeywords(voiceAnalysis.transcript);
      score += keywordAnalysis.score * 0.5; // Voice is weighted less than text
    }
    
    // Factor in detected mood from voice
    if (voiceAnalysis.detectedMood === 'sad') score += 2;
    if (voiceAnalysis.detectedMood === 'anxious') score += 1.5;
    if (voiceAnalysis.detectedMood === 'angry') score += 1;
    
    // Consider confidence - low confidence might indicate distressed speech
    if (voiceAnalysis.confidence < 0.3) score += 1;
    
    return Math.round(score);
  }

  analyzeHistoricalPatterns(userHistory) {
    if (userHistory.length < 3) return 0;
    
    // Look at recent mood trends
    const recentMoods = userHistory.slice(0, 5).map(h => h.mood);
    const avgRecentMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
    
    let score = 0;
    
    // Declining mood pattern
    if (avgRecentMood < 2.5) score += 2;
    
    // Consecutive low moods
    const consecutiveLowMoods = this.countConsecutiveLowMoods(recentMoods);
    if (consecutiveLowMoods >= 3) score += 2;
    if (consecutiveLowMoods >= 5) score += 1;
    
    // Recent crisis events
    const recentCrisisEvents = userHistory.filter(h => 
      h.crisisScore && h.crisisScore > 5 && 
      Date.now() - new Date(h.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );
    
    if (recentCrisisEvents.length > 0) score += 2;
    if (recentCrisisEvents.length > 2) score += 1;
    
    return Math.min(3, score); // Cap historical influence
  }

  countConsecutiveLowMoods(moods) {
    let count = 0;
    for (const mood of moods) {
      if (mood <= 2) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  getCrisisLevel(score) {
    if (score >= this.crisisThresholds.CRITICAL) return 'CRITICAL';
    if (score >= this.crisisThresholds.HIGH) return 'HIGH';
    if (score >= this.crisisThresholds.MODERATE) return 'MODERATE';
    return 'LOW';
  }

  getRecommendation(score) {
    const level = this.getCrisisLevel(score);
    const protocol = this.interventionProtocols[level];
    
    return {
      message: protocol.message,
      actions: protocol.actions,
      urgency: level.toLowerCase(),
      emergencyContacts: score >= this.crisisThresholds.HIGH ? this.emergencyContacts.india : null
    };
  }

  async triggerCrisisIntervention(userId, crisisAssessment, context = '') {
    try {
      const { score, level, factors, recommendation } = crisisAssessment;
      
      // Log crisis event
      const crisisEventId = await dataService.logCrisisEvent(userId, {
        severity: score,
        level,
        context,
        factors,
        interventionTriggered: true,
        timestamp: new Date()
      });

      // Execute intervention protocol
      const protocol = this.interventionProtocols[level];
      const interventionResults = [];

      if (protocol.notifyCounselors) {
        const counselorNotification = await this.notifyAvailableCounselors(userId, crisisAssessment);
        interventionResults.push(`Counselors notified: ${counselorNotification.count} contacted`);
      }

      if (protocol.sendEmergencyAlert) {
        const emergencyAlert = await this.sendEmergencyAlert(userId, crisisAssessment);
        interventionResults.push(`Emergency alert sent: ${emergencyAlert.status}`);
      }

      // Create user-facing intervention response
      const userIntervention = this.createUserInterventionResponse(level, recommendation);
      
      return {
        eventId: crisisEventId,
        level,
        userResponse: userIntervention,
        interventionResults,
        emergencyContacts: recommendation.emergencyContacts,
        followUpRequired: level === 'CRITICAL' || level === 'HIGH'
      };
      
    } catch (error) {
      console.error('Error triggering crisis intervention:', error);
      throw error;
    }
  }

  createUserInterventionResponse(level, recommendation) {
    const responses = {
      CRITICAL: {
        title: '🚨 Immediate Support Available',
        message: 'We\'re very concerned about you right now. You don\'t have to go through this alone.',
        actions: [
          {
            type: 'emergency_call',
            label: '📞 Call Crisis Helpline',
            priority: 'critical',
            description: 'Speak with a trained counselor immediately'
          },
          {
            type: 'emergency_counselor',
            label: '👨‍⚕️ Emergency Session',
            priority: 'critical',
            description: 'Book an urgent session with our crisis counselor'
          },
          {
            type: 'trusted_contact',
            label: '🤝 Contact Someone You Trust',
            priority: 'high',
            description: 'Reach out to a family member or friend'
          }
        ]
      },
      HIGH: {
        title: '💙 We\'re Here for You',
        message: 'It sounds like you\'re going through a really tough time. Let\'s get you some support.',
        actions: [
          {
            type: 'counselor_session',
            label: '👨‍⚕️ Talk to Counselor',
            priority: 'high',
            description: 'Schedule a session within 24 hours'
          },
          {
            type: 'crisis_resources',
            label: '📋 Crisis Resources',
            priority: 'high',
            description: 'Access immediate coping strategies'
          },
          {
            type: 'peer_support',
            label: '👥 Join Support Group',
            priority: 'medium',
            description: 'Connect with others who understand'
          }
        ]
      },
      MODERATE: {
        title: '🌱 Taking Care of Yourself',
        message: 'We want to make sure you\'re okay. Here are some ways to get support.',
        actions: [
          {
            type: 'ai_chat',
            label: '🤖 Continue Conversation',
            priority: 'medium',
            description: 'Talk more with our AI counselor'
          },
          {
            type: 'coping_strategies',
            label: '🧘 Coping Strategies',
            priority: 'medium',
            description: 'Learn techniques to feel better'
          },
          {
            type: 'schedule_checkin',
            label: '📅 Regular Check-ins',
            priority: 'low',
            description: 'Set up daily mood monitoring'
          }
        ]
      }
    };

    return responses[level] || responses.MODERATE;
  }

  async notifyAvailableCounselors(userId, crisisAssessment) {
    try {
      // In production, this would:
      // 1. Query available counselors from database
      // 2. Send real-time notifications via Firebase Cloud Messaging
      // 3. Send email alerts to on-duty counselors
      // 4. Update counselor dashboard with crisis alerts

      console.log('Crisis counselor notification:', {
        userId,
        severity: crisisAssessment.level,
        score: crisisAssessment.score,
        timestamp: new Date()
      });

      // Mock implementation for MVP
      const availableCounselors = [
        { id: 'c1', name: 'Dr. Priya Sharma', onDuty: true, specialization: 'crisis' },
        { id: 'c2', name: 'Dr. Rajesh Kumar', onDuty: true, specialization: 'anxiety' }
      ];

      const notifiedCounselors = availableCounselors.filter(c => c.onDuty);
      
      // Store notification in database for counselor dashboard
      await dataService.saveCrisisNotification(userId, {
        counselors: notifiedCounselors.map(c => c.id),
        level: crisisAssessment.level,
        score: crisisAssessment.score,
        factors: crisisAssessment.factors,
        timestamp: new Date()
      });

      return {
        count: notifiedCounselors.length,
        counselors: notifiedCounselors,
        status: 'sent'
      };
    } catch (error) {
      console.error('Error notifying counselors:', error);
      return { count: 0, counselors: [], status: 'failed' };
    }
  }

  async sendEmergencyAlert(userId, crisisAssessment) {
    try {
      // In production, this would:
      // 1. Send immediate SMS/email to emergency contacts
      // 2. Trigger push notifications to crisis response team
      // 3. Create priority ticket in counselor system
      // 4. Optionally notify local emergency services if configured

      console.log('Emergency alert triggered:', {
        userId,
        severity: crisisAssessment.level,
        score: crisisAssessment.score,
        timestamp: new Date()
      });

      // Send immediate crisis notification to user
      await notificationService.sendCrisisAlert(userId, {
        level: crisisAssessment.level,
        score: crisisAssessment.score,
        factors: crisisAssessment.factors
      });

      // Store emergency alert in database
      await dataService.saveEmergencyAlert(userId, {
        crisisScore: crisisAssessment.score,
        level: crisisAssessment.level,
        factors: crisisAssessment.factors,
        alertSent: true,
        timestamp: new Date()
      });

      return {
        status: 'sent',
        alertId: `emergency_${Date.now()}`,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      return { status: 'failed', error: error.message };
    }
  }

  async createCrisisActionPlan(userId, crisisAssessment) {
    try {
      const actionPlan = {
        userId,
        crisisLevel: crisisAssessment.level,
        createdAt: new Date(),
        immediateActions: [],
        followUpActions: [],
        resources: [],
        checkInSchedule: null
      };

      const protocol = this.interventionProtocols[crisisAssessment.level];

      // Define immediate actions based on crisis level
      if (crisisAssessment.level === 'CRITICAL') {
        actionPlan.immediateActions = [
          'Contact crisis helpline immediately',
          'Reach out to trusted person',
          'Stay in safe environment',
          'Remove access to harmful means'
        ];
        actionPlan.checkInSchedule = 'every_hour';
      } else if (crisisAssessment.level === 'HIGH') {
        actionPlan.immediateActions = [
          'Schedule counselor session within 24 hours',
          'Use grounding techniques',
          'Connect with support network',
          'Avoid isolation'
        ];
        actionPlan.checkInSchedule = 'every_4_hours';
      } else {
        actionPlan.immediateActions = [
          'Practice deep breathing',
          'Use coping strategies',
          'Consider peer support',
          'Schedule regular check-ins'
        ];
        actionPlan.checkInSchedule = 'daily';
      }

      // Add resources
      actionPlan.resources = [
        ...Object.values(this.emergencyContacts.india),
        {
          name: 'Coping Strategies Guide',
          type: 'internal',
          url: '/coping-strategies',
          description: 'Immediate techniques to manage distress'
        },
        {
          name: 'Crisis Chat Support',
          type: 'internal', 
          url: '/crisis-chat',
          description: 'Specialized AI support for crisis situations'
        }
      ];

      // Save action plan
      await dataService.saveCrisisActionPlan(userId, actionPlan);
      
      return actionPlan;
    } catch (error) {
      console.error('Error creating crisis action plan:', error);
      throw error;
    }
  }

  async scheduleFollowUp(userId, crisisEventId, followUpType = 'counselor') {
    try {
      const followUp = {
        userId,
        crisisEventId,
        type: followUpType,
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'scheduled',
        priority: 'high',
        createdAt: new Date()
      };

      await dataService.saveFollowUpSchedule(userId, followUp);
      
      return followUp;
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      throw error;
    }
  }

  getEmergencyContactsForRegion(region = 'india', language = 'en') {
    const contacts = this.emergencyContacts[region] || this.emergencyContacts.india;
    
    // Filter by language support
    return Object.values(contacts).filter(contact => 
      contact.languages.includes(language) || contact.languages.includes('en')
    );
  }

  async getUserCrisisHistory(userId, days = 30) {
    try {
      // Get recent crisis events for this user
      return await dataService.getUserCrisisEvents(userId, days);
    } catch (error) {
      console.error('Error fetching crisis history:', error);
      return [];
    }
  }

  // Real-time crisis monitoring for ongoing conversations
  async monitorOngoingConversation(userId, messages, currentMood) {
    try {
      if (messages.length < 2) return { riskLevel: 'none' };
      
      const recentMessages = messages.slice(-3);
      const combinedText = recentMessages
        .filter(m => !m.isAI)
        .map(m => m.text)
        .join(' ');
      
      if (!combinedText.trim()) return { riskLevel: 'none' };
      
      const assessment = await this.assessCrisisLevel(combinedText, currentMood);
      
      return {
        riskLevel: assessment.level.toLowerCase(),
        score: assessment.score,
        shouldIntervene: assessment.score >= this.crisisThresholds.MODERATE,
        recommendation: assessment.recommendation
      };
    } catch (error) {
      console.error('Error monitoring conversation:', error);
      return { riskLevel: 'unknown', error: true };
    }
  }
}

export default new CrisisService();
