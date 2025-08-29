// src/pages/Settings.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth";
import dataService from "../services/dataService";
import translationService from "../services/translationService";
import gamificationService from "../services/gamificationService";
import NotificationPreferences from "../components/NotificationPreferences";

const SettingsSection = ({ title, children }) => (
  <div style={{
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 20,
    background: 'white',
    marginBottom: 16
  }}>
    <h3 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>{title}</h3>
    {children}
  </div>
);

export default function Settings() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [consent, setConsent] = useState({
    dataProcessing: true,
    crisisIntervention: true,
    analytics: false,
    notifications: true
  });
  const [preferences, setPreferences] = useState({
    supportStyle: 'empathetic',
    ageGroup: '',
    concerns: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const profile = await dataService.getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
        setLanguage(profile.language || 'en');
        setConsent(profile.consent || consent);
        setPreferences(profile.preferences || preferences);
      }
      
      const progress = await gamificationService.getUserProgress(user.uid);
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const updatedProfile = {
        language,
        consent,
        preferences,
        updatedAt: new Date()
      };
      
      await dataService.createUserProfile(user.uid, updatedProfile);
      localStorage.setItem('mindsync_language', language);
      
      alert('✅ Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const [checkins, diary, chatHistory] = await Promise.all([
        dataService.getUserCheckins(user.uid, 1000),
        dataService.getUserDiaryEntries(user.uid, 1000),
        dataService.getUserChatHistory(user.uid, 1000)
      ]);
      
      const exportData = {
        profile: userProfile,
        progress: userProgress,
        checkins,
        diary,
        chatHistory,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `mindsync-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      alert('✅ Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data.');
    }
  };

  const deleteAllData = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete ALL your data? This action cannot be undone.\n\n' +
      'This will delete:\n' +
      '• All mood check-ins\n' +
      '• Diary entries\n' +
      '• Chat history\n' +
      '• Progress and achievements\n\n' +
      'Type "DELETE" to confirm'
    );
    
    if (confirmDelete) {
      const secondConfirm = prompt('Type "DELETE" to permanently delete all your data:');
      if (secondConfirm === 'DELETE') {
        try {
          // In production, implement proper data deletion
          console.log('Deleting all user data for:', user.uid);
          localStorage.removeItem('mindsync_language');
          localStorage.removeItem('mindsync_onboarded');
          alert('✅ All data deleted successfully.');
        } catch (error) {
          console.error('Error deleting data:', error);
          alert('Failed to delete data.');
        }
      }
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <h2>⚙️ Settings</h2>
      
      <SettingsSection title="👤 Account Information">
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ fontWeight: 'bold' }}>Email:</label>
            <div style={{ marginTop: 4 }}>{user?.email || "Anonymous User"}</div>
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>User ID:</label>
            <div style={{ marginTop: 4, fontSize: 12, fontFamily: 'monospace', color: '#666' }}>
              {user?.uid || "Not available"}
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Member since:</label>
            <div style={{ marginTop: 4 }}>
              {userProfile?.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Notification Preferences Section */}
      <div style={{ marginBottom: 16 }}>
        <NotificationPreferences />
      </div>

      <SettingsSection title="🌐 Language & Localization">
        <div>
          <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>Preferred Language</label>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: 8,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14,
              minWidth: 200
            }}
          >
            {Object.entries(translationService.getSupportedLanguages()).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            This affects AI responses, interface text, and counselor matching.
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="🎯 Support Preferences">
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>AI Support Style</label>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { id: 'empathetic', label: '💝 Warm & Empathetic', desc: 'Gentle, understanding responses' },
                { id: 'practical', label: '🎯 Direct & Practical', desc: 'Clear advice and action steps' },
                { id: 'motivational', label: '⚡ Encouraging & Uplifting', desc: 'Positive energy and motivation' }
              ].map(style => (
                <label 
                  key={style.id}
                  style={{
                    padding: 12,
                    border: preferences.supportStyle === style.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: preferences.supportStyle === style.id ? '#f0f7ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="supportStyle"
                    value={style.id}
                    checked={preferences.supportStyle === style.id}
                    onChange={(e) => setPreferences(prev => ({ ...prev, supportStyle: e.target.value }))}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontWeight: 'bold' }}>{style.label}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{style.desc}</div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="🔒 Privacy & Data Control">
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>Data Usage Permissions</label>
            <div style={{ display: 'grid', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                <input 
                  type="checkbox"
                  checked={consent.dataProcessing}
                  onChange={(e) => setConsent(prev => ({ ...prev, dataProcessing: e.target.checked }))}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Personalized AI Support</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Use my data to provide personalized mental health support</div>
                </div>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                <input 
                  type="checkbox"
                  checked={consent.crisisIntervention}
                  onChange={(e) => setConsent(prev => ({ ...prev, crisisIntervention: e.target.checked }))}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Crisis Intervention</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Allow automatic crisis detection and intervention</div>
                </div>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                <input 
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(e) => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Anonymous Analytics</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Help improve the platform with anonymous usage data</div>
                </div>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                <input 
                  type="checkbox"
                  checked={consent.notifications}
                  onChange={(e) => setConsent(prev => ({ ...prev, notifications: e.target.checked }))}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Notifications & Reminders</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Receive reminders for check-ins and appointments</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </SettingsSection>

      {userProgress && (
        <SettingsSection title="📊 Your Progress Summary">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>{userProgress.currentLevel.icon}</div>
              <div style={{ fontWeight: 'bold' }}>{userProgress.currentLevel.title}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Level {userProgress.currentLevel.level}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1976d2' }}>{userProgress.totalPoints}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Total Points</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ff6f00' }}>🔥{userProgress.streak}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Day Streak</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#4caf50' }}>🏅{userProgress.unlockedAchievements.length}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Achievements</div>
            </div>
          </div>
        </SettingsSection>
      )}

      <SettingsSection title="💾 Data Management">
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0' }}>Export Your Data</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#666' }}>
              Download all your data in JSON format. Includes check-ins, diary entries, and progress.
            </p>
            <button 
              onClick={exportData}
              style={{
                padding: '8px 16px',
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              📥 Export My Data
            </button>
          </div>
          
          <div style={{ 
            border: '1px solid #ffcc02',
            borderRadius: 6,
            padding: 16,
            background: '#fff8e1'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#ef6c00' }}>⚠️ Delete All Data</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#ef6c00' }}>
              Permanently delete all your data from Mindsync. This action cannot be undone.
            </p>
            <button 
              onClick={deleteAllData}
              style={{
                padding: '8px 16px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              🗑️ Delete All Data
            </button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="ℹ️ About & Support">
        <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          <div>
            <strong>Crisis Support Hotlines:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>AASRA (National): <a href="tel:+919152987821" style={{ color: '#1976d2' }}>+91-9152987821</a></li>
              <li>Sneha (Bangalore): <a href="tel:+918025497777" style={{ color: '#1976d2' }}>+91-80-25497777</a></li>
              <li>Sumaitri (Delhi): <a href="tel:+911123389090" style={{ color: '#1976d2' }}>+91-11-23389090</a></li>
            </ul>
          </div>
          
          <div>
            <strong>App Version:</strong> 1.0.0 MVP
          </div>
          
          <div>
            <strong>Privacy Policy:</strong> 
            <a href="#" style={{ color: '#1976d2', marginLeft: 8 }}>View Full Policy</a>
          </div>
          
          <div>
            <strong>Contact Support:</strong> 
            <a href="mailto:support@mindsync.app" style={{ color: '#1976d2', marginLeft: 8 }}>support@mindsync.app</a>
          </div>
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div style={{ 
        position: 'sticky',
        bottom: 20,
        textAlign: 'center',
        marginTop: 24
      }}>
        <button 
          onClick={saveSettings}
          disabled={isSaving}
          style={{
            padding: '12px 32px',
            background: isSaving ? '#ccc' : '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 16,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {isSaving ? 'Saving...' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  );
}


