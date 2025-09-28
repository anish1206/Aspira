# Aspira 🧠✨

> A comprehensive mental health companion platform designed to support your wellness journey with AI-powered conversations, mentorship, and mindful tools.

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.1.0-orange.svg)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)](https://tailwindcss.com/)

## 🌟 Features

### 🤖 AI Mental Health Companion
- **Powered by Google Gemini AI** with culturally-aware responses
- **Real-time chat interface** with conversation history
- **Empathetic conversations** designed for mental health support
- **Privacy-focused** with secure data handling

### 👥 Mentor Booking System
- **Browse qualified mentors** with specialized expertise
- **Book 1:1 sessions** with integrated scheduling
- **Video conferencing support** through Google Meet for remote sessions
- **Automated email confirmations** and calendar integration

### 📖 Digital Wellness Journal
- **Interactive drawing canvas** for creative expression
- **Mood tracking** with visual charts and insights
- **Gratitude prompts** and reflection exercises
- **Daily intentions** and task management
- **Private entries** with local storage

### 🎨 Creative Therapy Tools
- **Mindscape Generator** - AI-powered visual therapy
- **Drawing and text tools** for emotional expression
- **Customizable prompts** for guided reflection

### 👫 Support Groups
- **Community groups** for shared experiences
- **Topic-based discussions** (anxiety, stress, sleep, etc.)
- **Peer support network** with moderated spaces
- **Group chat functionality** with real-time messaging

### 🎯 Mood Check-ins
- **Quick daily assessments** with visual mood tracking
- **Progress insights** and trend analysis
- **Personalized recommendations** based on patterns
- **Historical data** for long-term wellness tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Firebase account
- Google Gemini API key
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anish1206/Aspira.git
   cd Aspira
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Configure hosting (optional)

5. **Start development server**
   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Navigation header
│   └── MainContent.js  # Landing page content
├── pages/              # Main application pages
│   ├── Landing.js      # Landing page with hero section
│   ├── Dashboard.js    # User dashboard
│   ├── Chat.js         # AI chat interface
│   ├── Diary.js        # Digital journal with drawing
│   ├── Groups.js       # Support groups
│   ├── MentorList.js   # Mentor directory
│   ├── MentorBooking.js # Session booking
│   ├── Settings.js     # User preferences
│   └── Checkins.js     # Mood tracking
├── api/                # Serverless functions
│   ├── askGemini.js    # AI chat backend
│   ├── generateMindscape.js # Visual therapy AI
│   └── bookSession.js  # Mentor booking logic
├── auth.js             # Authentication context
├── firebase.js         # Firebase configuration
└── App.js              # Main application component
```

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern UI library with hooks
- **React Router 6.30.1** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Custom CSS** - Glass morphism and animations

### Backend & Services
- **Firebase Auth** - User authentication
- **Firestore** - NoSQL database
- **Google Gemini AI** - Conversational AI
- **Vercel Functions** - Serverless API endpoints
- **Email**: Resend API
- **Calendar**: Google Calendar API
- **Video**: Google Meet integration

### Development Tools
- **React Scripts 5.0** - Build tooling
- **ESLint** - Code quality

## 🎨 Design System

### Color Palette
- **Primary**: Yellow/Orange gradients (#816bff to #37b6ff)
- **Background**: Radial gradients with glass morphism
- **Text**: High contrast dark/light themes
- **Accents**: Subtle borders and shadows

### Typography
- **Headings**: Light to bold weight contrast
- **Body**: Clean, readable sans-serif
- **Interactive**: Medium weight with hover states

### Components
- **Glass morphism cards** with backdrop blur
- **Gradient borders** and subtle animations
- **Floating navigation** with pill-shaped design
- **Responsive grid layouts**

## 📱 API Endpoints

### `/api/askGemini`
**POST** - AI Chat Conversation
```javascript
{
  "history": [{"role": "user", "parts": [{"text": "previous message"}]}],
  "message": "current user message"
}
```

### `/api/generateMindscape`
**POST** - Creative Therapy Visualization
```javascript
{
  "userInput": "I feel anxious about exams"
}
```

### `/api/bookSession`
**POST** - Mentor Session Booking
```javascript
{
  "mentorId": "mentor_id",
  "date": "2025-01-15",
  "time": "14:00",
  "userEmail": "user@example.com"
}
```

## 🔐 Security & Privacy

- **Environment variables** for sensitive API keys
- **Firebase security rules** for data protection
- **CORS configuration** for API endpoints
- **User authentication** required for all features
- **Local storage** for sensitive journal data

## 🚀 Deployment

### Vercel
```bash
vercel --prod
```

### Environment Setup
Ensure all environment variables are configured in your deployment platform.

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** and commit
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## 📋 Roadmap

- [ ] **Mobile app** (React Native)
- [ ] **Crisis intervention features**
- [ ] **Multi-language support**
- [ ] **Offline functionality**
- [ ] **Advanced analytics dashboard**
- [ ] **Integration with wearables**
- [ ] **Family/caregiver features**

## 🐛 Known Issues

- Canvas drawing may have performance issues on older devices
- Large journal entries may impact load times
- AI responses occasionally need retry


## 🙏 Acknowledgments

- **Google Gemini AI** for conversational intelligence
- **Firebase** for backend infrastructure
- **Tailwind CSS** for styling framework
- **React community** for excellent tooling
- **Mental health professionals** for guidance and validation

---

**Made with ❤️ for mental wellness**

- **Daily Intentions**: Set and track wellness-focused goals
- **Task Management**: Organize self-care and daily activities
- **Gratitude Journaling**: Practice mindfulness with guided prompts
- **Drawing Canvas**: Express emotions through digital art
- **Journal Entries**: Free-form writing for self-reflection

### 👥 Community Features
- Groups for peer support
- Check-ins and wellness monitoring
- User dashboard with progress tracking

## 🚀 Live Demo

- **Production**: [https://mindsync-web.vercel.app/](https://mindsync-web.vercel.app/)



## 📝 Available Scripts

### `npm start`
Runs the app in development mode.\
The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`
Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**


Made with ❤️ for mental wellness in India 🇮🇳
