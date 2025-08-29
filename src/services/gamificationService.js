// src/services/gamificationService.js
import dataService from './dataService';

class GamificationService {
  constructor() {
    this.achievements = [
      {
        id: 'first_checkin',
        title: '🎯 First Step',
        description: 'Complete your first mood check-in',
        points: 10,
        category: 'checkins'
      },
      {
        id: 'weekly_checkins',
        title: '📅 Week Warrior',
        description: 'Complete check-ins for 7 days in a row',
        points: 50,
        category: 'checkins'
      },
      {
        id: 'ai_conversation',
        title: '🤖 Digital Friend',
        description: 'Have your first AI conversation',
        points: 15,
        category: 'chat'
      },
      {
        id: 'group_participant',
        title: '👥 Community Helper',
        description: 'Send your first message in a support group',
        points: 20,
        category: 'groups'
      },
      {
        id: 'diary_writer',
        title: '📝 Thought Keeper',
        description: 'Write your first diary entry',
        points: 15,
        category: 'diary'
      },
      {
        id: 'expert_session',
        title: '👨‍⚕️ Professional Support',
        description: 'Complete your first expert session',
        points: 30,
        category: 'expert'
      },
      {
        id: 'mood_improver',
        title: '📈 Mood Booster',
        description: 'Maintain mood 4+ for 5 consecutive days',
        points: 40,
        category: 'wellness'
      },
      {
        id: 'streak_master',
        title: '🔥 Consistency King',
        description: '30-day check-in streak',
        points: 100,
        category: 'streaks'
      }
    ];

    this.challenges = [
      {
        id: 'gratitude_week',
        title: '🙏 Gratitude Week',
        description: 'Share 3 things you\'re grateful for each day',
        duration: 7, // days
        points: 35,
        type: 'community'
      },
      {
        id: 'mindfulness_challenge',
        title: '🧘 Mindfulness March',
        description: 'Practice 5 minutes of mindfulness daily',
        duration: 30,
        points: 75,
        type: 'personal'
      },
      {
        id: 'support_buddy',
        title: '🤝 Support Buddy',
        description: 'Help 5 people in support groups',
        duration: 14,
        points: 60,
        type: 'community'
      }
    ];

    this.levels = [
      { level: 1, title: 'Beginner', minPoints: 0, maxPoints: 49, icon: '🌱' },
      { level: 2, title: 'Explorer', minPoints: 50, maxPoints: 149, icon: '🌿' },
      { level: 3, title: 'Supporter', minPoints: 150, maxPoints: 299, icon: '🌳' },
      { level: 4, title: 'Helper', minPoints: 300, maxPoints: 499, icon: '🏆' },
      { level: 5, title: 'Champion', minPoints: 500, maxPoints: 999, icon: '⭐' },
      { level: 6, title: 'Master', minPoints: 1000, maxPoints: Infinity, icon: '💎' }
    ];
  }

  async getUserProgress(userId) {
    try {
      // Fetch user progress from Firestore
      const progressData = await dataService.getUserProgress(userId);
      
      if (!progressData) {
        // Initialize new user progress
        const defaultProgress = this.getDefaultProgressData();
        await this.initializeUserProgress(userId, defaultProgress);
        return this.calculateUserStats(defaultProgress);
      }
      
      return this.calculateUserStats(progressData);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return this.getDefaultProgress();
    }
  }

