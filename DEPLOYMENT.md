# 🚀 Mindsync Deployment Guide

This guide will help you deploy your Mindsync MVP to production using Google's free tier services.

## 📋 Pre-Deployment Checklist

### 1. API Keys Setup
- [ ] Firebase project created and configured
- [ ] Gemini API key obtained from Google AI Studio
- [ ] Google Cloud project with necessary APIs enabled
- [ ] All environment variables set in `.env` file

### 2. Security Configuration
- [ ] Firebase security rules deployed
- [ ] Firestore indexes created
- [ ] CORS configured for Google APIs
- [ ] Encryption keys generated

### 3. Testing
- [ ] App runs locally without errors
- [ ] All major features tested
- [ ] Crisis detection working
- [ ] Data persistence verified

## 🔥 Firebase Hosting Deployment

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Initialize Firebase
```bash
# Login to Firebase
firebase login

# Initialize hosting in project directory
firebase init hosting

# Select your Firebase project
# Choose 'build' as public directory
# Configure as single-page app (Yes)
# Don't overwrite index.html
```

### Step 3: Deploy Security Rules
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Realtime Database rules  
firebase deploy --only database:rules

# Deploy Storage rules (if using)
firebase deploy --only storage:rules
```

### Step 4: Deploy Application
```bash
# Build and deploy
npm run deploy

# Or build first, then deploy
npm run build
firebase deploy --only hosting
```

Your app will be available at: `https://your-project-id.firebaseapp.com`

## ☁️ Google Cloud Configuration

### 1. Enable Required APIs
In Google Cloud Console, enable:

- [x] Cloud Natural Language API
- [x] Cloud Translation API  
- [x] Speech-to-Text API
- [x] Google Calendar API

### 2. Create API Keys
```bash
# Create browser-restricted API keys for:
# - Translation API (restrict to your domain)
# - Natural Language API (restrict to your domain)  
# - Speech-to-Text API (restrict to your domain)
```

### 3. Configure CORS
For production, configure CORS settings for your APIs to allow requests from your domain.

## 🔒 Security Hardening

### 1. Firebase Security Rules
Ensure your Firestore rules are restrictive:
```javascript
// Example rule - users can only access their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### 2. API Key Security
- Use environment variables for all API keys
- Restrict API keys to your domain in Google Cloud Console
- Enable quotas and monitoring for API usage
- Set up billing alerts

### 3. Content Security Policy
Add to your `public/index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://apis.google.com;
               connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com;
               img-src 'self' data: https:;">
```

## 📊 Monitoring & Analytics

### 1. Firebase Analytics
Enable Firebase Analytics in your Firebase console for user engagement tracking.

### 2. Error Monitoring
Add error boundary components for better error handling:

```javascript
// Add to your main components
componentDidCatch(error, errorInfo) {
  console.error('App error:', error, errorInfo);
  // Report to Firebase Analytics or error service
}
```

### 3. Performance Monitoring
Enable Firebase Performance Monitoring:
```bash
npm install firebase/performance
```

## 🔧 Production Environment Variables

Create production `.env` file with these variables:

```bash
# Firebase Production Config
REACT_APP_FIREBASE_API_KEY=your-production-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config

# Google APIs
REACT_APP_GEMINI_API_KEY=your-production-gemini-key
REACT_APP_GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id

# Security
REACT_APP_ENCRYPTION_KEY=your-strong-encryption-key
REACT_APP_ENABLE_ANALYTICS=true
```

## 📱 Progressive Web App (PWA)

### 1. Enable PWA Features
Mindsync is PWA-ready! Users can install it on mobile devices.

### 2. Update Manifest
Check `public/manifest.json` for correct app metadata:
```json
{
  "short_name": "Mindsync",
  "name": "Mindsync - Mental Wellness Platform",
  "theme_color": "#1976d2",
  "background_color": "#ffffff",
  "start_url": ".",
  "display": "standalone"
}
```

## 🚨 Crisis Support Setup

### 1. Configure Crisis Hotlines
Update crisis hotline numbers in your environment:
```bash
REACT_APP_CRISIS_HOTLINE=+91-9152987821
```

### 2. Expert Integration
Set up real counselor accounts and Google Meet integration for production use.

## 📈 Scaling Considerations

### Free Tier Limits (Monthly)
- **Firebase Auth**: 50K MAU (users)
- **Firestore**: 50K reads, 20K writes/day
- **Gemini API**: 15 RPM, 1M tokens/minute
- **Translation**: 500K characters
- **Speech-to-Text**: 60 minutes

### When to Upgrade
Monitor usage in Firebase Console. Upgrade to paid tiers when approaching limits.

### Cost Optimization
- Implement client-side caching
- Batch API requests where possible  
- Use Firebase offline persistence
- Optimize database queries with indexes

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## 🆘 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify all API keys are correctly set
   - Check API quotas in Google Cloud Console
   - Ensure APIs are enabled

2. **Firebase Deployment Issues**
   - Run `firebase login` to re-authenticate
   - Check Firebase project permissions
   - Verify build directory is correct

3. **Performance Issues**
   - Enable Firestore offline persistence
   - Implement lazy loading for components
   - Optimize image sizes

### Getting Help

- Check Firebase Console for error logs
- Monitor Google Cloud Console for API usage
- Review browser console for client-side errors
- Contact support: support@mindsync.app

## ✅ Post-Deployment

### 1. Verify All Features
- [ ] User registration/login works
- [ ] AI chat responds correctly  
- [ ] Mood check-ins save to database
- [ ] Peer groups load and function
- [ ] Expert session booking works
- [ ] Data export/deletion functions

### 2. Monitor Performance
- Set up Firebase Performance Monitoring
- Monitor API usage and costs
- Track user engagement metrics
- Watch for crisis intervention triggers

### 3. User Testing
- Test with real users across different devices
- Verify cultural sensitivity of AI responses
- Ensure crisis detection is working properly
- Gather feedback for improvements

---

🎉 **Congratulations! Your Mindsync MVP is now live and helping youth with mental wellness!**
