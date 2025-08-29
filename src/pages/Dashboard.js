// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth";
import { Link } from "react-router-dom";
import gamificationService from "../services/gamificationService";
import dataService from "../services/dataService";
import sentimentService from "../services/sentimentService";
import { MoodTrendChart, MoodDistributionChart, WeeklyProgressChart } from "../components/MoodChart";

const Card = ({ title, children, className = "", onClick = null }) => (
  <div 
    className={className}
    onClick={onClick}
    style={{ 
      border: "1px solid #e0e0e0", 
      borderRadius: 8, 
      padding: 16, 
      minWidth: 240,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s'
    }}
  >
    <h3 style={{ marginTop: 0 }}>{title}</h3>
    {children}
  </div>
);

const ProgressCard = ({ userProgress }) => {
  const { currentLevel, nextLevel, progressToNext, totalPoints, streak } = userProgress;
  
  return (
    <Card title="🏆 Your Progress">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 24 }}>{currentLevel.icon}</div>
        <div>
          <div style={{ fontWeight: 'bold' }}>{currentLevel.title}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{totalPoints} points</div>
        </div>
      </div>
      
      {nextLevel && (
        <div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Next: {nextLevel.title} ({nextLevel.minPoints} points)
          </div>
          <div style={{
            width: '100%',
            height: 8,
            background: '#f0f0f0',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressToNext}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )}
      
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
        <span>🔥 {streak} day streak</span>
        <span>🏅 {userProgress.unlockedAchievements.length} achievements</span>
      </div>
    </Card>
  );
};

const WeeklyGoalCard = ({ userProgress }) => {
  const progressPercent = (userProgress.weeklyProgress / userProgress.weeklyGoal) * 100;
  
  return (
    <Card title="📊 Weekly Goal">
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1976d2' }}>
          {userProgress.weeklyProgress}/{userProgress.weeklyGoal}
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>Check-ins this week</div>
      </div>
      
      <div style={{
        width: '100%',
        height: 12,
        background: '#f0f0f0',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8
      }}>
        <div style={{
          width: `${Math.min(100, progressPercent)}%`,
          height: '100%',
          background: progressPercent >= 100 ? '#4caf50' : '#1976d2',
          transition: 'width 0.3s'
        }} />
      </div>
      
      {progressPercent >= 100 ? (
        <div style={{ color: '#4caf50', fontSize: 12 }}>🎉 Goal completed!</div>
      ) : (
        <div style={{ color: '#666', fontSize: 12 }}>
          {userProgress.weeklyGoal - userProgress.weeklyProgress} more to reach your goal
        </div>
      )}
    </Card>
  );
};

const QuickStatsCard = ({ recentCheckins }) => {
  const avgMood = recentCheckins.length > 0 ? 
    recentCheckins.reduce((sum, c) => sum + c.mood, 0) / recentCheckins.length : 3;
  
  const patterns = sentimentService.assessMentalHealthPatterns(recentCheckins);
  
  const getMoodColor = (mood) => {
    if (mood >= 4) return '#4caf50';
    if (mood >= 3) return '#ff9800';
    return '#f44336';
  };
  
  return (
    <Card title="📈 Recent Insights">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: getMoodColor(avgMood) }}>
            {avgMood.toFixed(1)}/5
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Average mood</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, color: patterns.trend === 'improving' ? '#4caf50' : patterns.trend === 'declining' ? '#f44336' : '#666' }}>
            {patterns.trend === 'improving' ? '📈' : patterns.trend === 'declining' ? '📉' : '➖'}
          </div>
          <div style={{ fontSize: 12, color: '#666', textTransform: 'capitalize' }}>{patterns.trend}</div>
        </div>
      </div>
      
      {patterns.recommendation && (
        <div style={{
          padding: 8,
          background: patterns.recommendation.priority === 'high' ? '#ffebee' : 
                     patterns.recommendation.priority === 'positive' ? '#e8f5e8' : '#f5f5f5',
          borderRadius: 4,
          fontSize: 12
        }}>
          {patterns.recommendation.message}
        </div>
      )}
    </Card>
  );
};