  calculateUserStats(progress) {
    const currentLevel = this.levels.find(level => 
      progress.totalPoints >= level.minPoints && progress.totalPoints <= level.maxPoints
    );
    
    const nextLevel = this.levels.find(level => level.level === currentLevel.level + 1);
    const progressToNext = nextLevel ? 
      ((progress.totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100 : 100;

    return {
      ...progress,
      currentLevel,
      nextLevel,
      progressToNext: Math.round(progressToNext),
      unlockedAchievements: this.achievements.filter(ach => progress.achievements.includes(ach.id)),
      availableAchievements: this.achievements.filter(ach => !progress.achievements.includes(ach.id))
    };
  }

  getDefaultProgress() {
    return {
      totalPoints: 0,
      level: 1,
      streak: 0,
      achievements: [],
      activeChallenges: [],
      completedChallenges: [],
      weeklyGoal: 7,
      weeklyProgress: 0,
      currentLevel: this.levels[0],
      nextLevel: this.levels[1],
      progressToNext: 0,
      unlockedAchievements: [],
      availableAchievements: this.achievements
    };
  }

  getDefaultProgressData() {
    return {
      totalPoints: 0,
      level: 1,
      streak: 0,
      achievements: [],
      activeChallenges: [],
      completedChallenges: [],
      weeklyGoal: 7,
      weeklyProgress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async initializeUserProgress(userId, progressData) {
    try {
      await dataService.saveUserProgress(userId, progressData);
      return true;
    } catch (error) {
      console.error('Error initializing user progress:', error);
      return false;
    }
  }

  async checkAchievements(userId, activity) {
    try {
      const userProgress = await this.getUserProgress(userId);
      const newAchievements = [];

      // Check specific achievements based on activity
      switch (activity.type) {
        case 'checkin':
          if (!userProgress.achievements.includes('first_checkin')) {
            newAchievements.push('first_checkin');
          }
          if (activity.streak >= 7 && !userProgress.achievements.includes('weekly_checkins')) {
            newAchievements.push('weekly_checkins');
          }
          break;
        
        case 'chat':
          if (!userProgress.achievements.includes('ai_conversation')) {
            newAchievements.push('ai_conversation');
          }
          break;
        
        case 'group_message':
          if (!userProgress.achievements.includes('group_participant')) {
            newAchievements.push('group_participant');
          }
          break;
        
        case 'diary':
          if (!userProgress.achievements.includes('diary_writer')) {
            newAchievements.push('diary_writer');
          }
          break;
        
        case 'expert_session':
          if (!userProgress.achievements.includes('expert_session')) {
            newAchievements.push('expert_session');
          }
          break;
      }

      // Award points for new achievements
      let pointsEarned = 0;
      newAchievements.forEach(achId => {
        const achievement = this.achievements.find(a => a.id === achId);
        if (achievement) {
          pointsEarned += achievement.points;
        }
      });

      if (newAchievements.length > 0) {
        await this.updateUserProgress(userId, {
          achievements: [...userProgress.achievements, ...newAchievements],
          totalPoints: userProgress.totalPoints + pointsEarned
        });
      }

      return {
        newAchievements: newAchievements.map(achId => 
          this.achievements.find(a => a.id === achId)
        ),
        pointsEarned
      };
    } catch (error) {
      console.error('Error checking achievements:', error);
      return { newAchievements: [], pointsEarned: 0 };
    }
  }

  async updateStreak(userId, activityType = 'checkin') {
    try {
      // Calculate current streak based on check-ins
      const recentCheckins = await dataService.getUserCheckins(userId, 30);
      const streak = this.calculateStreak(recentCheckins);
      
      await this.updateUserProgress(userId, { streak });
      return streak;
    } catch (error) {
      console.error('Error updating streak:', error);
      return 0;
    }
  }

  calculateStreak(checkins) {
    if (checkins.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < checkins.length; i++) {
      const checkinDate = checkins[i].timestamp?.toDate() || new Date(checkins[i].timestamp);
      checkinDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate - checkinDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  async joinChallenge(userId, challengeId) {
    try {
      const challenge = this.challenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');

      const userProgress = await this.getUserProgress(userId);
      
      if (!userProgress.activeChallenges.includes(challengeId)) {
        await this.updateUserProgress(userId, {
          activeChallenges: [...userProgress.activeChallenges, challengeId]
        });
      }

      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      return false;
    }
  }

  async updateChallengeProgress(userId, challengeId, progress) {
    try {
      // Update challenge-specific progress
      const challengeProgress = {
        challengeId,
        progress,
        lastUpdated: new Date()
      };

      // Store in Firestore under user's challenge progress
      await dataService.saveChallengeProgress(userId, challengeId, challengeProgress);
      
      // Check if challenge is completed and award points
      const challenge = this.challenges.find(c => c.id === challengeId);
      if (challenge && progress >= 100) {
        await this.completeChallengeForUser(userId, challengeId, challenge.points);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      return false;
    }
  }
  
  async completeChallengeForUser(userId, challengeId, points) {
    try {
      const userProgress = await this.getUserProgress(userId);
      
      // Move from active to completed challenges
      const updatedActiveChallenges = userProgress.activeChallenges.filter(c => c !== challengeId);
      const updatedCompletedChallenges = [...userProgress.completedChallenges, challengeId];
      
      await this.updateUserProgress(userId, {
        activeChallenges: updatedActiveChallenges,
        completedChallenges: updatedCompletedChallenges,
        totalPoints: userProgress.totalPoints + points
      });
      
      return true;
    } catch (error) {
      console.error('Error completing challenge for user:', error);
      return false;
    }
  }

  async getLeaderboard(timeframe = 'weekly') {
    try {
      // Mock leaderboard data - in real implementation, query Firestore
      const mockLeaderboard = [
        { rank: 1, username: 'Anonymous User 1', points: 156, level: 3 },
        { rank: 2, username: 'Anonymous User 2', points: 142, level: 2 },
        { rank: 3, username: 'Anonymous User 3', points: 128, level: 2 },
        { rank: 4, username: 'You', points: 85, level: 2 },
        { rank: 5, username: 'Anonymous User 5', points: 67, level: 1 }
      ];

      return mockLeaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async updateUserProgress(userId, updates) {
    try {
      // In real implementation, update Firestore
      await dataService.updateUserProgress(userId, updates);
      return true;
    } catch (error) {
      console.error('Error updating user progress:', error);
      return false;
    }
  }

  getMotivationalMessage(level, streak, recentMood) {
    const messages = {
      streak: [
        `🔥 Amazing ${streak}-day streak! You're building great habits!`,
        `⚡ Keep the momentum going! ${streak} days strong!`,
        `🌟 ${streak} days in a row - you're unstoppable!`
      ],
      level: [
        `🎉 Welcome to level ${level}! You're making real progress!`,
        `🏆 Level ${level} achieved! Your mental wellness journey is inspiring!`,
        `⭐ Congratulations on reaching level ${level}!`
      ],
      mood: [
        `💪 Your resilience is showing! Keep taking care of yourself.`,
        `🌈 Every small step counts. You're doing great!`,
        `🌸 Progress isn't always linear, but you're moving forward.`
      ]
    };

    if (streak >= 7) return messages.streak[Math.floor(Math.random() * messages.streak.length)];
    if (level > 1) return messages.level[Math.floor(Math.random() * messages.level.length)];
    return messages.mood[Math.floor(Math.random() * messages.mood.length)];
  }

  getChallenges() {
    return this.challenges;
  }

  getAchievements() {
    return this.achievements;
  }

  getLevels() {
    return this.levels;
  }

  // Weekly community challenges
  getCurrentWeeklyChallenges() {
    return [
      {
        id: 'gratitude_this_week',
        title: '🙏 Gratitude Practice',
        description: 'Share something you\'re grateful for in your check-in',
        participantsCount: 156,
        timeLeft: '3 days',
        reward: '25 points + special badge'
      },
      {
        id: 'support_someone',
        title: '🤝 Be Someone\'s Light',
        description: 'Send an encouraging message in any support group',
        participantsCount: 89,
        timeLeft: '5 days',
        reward: '30 points + Helper Badge'
      }
    ];
  }
}

export default new GamificationService();
