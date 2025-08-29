// src/components/Onboarding.js
import React, { useState } from 'react';
import { useAuth } from '../auth';
import dataService from '../services/dataService';
import translationService from '../services/translationService';

const OnboardingStep = ({ title, children, step, totalSteps }) => (
  <div style={{ 
    maxWidth: 500, 
    margin: '0 auto',
    padding: 24,
    border: '1px solid #e0e0e0',
    borderRadius: 12,
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 20 
    }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <div style={{ 
        fontSize: 12, 
        color: '#666',
        background: '#f5f5f5',
        padding: '4px 8px',
        borderRadius: 4
      }}>
        Step {step} of {totalSteps}
      </div>
    </div>
    {children}
  </div>
);

const WelcomeStep = ({ onNext }) => (
  <OnboardingStep title="Welcome to Mindsync! 🌟" step={1} totalSteps={4}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🧠💙</div>
      <p style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 24 }}>
        Your mental wellness journey starts here. Mindsync provides AI support, 
        peer connections, and expert guidance - all in a safe, private environment.
      </p>
      
      <div style={{ 
        background: '#f0f7ff', 
        padding: 16, 
        borderRadius: 8, 
        marginBottom: 24,
        textAlign: 'left'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>What makes us special:</h4>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#333' }}>
          <li>🔒 Complete privacy - your data is encrypted</li>
          <li>🌍 Culturally aware AI support for Indian youth</li>
          <li>👥 Anonymous peer support groups</li>
          <li>👨‍⚕️ Access to professional counselors</li>
          <li>🎯 Gamified progress tracking</li>
        </ul>
      </div>
      
      <button 
        onClick={onNext}
        style={{
          padding: '12px 32px',
          background: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          cursor: 'pointer'
        }}
      >
        Let's Get Started! 🚀
      </button>
    </div>
  </OnboardingStep>
);

const LanguageStep = ({ onNext, onBack, selectedLanguage, setSelectedLanguage }) => {
  const languages = translationService.getSupportedLanguages();
  
  return (
    <OnboardingStep title="Choose Your Language 🌐" step={2} totalSteps={4}>
      <div>
        <p style={{ marginBottom: 20, color: '#666' }}>
          Select your preferred language. You can change this anytime in settings.
        </p>
        
        <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
          {Object.entries(languages).map(([code, name]) => (
            <label 
              key={code}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12,
                border: selectedLanguage === code ? '2px solid #1976d2' : '1px solid #e0e0e0',
                borderRadius: 6,
                cursor: 'pointer',
                background: selectedLanguage === code ? '#f0f7ff' : 'white'
              }}
            >
              <input
                type="radio"
                name="language"
                value={code}
                checked={selectedLanguage === code}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{ marginRight: 12 }}
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>{name}</div>
                {code === 'hi' && <div style={{ fontSize: 12, color: '#666' }}>हिंदी</div>}
                {code === 'ta' && <div style={{ fontSize: 12, color: '#666' }}>தமிழ்</div>}
                {code === 'bn' && <div style={{ fontSize: 12, color: '#666' }}>বাংলা</div>}
              </div>
            </label>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button 
            onClick={onBack}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              color: '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <button 
            onClick={onNext}
            disabled={!selectedLanguage}
            style={{
              padding: '8px 16px',
              background: selectedLanguage ? '#1976d2' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: selectedLanguage ? 'pointer' : 'not-allowed'
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </OnboardingStep>
  );
};

const PreferencesStep = ({ onNext, onBack, preferences, setPreferences }) => {
  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <OnboardingStep title="Your Preferences 🎯" step={3} totalSteps={4}>
      <div>
        <p style={{ marginBottom: 20, color: '#666' }}>
          Help us personalize your experience. These settings help our AI provide better support.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Age Group */}
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
              Age Group
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {['13-17', '18-22', '23-28', '28+'].map(age => (
                <label 
                  key={age}
                  style={{
                    padding: 8,
                    border: preferences.ageGroup === age ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    borderRadius: 4,
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: preferences.ageGroup === age ? '#f0f7ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="ageGroup"
                    value={age}
                    checked={preferences.ageGroup === age}
                    onChange={(e) => handlePreferenceChange('ageGroup', e.target.value)}
                    style={{ display: 'none' }}
                  />
                  {age}
                </label>
              ))}
            </div>
          </div>

          {/* Primary Concerns */}
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
              What brings you here? (Select all that apply)
            </label>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                'Anxiety & Stress',
                'Academic Pressure', 
                'Family Issues',
                'Relationship Problems',
                'Sleep Problems',
                'Career Confusion',
                'Social Anxiety',
                'General Support'
              ].map(concern => (
                <label 
                  key={concern}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 8,
                    border: '1px solid #e0e0e0',
                    borderRadius: 4,
                    cursor: 'pointer',
                    background: preferences.concerns?.includes(concern) ? '#f0f7ff' : 'white'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={preferences.concerns?.includes(concern) || false}
                    onChange={(e) => {
                      const concerns = preferences.concerns || [];
                      if (e.target.checked) {
                        handlePreferenceChange('concerns', [...concerns, concern]);
                      } else {
                        handlePreferenceChange('concerns', concerns.filter(c => c !== concern));
                      }
                    }}
                    style={{ marginRight: 8 }}
                  />
                  {concern}
                </label>
              ))}
            </div>
          </div>

          {/* Communication Style */}
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
              Preferred Support Style
            </label>
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
                    onChange={(e) => handlePreferenceChange('supportStyle', e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontWeight: 'bold' }}>{style.label}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{style.desc}</div>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button 
            onClick={onBack}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              color: '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <button 
            onClick={onNext}
            style={{
              padding: '8px 16px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </OnboardingStep>
  );
};

const PrivacyConsentStep = ({ onComplete, onBack, consent, setConsent }) => {
  return (
    <OnboardingStep title="Privacy & Data Protection 🔒" step={4} totalSteps={4}>
      <div>
        <div style={{ 
          background: '#e8f5e8', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 20,
          border: '1px solid #c8e6c9'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>Your Privacy is Our Priority</h4>
          <p style={{ margin: 0, fontSize: 14, color: '#2e7d32' }}>
            All your personal data is encrypted end-to-end. We never share your information 
            without explicit consent.
          </p>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <h4>Data Collection & Usage</h4>
          <div style={{ fontSize: 14, color: '#333', lineHeight: 1.5 }}>
            <p><strong>✅ What we collect:</strong></p>
            <ul style={{ marginLeft: 20 }}>
              <li>Mood check-ins and diary entries (encrypted)</li>
              <li>Chat messages with AI (encrypted)</li>
              <li>Anonymous usage analytics</li>
              <li>Language and cultural preferences</li>
            </ul>
            
            <p><strong>🎯 How we use it:</strong></p>
            <ul style={{ marginLeft: 20 }}>
              <li>Provide personalized AI support</li>
              <li>Detect crisis situations for intervention</li>
              <li>Match you with relevant peer groups</li>
              <li>Improve overall app experience</li>
            </ul>
            
            <p><strong>🚫 What we DON'T do:</strong></p>
            <ul style={{ marginLeft: 20 }}>
              <li>Share your personal data with third parties</li>
              <li>Use your data for advertising</li>
              <li>Store unencrypted sensitive information</li>
              <li>Access your data without permission</li>
            </ul>
          </div>
        </div>
        
        <div style={{ 
          background: '#fff3e0', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 20,
          border: '1px solid #ffcc02'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#ef6c00' }}>Crisis Intervention</h4>
          <p style={{ margin: 0, fontSize: 14, color: '#ef6c00' }}>
            If our AI detects signs of serious distress or crisis, we may alert qualified 
            counselors or emergency contacts to ensure your safety.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
            <input 
              type="checkbox"
              checked={consent.dataProcessing}
              onChange={(e) => setConsent(prev => ({ ...prev, dataProcessing: e.target.checked }))}
              style={{ marginTop: 2 }}
            />
            <span style={{ fontSize: 14 }}>
              I consent to data processing for personalized mental health support as described above.
            </span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
            <input 
              type="checkbox"
              checked={consent.crisisIntervention}
              onChange={(e) => setConsent(prev => ({ ...prev, crisisIntervention: e.target.checked }))}
              style={{ marginTop: 2 }}
            />
            <span style={{ fontSize: 14 }}>
              I understand and consent to crisis intervention procedures for my safety.
            </span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
            <input 
              type="checkbox"
              checked={consent.analytics}
              onChange={(e) => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
              style={{ marginTop: 2 }}
            />
            <span style={{ fontSize: 14 }}>
              I agree to anonymous usage analytics to help improve the platform. (Optional)
            </span>
          </label>
        </div>
        
        <div style={{ 
          fontSize: 12, 
          color: '#666', 
          marginTop: 16, 
          padding: 12,
          background: '#f9f9f9',
          borderRadius: 4 
        }}>
          📄 You can review our full privacy policy and change these settings anytime in the Settings page.
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button 
            onClick={onBack}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              color: '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <button 
            onClick={onComplete}
            disabled={!consent.dataProcessing || !consent.crisisIntervention}
            style={{
              padding: '12px 24px',
              background: (consent.dataProcessing && consent.crisisIntervention) ? '#1976d2' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: (consent.dataProcessing && consent.crisisIntervention) ? 'pointer' : 'not-allowed'
            }}
          >
            Complete Setup ✨
          </button>
        </div>
      </div>
    </OnboardingStep>
  );
};

export default function Onboarding({ onComplete }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [preferences, setPreferences] = useState({
    ageGroup: '',
    concerns: [],
    supportStyle: ''
  });
  const [consent, setConsent] = useState({
    dataProcessing: false,
    crisisIntervention: false,
    analytics: false
  });

  const handleComplete = async () => {
    try {
      const profileData = {
        language: selectedLanguage,
        preferences: {
          ...preferences,
          onboardingCompleted: true,
          onboardingDate: new Date()
        },
        consent,
        createdAt: new Date()
      };

      await dataService.createUserProfile(user.uid, profileData);
      
      // Store in localStorage for quick access
      localStorage.setItem('mindsync_language', selectedLanguage);
      localStorage.setItem('mindsync_onboarded', 'true');
      
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      {currentStep === 1 && <WelcomeStep onNext={nextStep} />}
      
      {currentStep === 2 && (
        <LanguageStep 
          onNext={nextStep}
          onBack={prevStep}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />
      )}
      
      {currentStep === 3 && (
        <PreferencesStep 
          onNext={nextStep}
          onBack={prevStep}
          preferences={preferences}
          setPreferences={setPreferences}
        />
      )}
      
      {currentStep === 4 && (
        <PrivacyConsentStep 
          onComplete={handleComplete}
          onBack={prevStep}
          consent={consent}
          setConsent={setConsent}
        />
      )}
    </div>
  );
}
