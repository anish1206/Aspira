# Mindsync 🧠💙

> A comprehensive mental wellness platform for Indian youth, powered by AI and community support

## 🌟 Overview

Mindsync is a cloud-based platform designed specifically for youth mental wellness in India. It combines an empathetic AI chatbot, anonymous peer support groups, expert counselor micro-check-ins, and privacy-first features with cultural awareness and regional language support.

### Key Features

- 🤖 **AI Support**: Gemini-powered chatbot with cultural sensitivity for Indian youth
- 👥 **Peer Groups**: Anonymous real-time support groups with AI moderation
- 👨‍⚕️ **Expert Sessions**: Video calls with qualified counselors via Google Meet
- 🌡️ **Mood Tracking**: Daily check-ins with sentiment analysis and crisis detection
- 📝 **Private Diary**: Encrypted journaling with AI insights
- 🎯 **Gamification**: Progress tracking, achievements, and community challenges
- 🌐 **Multilingual**: Support for Hindi, Bengali, Tamil, and other Indian languages
- 🔒 **Privacy-First**: End-to-end encryption and user data control

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Firebase project with Authentication, Firestore, and Realtime Database enabled
- Google Cloud project with APIs enabled (see API Setup section)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MindSync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys (see API Setup section below)

4. **Start development server**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 🔑 API Setup

### Required Google APIs (All Free Tier)

1. **Firebase Setup**
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password + Google)
   - Enable Firestore Database
   - Enable Realtime Database
   - Enable Storage
   - Copy config to your .env file

2. **Google AI (Gemini) API**
   - Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Create API key for Gemini
   - Add to `REACT_APP_GEMINI_API_KEY`

3. **Google Cloud APIs**
   - Create project at [https://console.cloud.google.com](https://console.cloud.google.com)
   - Enable these APIs:
     - Cloud Natural Language API
     - Cloud Translation API  
     - Speech-to-Text API
     - Google Calendar API
   - Create API keys and add to .env file

### Free Tier Limits

| Service | Free Tier Limit | Monthly Usage |
|---------|----------------|---------------|
| Gemini API | 15 RPM, 1M tokens/min | ~1000 users |
| Firebase Auth | 50K MAU | Unlimited for MVP |
| Firestore | 50K reads, 20K writes/day | ~500 active users |
| Cloud Translation | 500K chars/month | ~10K translations |
| Speech-to-Text | 60 minutes/month | ~200 voice check-ins |
| Cloud Natural Language | 5K units/month | ~5K sentiment analyses |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Firebase      │    │  Google APIs    │
│                 │    │                 │    │                 │
│ • Components    │◄──►│ • Authentication│◄──►│ • Gemini AI     │
│ • Services      │    │ • Firestore DB  │    │ • Translation   │
│ • Pages         │    │ • Realtime DB   │    │ • Speech-to-Text│
│ • Auth          │    │ • Storage       │    │ • Natural Lang  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Service Layer

- **GeminiService**: AI chatbot with cultural awareness
- **DataService**: Encrypted data persistence with Firestore
- **TranslationService**: Multilingual support
- **CalendarService**: Expert session booking
- **SentimentService**: Crisis detection and mood analysis
- **GamificationService**: Progress tracking and achievements
- **SpeechService**: Voice input and mood detection

## 📱 Features Breakdown

### 1. User Onboarding
- Multi-step guided setup
- Language selection (10+ Indian languages)
- Privacy consent with detailed explanations
- Cultural and preference customization

### 2. AI Chatbot
- Powered by Google Gemini
- Culturally aware responses for Indian context
- Crisis detection and escalation
- Multilingual conversation support
- Conversation history with encryption

### 3. Peer Support Groups
- Anonymous real-time chat rooms
- AI-powered content moderation
- Topic-based group matching
- Safe space guidelines enforcement

### 4. Expert Check-ins
- Professional counselor scheduling
- Google Meet integration for sessions
- Language-matched counselor assignment
- Session reminders and follow-ups

### 5. Mood & Wellness Tracking
- Daily mood check-ins with 5-point scale
- Voice-based mood detection
- Sentiment analysis of text entries
- Crisis pattern recognition
- Progress visualization

### 6. Privacy & Security
- AES encryption for sensitive data
- User-controlled data permissions
- Data export/deletion capabilities
- Transparent AI decision explanations
- GDPR-compliant data handling

## 🛠️ Development Scripts

- `npm start` - Start development server
- `npm test` - Run test suite  
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Firebase Hosting

## 🚀 Deployment

### Firebase Hosting (Free)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and initialize**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Environment Variables for Production

Make sure to set these in your hosting environment:
- All `REACT_APP_*` variables from .env
- Enable Firebase security rules for production
- Configure CORS for Google APIs

## 🔒 Security & Privacy

### Data Encryption
- All user diary entries are encrypted with AES
- Chat messages encrypted before storage
- User preferences stored with consent tracking

### Crisis Detection
- Real-time analysis of text and voice input
- Automatic escalation for high-risk situations
- Integration with Indian crisis helplines

### Privacy Controls
- Granular consent management
- Data export in JSON format
- Complete data deletion option
- Transparent AI decision making

## 🌍 Cultural Considerations

### Indian Context Integration
- Family dynamics awareness in AI responses
- Festival and cultural event sensitivity
- Regional language support (Hindi, Tamil, Bengali, etc.)
- Integration with local crisis support systems

### Youth-Specific Features
- Age-appropriate content and responses
- Academic stress support (exams, career pressure)
- Social anxiety and peer pressure guidance
- Transition support (college, career, relationships)

## 🎯 Gamification Features

### Achievement System
- Progress-based unlocks (First Check-in, Week Warrior, etc.)
- Point accumulation with level progression
- Streak tracking for consistent usage
- Community challenges and leaderboards

### Engagement Mechanics
- Daily check-in reminders
- Weekly mental wellness challenges
- Peer support recognition system
- Progress visualization and milestones

## 📊 Analytics & Insights

- Anonymous usage analytics via Google Analytics
- Mood trend analysis for individual users
- Crisis intervention effectiveness tracking
- Feature usage optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Crisis Support

**If you're in immediate danger, please contact emergency services.**

### India Crisis Helplines
- **AASRA**: +91-9152987821 (24x7)
- **Sneha** (Bangalore): +91-80-25497777
- **Sumaitri** (Delhi): +91-11-23389090
- **iCall** (Mumbai): +91-9152987821

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google for providing free AI and cloud services
- Firebase for backend infrastructure
- Mental health organizations for guidance
- The open-source community for tools and libraries

---

**Built with ❤️ for youth mental wellness in India**
