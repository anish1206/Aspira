// src/pages/Diary.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth";
import dataService from "../services/dataService";
import geminiService from "../services/geminiService";
import gamificationService from "../services/gamificationService";

export default function Diary() {
  const { user } = useAuth();
  const [entry, setEntry] = useState("");
  const [currentMood, setCurrentMood] = useState(3);
  const [isPrivate, setIsPrivate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedEntries, setSavedEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    loadDiaryEntries();
  }, [user]);

  const loadDiaryEntries = async () => {
    if (!user) return;
    try {
      const entries = await dataService.getUserDiaryEntries(user.uid);
      setSavedEntries(entries);
    } catch (error) {
      console.error('Error loading diary entries:', error);
    }
  };

  const save = async () => {
    if (!entry.trim()) {
      alert('Please write something before saving.');
      return;
    }

    setIsSaving(true);
    try {
      // Save diary entry with encryption
      await dataService.saveDiaryEntry(user.uid, entry, currentMood);
      
      // Check for achievements
      const achievement = await gamificationService.checkAchievements(user.uid, {
        type: 'diary',
        wordCount: entry.split(' ').length
      });
      
      if (achievement.newAchievements.length > 0) {
        alert(`✅ Entry saved! You earned: ${achievement.newAchievements.map(a => a.title).join(', ')}`);
      } else {
        alert('✅ Diary entry saved successfully!');
      }
      
      setEntry("");
      setCurrentMood(3);
      loadDiaryEntries();
    } catch (error) {
      console.error('Error saving diary entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const analyzeEntry = async (entryText) => {
    try {
      const sentiment = await geminiService.analyzeSentiment(entryText);
      const crisisScore = await geminiService.assessCrisis(entryText);
      
      return {
        sentiment,
        crisisScore,
        wordCount: entryText.split(' ').length,
        readingTime: Math.ceil(entryText.split(' ').length / 200) // avg 200 WPM
      };
    } catch (error) {
      console.error('Error analyzing entry:', error);
      return null;
    }
  };

  const getMoodEmoji = (moodValue) => {
    const emojis = ['😢', '😕', '😐', '😊', '😄'];
    return emojis[moodValue - 1] || '😐';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📝 Personal Diary</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
        {/* Main Entry Area */}
        <div>
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            padding: 20,
            background: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>✍️ New Entry</h3>
              <div style={{ fontSize: 12, color: '#666' }}>
                {new Date().toLocaleDateString('en-IN')}
              </div>
            </div>
            
            {/* Mood Selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Current Mood: {getMoodEmoji(currentMood)} ({currentMood}/5)
              </label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={currentMood} 
                onChange={(e) => setCurrentMood(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Privacy Toggle */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input 
                  type="checkbox" 
                  checked={isPrivate} 
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                🔒 Keep this entry completely private (encrypted)
              </label>
            </div>
            
            <textarea 
              value={entry} 
              onChange={(e) => setEntry(e.target.value)} 
              placeholder="Dear diary... Write about your day, thoughts, feelings, or anything on your mind. This is your safe space. 🌱"
              rows={12} 
              style={{ 
                width: "100%", 
                padding: 16,
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                fontFamily: 'inherit',
                fontSize: 14,
                lineHeight: 1.5,
                resize: 'vertical'
              }} 
            />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: 12 
            }}>
              <div style={{ fontSize: 12, color: '#666' }}>
                {entry.trim().split(' ').length} words • ~{Math.ceil(entry.trim().split(' ').length / 200)} min read
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  disabled={!entry.trim()}
                  style={{
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: entry.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  🔍 {showAnalysis ? 'Hide' : 'Preview'} Analysis
                </button>
                <button 
                  onClick={save}
                  disabled={!entry.trim() || isSaving}
                  style={{ 
                    padding: '8px 16px', 
                    background: isSaving ? '#ccc' : "#1976d2", 
                    color: "white", 
                    border: "none",
                    borderRadius: 4,
                    cursor: entry.trim() && !isSaving ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isSaving ? 'Saving...' : '💾 Save Entry'}
                </button>
              </div>
            </div>

            {/* Live Analysis Preview */}
            {showAnalysis && entry.trim() && (
              <div style={{
                marginTop: 16,
                padding: 12,
                background: '#f8f9fa',
                borderRadius: 6,
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>🧠 Entry Insights</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  This analysis helps you understand your emotional patterns. All data is encrypted and private.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Recent Entries */}
        <div>
          <h3>📅 Recent Entries</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {savedEntries.length === 0 ? (
              <div style={{
                padding: 16,
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                background: '#f9f9f9',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🌱</div>
                <p style={{ margin: 0, fontSize: 14 }}>Start your journaling journey!</p>
              </div>
            ) : (
              savedEntries.map(entryItem => (
                <div 
                  key={entryItem.id}
                  onClick={() => setSelectedEntry(selectedEntry?.id === entryItem.id ? null : entryItem)}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: 8,
                    cursor: 'pointer',
                    background: selectedEntry?.id === entryItem.id ? '#f0f7ff' : 'white',
                    borderColor: selectedEntry?.id === entryItem.id ? '#1976d2' : '#e0e0e0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {formatDate(entryItem.timestamp)}
                    </div>
                    {entryItem.mood && (
                      <div style={{ fontSize: 16 }}>{getMoodEmoji(entryItem.mood)}</div>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: 14, 
                    lineHeight: 1.4,
                    color: '#333',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {entryItem.content.substring(0, 150)}{entryItem.content.length > 150 ? '...' : ''}
                  </div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                    {entryItem.wordCount} words
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Selected Entry Modal */}
      {selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: 24,
            maxWidth: '80%',
            maxHeight: '80%',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>📅 {formatDate(selectedEntry.timestamp)}</h3>
              <button 
                onClick={() => setSelectedEntry(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            {selectedEntry.mood && (
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 14, color: '#666' }}>Mood: </span>
                <span style={{ fontSize: 18 }}>{getMoodEmoji(selectedEntry.mood)}</span>
                <span style={{ fontSize: 14, marginLeft: 8 }}>({selectedEntry.mood}/5)</span>
              </div>
            )}
            
            <div style={{
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              marginBottom: 16
            }}>
              {selectedEntry.content}
            </div>
            
            <div style={{ 
              fontSize: 12, 
              color: '#888',
              borderTop: '1px solid #f0f0f0',
              paddingTop: 8
            }}>
              {selectedEntry.wordCount} words • 
              ~{Math.ceil(selectedEntry.wordCount / 200)} min read
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


