// src/pages/Checkins.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth";
import dataService from "../services/dataService";
import calendarService from "../services/calendarService";
import geminiService from "../services/geminiService";
import VoiceRecorder from "../components/VoiceRecorder";
import gamificationService from "../services/gamificationService";
import crisisService from "../services/crisisService";

const MoodCheckIn = ({ user }) => {
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceMoodDetected, setVoiceMoodDetected] = useState(null);

  useEffect(() => {
    loadRecentCheckins();
  }, []);

  const loadRecentCheckins = async () => {
    try {
      const checkins = await dataService.getUserCheckins(user.uid, 7);
      setRecentCheckins(checkins);
    } catch (error) {
      console.error('Error loading recent checkins:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine text note and voice transcript
      const combinedNote = [note, voiceTranscript].filter(Boolean).join(' ');
      
      // Analyze sentiment of combined note
      let sentiment = 'neutral';
      if (combinedNote) {
        sentiment = await geminiService.analyzeSentiment(combinedNote);
      }

      // Use voice-detected mood if available, otherwise manual mood
      const finalMood = voiceMoodDetected?.suggestedMoodScore || mood;

      const moodData = {
        mood: finalMood,
        note: combinedNote,
        sentiment,
        voiceDetected: !!voiceMoodDetected,
        voiceConfidence: voiceMoodDetected?.confidence || 0
      };

      await dataService.saveMoodCheckin(user.uid, moodData);
      
      // Check for achievements
      const achievement = await gamificationService.checkAchievements(user.uid, {
        type: 'checkin',
        mood: finalMood,
        hasVoice: !!voiceMoodDetected
      });
      
      // Comprehensive crisis assessment
      const userHistory = await dataService.getUserCheckins(user.uid, 10);
      const crisisAssessment = await crisisService.assessCrisisLevel(
        combinedNote || 'Mood check-in completed',
        finalMood,
        voiceMoodDetected,
        userHistory
      );
      
      // Trigger crisis intervention if needed
      if (crisisAssessment.score >= 5) {
        const intervention = await crisisService.triggerCrisisIntervention(
          user.uid,
          crisisAssessment,
          combinedNote
        );
        
        if (intervention.level === 'CRITICAL' || intervention.level === 'HIGH') {
          await showCrisisInterventionModal(intervention);
        } else if (intervention.level === 'MODERATE') {
          await showSupportSuggestions(intervention.userResponse);
        }
      }

      const successMessage = achievement.newAchievements.length > 0 
        ? `✅ Check-in saved! You earned: ${achievement.newAchievements.map(a => a.title).join(', ')}`
        : '✅ Check-in saved successfully!';
      
      alert(successMessage);
      
      // Reset form
      setNote("");
      setMood(3);
      setVoiceTranscript('');
      setVoiceMoodDetected(null);
      setShowVoiceRecorder(false);
      loadRecentCheckins();
    } catch (error) {
      console.error('Error saving check-in:', error);
      alert('Failed to save check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showCrisisInterventionModal = async (intervention) => {
    const { userResponse, emergencyContacts, level } = intervention;
    
    const modalContent = `
🚨 ${userResponse.title}

${userResponse.message}

Immediate Actions Available:
${userResponse.actions.map(action => `• ${action.label}: ${action.description}`).join('\n')}

${emergencyContacts ? 'Crisis Helplines:\n' + 
  Object.values(emergencyContacts).map(contact => 
    `• ${contact.name}: ${contact.phone} (${contact.available})`
  ).join('\n') : ''}

Would you like to take action now?`;
    
    const userWantsHelp = window.confirm(modalContent);
    
    if (userWantsHelp) {
      // Redirect based on crisis level
      if (level === 'CRITICAL') {
        // Show emergency contacts prominently
        showEmergencyContacts(emergencyContacts);
      } else {
        // Redirect to expert sessions
        window.location.href = '/checkins?tab=expert&emergency=true';
      }
    }
  };

  const showSupportSuggestions = async (userResponse) => {
    const suggestionMessage = `
💙 ${userResponse.title}

${userResponse.message}

Recommended Actions:
${userResponse.actions.map(action => `• ${action.label}: ${action.description}`).join('\n')}

Would you like to explore these options?`;
    
    const userWantsSupport = window.confirm(suggestionMessage);
    
    if (userWantsSupport) {
      // Show available support options
      window.location.href = '/chat?support=true';
    }
  };

  const showEmergencyContacts = (contacts) => {
    const contactsHtml = Object.values(contacts).map(contact => 
      `<div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
        <strong>${contact.name}</strong><br>
        📞 <a href="tel:${contact.phone}" style="color: #1976d2; font-size: 18px;">${contact.phone}</a><br>
        ⏰ Available: ${contact.available}<br>
        🗣️ Languages: ${contact.languages.join(', ')}
      </div>`
    ).join('');
    
    const emergencyModal = window.open('', '_blank', 'width=500,height=600');
    emergencyModal.document.write(`
      <html>
        <head><title>Emergency Support - MindSync</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #d32f2f;">🚨 Emergency Mental Health Support</h2>
          <p><strong>You are not alone. Help is available 24/7.</strong></p>
          ${contactsHtml}
          <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 5px;">
            <strong>💙 Remember:</strong>
            <ul>
              <li>These feelings are temporary</li>
              <li>You matter and your life has value</li>
              <li>Professional help is available</li>
              <li>Things can and will get better</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  };

  const handleVoiceTranscription = (transcript, confidence) => {
    setVoiceTranscript(transcript);
  };

  const handleVoiceMoodDetection = (moodAnalysis) => {
    setVoiceMoodDetected(moodAnalysis);
    if (moodAnalysis.suggestedMoodScore) {
      setMood(moodAnalysis.suggestedMoodScore);
    }
  };

  const getMoodEmoji = (moodValue) => {
    const emojis = ['😢', '😕', '😐', '😊', '😄'];
    return emojis[moodValue - 1] || '😐';
  };

  const getMoodColor = (moodValue) => {
    const colors = ['#f44336', '#ff9800', '#ffc107', '#4caf50', '#2e7d32'];
    return colors[moodValue - 1] || '#ffc107';
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h3>Daily Mood Check-in</h3>
      
      <form onSubmit={handleSubmit} style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 20,
        padding: 20,
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        background: 'white'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            How are you feeling right now? {getMoodEmoji(mood)}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>😢</span>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={mood} 
              onChange={(e) => setMood(Number(e.target.value))} 
              style={{ 
                flex: 1,
                accentColor: getMoodColor(mood)
              }}
            />
            <span>😄</span>
            <div style={{ 
              minWidth: 60,
              textAlign: 'center',
              padding: '4px 8px',
              background: getMoodColor(mood),
              color: 'white',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 'bold'
            }}>
              {mood}/5
            </div>
          </div>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontWeight: 'bold' }}>
              What's on your mind? (Optional)
            </label>
            <button 
              type="button"
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              style={{
                padding: '4px 8px',
                background: showVoiceRecorder ? '#1976d2' : '#f5f5f5',
                color: showVoiceRecorder ? 'white' : '#333',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              🎤 {showVoiceRecorder ? 'Hide' : 'Voice Check-in'}
            </button>
          </div>
          
          {showVoiceRecorder && (
            <div style={{ marginBottom: 12 }}>
              <VoiceRecorder
                onTranscription={handleVoiceTranscription}
                onMoodDetection={handleVoiceMoodDetection}
                language="en"
              />
            </div>
          )}
          
          {voiceMoodDetected && (
            <div style={{
              padding: 12,
              background: '#e8f5e8',
              border: '1px solid #c8e6c9',
              borderRadius: 6,
              marginBottom: 12
            }}>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#2e7d32', marginBottom: 4 }}>
                🎤 Voice Analysis Complete
              </div>
              <div style={{ fontSize: 12, color: '#2e7d32' }}>
                Detected Mood: <strong>{voiceMoodDetected.detectedMood}</strong> 
                (Confidence: {Math.round(voiceMoodDetected.confidence * 100)}%)
                <br />
                Suggested Mood Score: <strong>{voiceMoodDetected.suggestedMoodScore}/5</strong>
              </div>
            </div>
          )}
          
          <textarea 
            placeholder="Share what you're feeling or what happened today..."
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
            rows={4}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          
          {voiceTranscript && (
            <div style={{
              marginTop: 8,
              padding: 8,
              background: '#f0f7ff',
              border: '1px solid #1976d2',
              borderRadius: 4,
              fontSize: 12
            }}>
              <strong>Voice Transcript:</strong> {voiceTranscript}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            padding: 12, 
            background: isSubmitting ? '#ccc' : "#1976d2", 
            color: "white", 
            border: "none", 
            borderRadius: 6,
            fontSize: 16,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Saving...' : '💾 Save Check-in'}
        </button>
      </form>

      {/* Recent Check-ins */}
      {recentCheckins.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>Your Recent Check-ins</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentCheckins.map(checkin => (
              <div 
                key={checkin.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  border: '1px solid #f0f0f0',
                  borderRadius: 6,
                  background: '#fafafa'
                }}
              >
                <div style={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: getMoodColor(checkin.mood),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {checkin.mood}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    {checkin.timestamp?.toDate?.()?.toLocaleDateString() || 'Recent'}
                  </div>
                  {checkin.note && (
                    <div style={{ fontSize: 14, marginTop: 4 }}>
                      {checkin.note.length > 100 ? `${checkin.note.substring(0, 100)}...` : checkin.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ExpertSessions = ({ user }) => {
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [userLanguage, setUserLanguage] = useState('en');

  useEffect(() => {
    loadCounselors();
    loadUserBookings();
  }, [userLanguage]);

  const loadCounselors = () => {
    const availableCounselors = calendarService.getAvailableCounselors(userLanguage);
    setCounselors(availableCounselors);
  };

  const loadUserBookings = () => {
    // In real implementation, fetch from Firestore
    setUserBookings([
      {
        id: '1',
        counselorName: 'Dr. Priya Sharma',
        datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'confirmed',
        meetLink: 'https://meet.google.com/abc-defg-hij'
      }
    ]);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    
    if (selectedCounselor && date) {
      const slots = await calendarService.getAvailableSlots(selectedCounselor.id, date);
      setAvailableSlots(slots);
    }
  };

  const bookSession = async () => {
    if (!selectedCounselor || !selectedDate || !selectedSlot) {
      alert('Please select counselor, date, and time slot.');
      return;
    }

    try {
      const datetime = new Date(`${selectedDate}T${selectedSlot.time}:00`);
      const booking = await calendarService.bookSession(
        user.uid, 
        selectedCounselor.id, 
        datetime, 
        sessionNotes
      );
      
      alert(`✅ Session booked successfully!\nMeet Link: ${booking.meetLink}`);
      
      // Reset form
      setSelectedCounselor(null);
      setSelectedDate('');
      setSelectedSlot(null);
      setSessionNotes('');
      loadUserBookings();
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Failed to book session. Please try again.');
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14); // 2 weeks ahead
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h3>Book Expert Session</h3>
      
      {/* Language Selection */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
          Preferred Language:
        </label>
        <select 
          value={userLanguage} 
          onChange={(e) => setUserLanguage(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="bn">Bengali</option>
          <option value="ta">Tamil</option>
        </select>
      </div>

      {/* Counselor Selection */}
      <div style={{ marginBottom: 20 }}>
        <h4>Select a Counselor</h4>
        <div style={{ display: 'grid', gap: 12 }}>
          {counselors.map(counselor => (
            <div 
              key={counselor.id}
              onClick={() => setSelectedCounselor(counselor)}
              style={{
                border: selectedCounselor?.id === counselor.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                borderRadius: 8,
                padding: 16,
                cursor: 'pointer',
                background: selectedCounselor?.id === counselor.id ? '#f0f7ff' : 'white'
              }}
            >
              <h4 style={{ margin: '0 0 8px 0' }}>{counselor.name}</h4>
              <p style={{ margin: '0 0 8px 0', color: '#666' }}>Specialty: {counselor.specialty}</p>
              <small style={{ color: '#888' }}>Languages: {counselor.languages.join(', ')}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      {selectedCounselor && (
        <div style={{ marginBottom: 20 }}>
          <h4>Select Date</h4>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            style={{
              padding: 8,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14
            }}
          />
        </div>
      )}

      {/* Time Slot Selection */}
      {availableSlots.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4>Available Time Slots</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
            {availableSlots.map(slot => (
              <button
                key={slot.time}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  padding: 8,
                  border: selectedSlot?.time === slot.time ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 4,
                  background: selectedSlot?.time === slot.time ? '#f0f7ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Session Notes */}
      {selectedSlot && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
            What would you like to discuss? (Optional)
          </label>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Brief description of what you'd like to talk about..."
            rows={3}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {/* Book Button */}
      {selectedSlot && (
        <button
          onClick={bookSession}
          style={{
            padding: '12px 24px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          📅 Book Session with {selectedCounselor.name}
        </button>
      )}

      {/* Upcoming Sessions */}
      {userBookings.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>Your Upcoming Sessions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {userBookings.map(booking => (
              <div 
                key={booking.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: 16,
                  background: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>{booking.counselorName}</h4>
                    <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                      📅 {booking.datetime.toLocaleDateString()} at {booking.datetime.toLocaleTimeString()}
                    </p>
                    <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Status: {booking.status}</p>
                  </div>
                  <a 
                    href={booking.meetLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 16px',
                      background: '#0f9d58',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: 4,
                      fontSize: 14
                    }}
                  >
                    📹 Join Session
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Checkins() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("mood");

  return (
    <div style={{ padding: 20 }}>
      <h2>Check-ins & Expert Support</h2>
      
      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button 
          onClick={() => setActiveTab("mood")} 
          style={{ 
            padding: '8px 16px', 
            background: activeTab === "mood" ? "#1976d2" : "#eee", 
            color: activeTab === "mood" ? "#fff" : "#333", 
            border: "none",
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          🌡️ Mood Check-in
        </button>
        <button 
          onClick={() => setActiveTab("expert")} 
          style={{ 
            padding: '8px 16px', 
            background: activeTab === "expert" ? "#1976d2" : "#eee", 
            color: activeTab === "expert" ? "#fff" : "#333", 
            border: "none",
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          👨‍⚕️ Expert Sessions
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ 
        border: "1px solid #e0e0e0", 
        borderRadius: 8, 
        padding: 20,
        background: 'white'
      }}>
        {activeTab === "mood" ? (
          <MoodCheckIn user={user} />
        ) : (
          <ExpertSessions user={user} />
        )}
      </div>
    </div>
  );
}


