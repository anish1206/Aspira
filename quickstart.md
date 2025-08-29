# ⚡ Mindsync Quick Start Guide

Get Mindsync running in **10 minutes** with this step-by-step guide!

## 🎯 What You'll Build

A fully functional mental wellness platform with:
- 🤖 AI chatbot (Gemini-powered)
- 👥 Peer support groups  
- 📱 Mood tracking & diary
- 👨‍⚕️ Expert session booking
- 🎮 Gamification & progress tracking

## 🚀 5-Minute Setup

### 1. Clone & Install (2 minutes)
```bash
git clone <your-repo>
cd MindSync
npm install
```

### 2. Get API Keys (3 minutes)

**Firebase** (Required):
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project → Enable Auth, Firestore, Realtime DB
3. Copy config from Project Settings

**Gemini AI** (Required):
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Copy the key

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

**Minimum required in .env:**
```bash
REACT_APP_FIREBASE_API_KEY=your-firebase-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com  
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_GEMINI_API_KEY=your-gemini-key
```

### 4. Start Development Server
```bash
npm start
```

🎉 **That's it!** Open [http://localhost:3000](http://localhost:3000)

## 📋 Testing Checklist (5 minutes)

### Core Features to Test:
- [ ] **Login**: Create account with email/Google
- [ ] **Onboarding**: Complete 4-step setup  
- [ ] **AI Chat**: Send message, get AI response
- [ ] **Mood Check-in**: Log mood with notes
- [ ] **Peer Groups**: Join group, send message
- [ ] **Diary**: Write and save entry
- [ ] **Dashboard**: View progress and stats

### Crisis Detection Test:
- [ ] Send message with sad/concerning content
- [ ] Verify AI detects sentiment correctly
- [ ] Check if crisis intervention triggers

## 🔧 Optional APIs (Add Later)

For full functionality, also set up:

**Google Cloud APIs** (Optional but recommended):
```bash
REACT_APP_GOOGLE_TRANSLATE_API_KEY=your-translate-key
REACT_APP_GOOGLE_NLP_API_KEY=your-nlp-key  
REACT_APP_GOOGLE_SPEECH_API_KEY=your-speech-key
REACT_APP_GOOGLE_CALENDAR_API_KEY=your-calendar-key
```

**Setup Links:**
- [Google Cloud Console](https://console.cloud.google.com)
- [Enable Translation API](https://console.cloud.google.com/apis/api/translate.googleapis.com)
- [Enable Natural Language API](https://console.cloud.google.com/apis/api/language.googleapis.com)
- [Enable Speech-to-Text API](https://console.cloud.google.com/apis/api/speech.googleapis.com)

## 🚀 Deploy to Production (5 minutes)

### Quick Deploy to Firebase Hosting:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize  
firebase login
firebase init hosting

# Deploy
npm run deploy
```

Your app will be live at: `https://your-project.firebaseapp.com`

## 🐛 Common Issues & Fixes

### "Firebase not defined"
- Check if all Firebase imports are correct
- Verify API keys in .env file
- Make sure Firebase project is active

### "Gemini API Error"  
- Verify REACT_APP_GEMINI_API_KEY is set
- Check API key is valid in Google AI Studio
- Ensure no extra spaces in .env file

### "Chat not working"
- Test with simple message like "Hello"
- Check browser console for errors
- Verify internet connection

### "Database permission denied"
- Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- Check user is authenticated
- Verify userId matches in database rules

## 🎮 Demo Features

### Test AI Conversations:
```
"I'm feeling anxious about my exams"
"I had a good day today but worried about tomorrow"  
"I'm having trouble sleeping lately"
```

### Test Crisis Detection:
```
"I feel really hopeless today"
"Nothing seems to matter anymore"
```

### Test Language Support:
```
"मुझे बहुत परेशानी हो रही है" (Hindi)
"நான் கவலையாக இருக்கிறேன்" (Tamil)
```

## 📱 Mobile Testing

### Test on Mobile:
1. Open your deployed URL on phone
2. Test "Add to Home Screen" (PWA)
3. Try voice features (if supported)
4. Test all touch interactions

## 🔄 Next Steps

### For Hackathons:
- [ ] Test all features thoroughly
- [ ] Prepare demo scenarios  
- [ ] Create presentation slides
- [ ] Document cultural features
- [ ] Highlight privacy/security

### For Production:
- [ ] Set up real counselor accounts
- [ ] Configure actual crisis hotlines
- [ ] Add comprehensive testing
- [ ] Set up monitoring and alerts
- [ ] Plan user onboarding campaign

## 🆘 Need Help?

### Quick Fixes:
1. **Clear browser cache** and reload
2. **Check browser console** for error messages  
3. **Verify all API keys** are correctly set
4. **Test in incognito mode** to rule out extensions

### Documentation:
- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [React Router Docs](https://reactrouter.com)

---

🚀 **Ready to help youth with mental wellness! Your MVP is now functional.**