const MoodInsights = ({ checkins, userProgress }) => {
  const calculateInsights = () => {
    if (checkins.length === 0) return [];
    
    const insights = [];
    const avgMood = checkins.reduce((sum, c) => sum + c.mood, 0) / checkins.length;
    
    // Mood trend insight
    if (checkins.length >= 5) {
      const recent = checkins.slice(0, 3).reduce((sum, c) => sum + c.mood, 0) / 3;
      const older = checkins.slice(-3).reduce((sum, c) => sum + c.mood, 0) / 3;
      const improvement = recent - older;
      
      if (improvement > 0.5) {
        insights.push({
          icon: '📈',
          text: 'Your mood has been improving recently!',
          type: 'positive'
        });
      } else if (improvement < -0.5) {
        insights.push({
          icon: '📉',
          text: 'Your mood seems to be declining. Consider reaching out for support.',
          type: 'concern'
        });
      }
    }
    
    // Consistency insight
    if (userProgress && userProgress.streak >= 5) {
      insights.push({
        icon: '🎯',
        text: `Great job maintaining a ${userProgress.streak}-day check-in streak!`,
        type: 'achievement'
      });
    }
    
    // Mood distribution insight
    const highMoodDays = checkins.filter(c => c.mood >= 4).length;
    const percentage = (highMoodDays / checkins.length) * 100;
    
    if (percentage >= 60) {
      insights.push({
        icon: '😄',
        text: `${Math.round(percentage)}% of your recent days have been good or great!`,
        type: 'positive'
      });
    } else if (percentage < 30) {
      insights.push({
        icon: '💙',
        text: 'You\'ve had some challenging days. Remember that seeking support is a sign of strength.',
        type: 'support'
      });
    }
    
    return insights;
  };
  
  const insights = calculateInsights();
  
  return (
    <div>
      {insights.length > 0 ? (
        insights.map((insight, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            marginBottom: 12,
            padding: 8,
            background: insight.type === 'positive' || insight.type === 'achievement' ? '#e8f5e8' : 
                       insight.type === 'concern' ? '#fff3e0' : '#f0f7ff',
            borderRadius: 6,
            fontSize: 13
          }}>
            <span style={{ fontSize: 16 }}>{insight.icon}</span>
            <span>{insight.text}</span>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
          <p style={{ margin: 0, fontSize: 13 }}>Keep checking in to see personalized insights about your mood patterns!</p>
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState([]);
  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load user progress and gamification data
      const progress = await gamificationService.getUserProgress(user.uid);
      setUserProgress(progress);

      // Load recent check-ins
      const checkins = await dataService.getUserCheckins(user.uid, 7);
      setRecentCheckins(checkins);

      // Load weekly challenges
      const challenges = gamificationService.getCurrentWeeklyChallenges();
      setWeeklyChallenges(challenges);

      // Generate motivational message
      const avgMood = checkins.length > 0 ? 
        checkins.reduce((sum, c) => sum + c.mood, 0) / checkins.length : 3;
      const message = gamificationService.getMotivationalMessage(progress.level, progress.streak, avgMood);
      setMotivationalMessage(message);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (!userProgress) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Dashboard</h2>
        <div>Loading your progress...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 24 }}>
        <h2>Welcome back! 👋</h2>
        {motivationalMessage && (
          <div style={{
            padding: 12,
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            color: 'white',
            borderRadius: 8,
            marginBottom: 16
          }}>
            {motivationalMessage}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        <ProgressCard userProgress={userProgress} />
        <WeeklyGoalCard userProgress={userProgress} />
        <QuickStatsCard recentCheckins={recentCheckins} />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <h3>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          <Link to="/checkins" style={{ textDecoration: 'none' }}>
            <Card title="🌡️ Mood Check-in" className="hover-card">
              <p style={{ margin: 0 }}>How are you feeling today?</p>
            </Card>
          </Link>
          <Link to="/chat" style={{ textDecoration: 'none' }}>
            <Card title="🤖 AI Support" className="hover-card">
              <p style={{ margin: 0 }}>Continue your conversation</p>
            </Card>
          </Link>
          <Link to="/groups" style={{ textDecoration: 'none' }}>
            <Card title="👥 Support Groups" className="hover-card">
              <p style={{ margin: 0 }}>Connect with peers</p>
            </Card>
          </Link>
          <Link to="/diary" style={{ textDecoration: 'none' }}>
            <Card title="📝 Personal Diary" className="hover-card">
              <p style={{ margin: 0 }}>Reflect on your thoughts</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Weekly Challenges */}
      {weeklyChallenges.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3>🎯 Weekly Challenges</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {weeklyChallenges.map(challenge => (
              <Card key={challenge.id} title={challenge.title}>
                <p style={{ margin: '8px 0', fontSize: 14 }}>{challenge.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
                  <span>{challenge.participantsCount} participants</span>
                  <span>{challenge.timeLeft} left</span>
                </div>
                <div style={{ marginTop: 8, padding: '4px 8px', background: '#e3f2fd', borderRadius: 4, fontSize: 12 }}>
                  Reward: {challenge.reward}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mood Analytics Section */}
      {recentCheckins.length >= 3 && (
        <div style={{ marginBottom: 24 }}>
          <h3>📊 Your Mood Analytics</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
            gap: 16,
            marginBottom: 16
          }}>
            <MoodTrendChart checkins={recentCheckins} />
            <WeeklyProgressChart checkins={recentCheckins} />
          </div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: 16
          }}>
            <MoodDistributionChart checkins={recentCheckins} />
            <div style={{
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              padding: 16
            }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>📈 Insights</h4>
              <MoodInsights checkins={recentCheckins} userProgress={userProgress} />
            </div>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {userProgress.unlockedAchievements.length > 0 && (
        <div>
          <h3>🏅 Recent Achievements</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {userProgress.unlockedAchievements.slice(0, 4).map(achievement => (
              <Card key={achievement.id} title={achievement.title}>
                <p style={{ margin: '8px 0', fontSize: 14 }}>{achievement.description}</p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: 8
                }}>
                  <span style={{ fontSize: 12, color: '#666' }}>{achievement.category}</span>
                  <span style={{ 
                    padding: '2px 8px', 
                    background: '#1976d2', 
                    color: 'white', 
                    borderRadius: 12, 
                    fontSize: 12 
                  }}>
                    +{achievement.points} pts
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


