#!/usr/bin/env node

// setup.js - Quick setup script for Mindsync
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function setupMindsync() {
  console.log('🧠💙 Welcome to Mindsync Setup!\n');
  
  console.log('This script will help you configure all necessary API keys for your Mindsync MVP.\n');
  
  try {
    // Check if .env already exists
    if (fs.existsSync('.env')) {
      const overwrite = await ask('.env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled. You can manually edit your .env file.');
        process.exit(0);
      }
    }

    console.log('\n📋 Please provide your API keys. You can skip any by pressing Enter:\n');

    const config = {};

    // Firebase Configuration
    console.log('🔥 Firebase Configuration:');
    config.REACT_APP_FIREBASE_API_KEY = await ask('Firebase API Key: ');
    config.REACT_APP_FIREBASE_AUTH_DOMAIN = await ask('Firebase Auth Domain: ');
    config.REACT_APP_FIREBASE_PROJECT_ID = await ask('Firebase Project ID: ');
    config.REACT_APP_FIREBASE_STORAGE_BUCKET = await ask('Firebase Storage Bucket: ');
    config.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = await ask('Firebase Messaging Sender ID: ');
    config.REACT_APP_FIREBASE_APP_ID = await ask('Firebase App ID: ');
    config.REACT_APP_FIREBASE_MEASUREMENT_ID = await ask('Firebase Measurement ID (optional): ');

    console.log('\n🤖 Google AI APIs:');
    config.REACT_APP_GEMINI_API_KEY = await ask('Gemini API Key: ');

    console.log('\n☁️ Google Cloud APIs:');
    config.REACT_APP_GOOGLE_CLOUD_PROJECT_ID = await ask('Google Cloud Project ID: ');
    config.REACT_APP_GOOGLE_TRANSLATE_API_KEY = await ask('Google Translate API Key (optional): ');
    config.REACT_APP_GOOGLE_NLP_API_KEY = await ask('Google Natural Language API Key (optional): ');
    config.REACT_APP_GOOGLE_SPEECH_API_KEY = await ask('Google Speech-to-Text API Key (optional): ');

    console.log('\n📅 Google Calendar & Meet:');
    config.REACT_APP_GOOGLE_CALENDAR_API_KEY = await ask('Google Calendar API Key (optional): ');
    config.REACT_APP_GOOGLE_MEET_API_KEY = await ask('Google Meet API Key (optional): ');

    console.log('\n🔒 Security:');
    const encryptionKey = await ask('Encryption Key (leave empty for auto-generated): ');
    config.REACT_APP_ENCRYPTION_KEY = encryptionKey || generateRandomKey();

    // Generate .env file
    let envContent = '# Mindsync Configuration\n# Generated on ' + new Date().toISOString() + '\n\n';
    
    Object.entries(config).forEach(([key, value]) => {
      if (value && value.trim()) {
        envContent += `${key}=${value}\n`;
      } else {
        envContent += `# ${key}=your-${key.toLowerCase().replace('react_app_', '').replace(/_/g, '-')}\n`;
      }
    });

    // Add additional config
    envContent += '\n# App Configuration\n';
    envContent += 'REACT_APP_CRISIS_HOTLINE=+91-9152987821\n';
    envContent += 'REACT_APP_ENABLE_ANALYTICS=true\n';

    fs.writeFileSync('.env', envContent);

    console.log('\n✅ Setup complete! Your .env file has been created.\n');
    
    console.log('📋 Next steps:');
    console.log('1. Review and update your .env file with actual API keys');
    console.log('2. Run "npm install" to install dependencies');
    console.log('3. Run "npm start" to start the development server');
    console.log('4. Visit the APIs setup guide in README.md for detailed instructions\n');
    
    console.log('🔗 Quick links:');
    console.log('• Firebase Console: https://console.firebase.google.com');
    console.log('• Google AI Studio: https://makersuite.google.com');
    console.log('• Google Cloud Console: https://console.cloud.google.com');
    console.log('• Gemini API: https://makersuite.google.com/app/apikey\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

function generateRandomKey() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

// Run setup
setupMindsync().catch(console.error);
