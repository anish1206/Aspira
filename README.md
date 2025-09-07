# MindSync 🧠✨

MindSync is a comprehensive mental health companion web application designed specifically for Indian users. It combines AI-powered conversations, mentor booking, digital journaling, and wellness tracking to provide holistic mental health support.

## 🌟 Features

### 💬 AI Mental Health Companion
- Powered by Google's Gemini AI with natural Hinglish support
- Culturally relevant conversations with Indian context (Bollywood, cricket, family life, festivals)
- Empathetic, supportive, and non-judgmental responses
- Real-time chat interface with conversation history

### 🎯 Mentor Booking System
- Browse and book sessions with qualified mental health mentors
- Integrated Google Meet video conferencing
- Automatic calendar event creation
- Email confirmations with session details
- Real-time availability management

### 📖 Digital Diary & Wellness Tracking
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

- **Production**: [https://mindsync.vercel.app](https://mindsync.vercel.app)
- **Firebase Hosting**: [https://genai2505.web.app](https://genai2505.web.app)

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **AI**: Google Gemini 2.5 Pro API
- **APIs**: Vercel Serverless Functions
- **Email**: Resend API
- **Calendar**: Google Calendar API
- **Video**: Google Meet integration

## 📋 Prerequisites

- Node.js 16+ and npm
- Firebase account and project
- Google Cloud Console account (for Gemini API and Calendar API)
- Resend account (for email notifications)

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Server-side Environment Variables (for Vercel deployment)
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_json
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS=your_google_service_account_json
RESEND_API_KEY=your_resend_api_key
```

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/anish1206/MindSync.git
cd MindSync
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create `.env.local` file with the required environment variables (see above)

### 4. Start the development server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

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

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## 📱 Key Pages & Features

- **Landing Page**: Introduction and getting started
- **Dashboard**: Overview of wellness metrics and activities
- **Chat**: AI mental health companion
- **Mentors**: Browse and book mentor sessions
- **Diary**: Digital journaling with intentions, tasks, and gratitude
- **Groups**: Community support features
- **Settings**: User preferences and account management

## 🔧 API Endpoints

- `/api/askGemini` - AI chat conversations
- `/api/bookSession` - Mentor session booking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💡 Support

For support, email [your-email@domain.com] or create an issue in this repository.

---

Made with ❤️ for mental wellness in India 🇮🇳
