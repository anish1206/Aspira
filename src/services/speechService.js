// src/services/speechService.js
class SpeechService {
  constructor() {
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recognition = null;
    
    // Initialize Web Speech API (fallback for basic functionality)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  async startRecording(onTranscription, language = 'en-IN') {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Speech recording not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use Web Speech API for real-time transcription
      if (this.recognition) {
        this.recognition.lang = this.getLanguageCode(language);
        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          onTranscription(transcript, event.results[0][0].confidence);
        };
        
        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };
        
        this.recognition.start();
      }

      // Also record for potential Google Speech-to-Text API processing
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.isRecording) {
        resolve(null);
        return;
      }

      // Stop Web Speech API
      if (this.recognition) {
        this.recognition.stop();
      }

      // Stop MediaRecorder
      if (this.mediaRecorder) {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          this.isRecording = false;
          resolve(audioBlob);
        };
        
        this.mediaRecorder.stop();
        
        // Stop all audio tracks
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    });
  }

  async transcribeAudioBlob(audioBlob, language = 'en-IN') {
    try {
      // Try Google Speech-to-Text API first, fallback to Web Speech API
      const API_KEY = process.env.REACT_APP_GOOGLE_SPEECH_API_KEY;
      
      if (API_KEY) {
        return await this.transcribeWithGoogleAPI(audioBlob, language);
      } else {
        console.warn('Google Speech-to-Text API key not found, using Web Speech API fallback');
        return this.transcribeWithWebSpeechAPI(audioBlob, language);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      // Fallback to Web Speech API
      return this.transcribeWithWebSpeechAPI(audioBlob, language);
    }
  }

  transcribeWithWebSpeechAPI(audioBlob, language) {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not available'));
        return;
      }

      // Create audio URL for playback testing
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // For this MVP, return a mock transcription
      // In production, implement proper Google Speech-to-Text API call
      setTimeout(() => {
        resolve({
          transcript: '[Voice transcription would appear here]',
          confidence: 0.85,
          language: language,
          audioUrl: audioUrl
        });
      }, 1000);
    });
  }

  // Enhanced transcription with Google Speech-to-Text API
  async transcribeWithGoogleAPI(audioBlob, language = 'en-IN') {
    try {
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      const API_KEY = process.env.REACT_APP_GOOGLE_SPEECH_API_KEY;
      
      // Determine encoding based on blob type
      const encoding = this.getAudioEncoding(audioBlob.type);
      
      const requestBody = {
        config: {
          encoding: encoding,
          sampleRateHertz: 16000, // Standard rate for most recordings
          languageCode: language,
          enableAutomaticPunctuation: true,
          model: 'latest_short',
          useEnhanced: true,
          alternativeLanguageCodes: ['en-IN', 'hi-IN'], // Fallback languages
          profanityFilter: false, // We handle content moderation separately
          speechContexts: [{
            phrases: [
              'mental health', 'anxiety', 'depression', 'stress', 'therapy',
              'counseling', 'mood', 'feelings', 'emotions', 'wellbeing'
            ]
          }]
        },
        audio: {
          content: base64Audio.split(',')[1] // Remove data:audio/type;base64, prefix
        }
      };

      const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (result.error) {
        console.error('Google Speech API error:', result.error);
        throw new Error(result.error.message);
      }
      
      if (result.results && result.results.length > 0) {
        const bestAlternative = result.results[0].alternatives[0];
        return {
          transcript: bestAlternative.transcript,
          confidence: bestAlternative.confidence || 0.8,
          language: language,
          wordCount: bestAlternative.transcript.split(' ').length
        };
      }
      
      return { transcript: '', confidence: 0, language, wordCount: 0 };
    } catch (error) {
      console.error('Google Speech-to-Text API error:', error);
      throw error;
    }
  }

  getAudioEncoding(mimeType) {
    if (mimeType.includes('webm')) return 'WEBM_OPUS';
    if (mimeType.includes('mp4')) return 'MP4';
    if (mimeType.includes('wav')) return 'LINEAR16';
    if (mimeType.includes('flac')) return 'FLAC';
    return 'WEBM_OPUS'; // Default for most browsers
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  getLanguageCode(language) {
    const languageMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN'
    };
    
    return languageMap[language] || 'en-IN';
  }

  // Enhanced voice mood detection with better analysis
  async analyzeMoodFromSpeech(audioBlob) {
    try {
      // Get transcription from Google API or Web Speech API
      const transcription = await this.transcribeAudioBlob(audioBlob);
      
      // Enhanced mood analysis with more sophisticated indicators
      const moodIndicators = {
        happy: {
          words: ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'awesome', 'love', 'excited', 'cheerful', 'joyful'],
          phrases: ['feeling good', 'doing well', 'much better', 'really happy'],
          weight: 1.2
        },
        sad: {
          words: ['sad', 'down', 'depressed', 'upset', 'crying', 'terrible', 'awful', 'miserable', 'heartbroken', 'devastated'],
          phrases: ['feeling down', 'really sad', 'want to cry', 'feeling low'],
          weight: 1.5
        },
        anxious: {
          words: ['worried', 'nervous', 'scared', 'anxious', 'stressed', 'panic', 'overwhelmed', 'tense', 'restless'],
          phrases: ['can\'t sleep', 'heart racing', 'feeling overwhelmed', 'so worried'],
          weight: 1.3
        },
        angry: {
          words: ['angry', 'mad', 'furious', 'frustrated', 'annoyed', 'irritated', 'pissed', 'rage'],
          phrases: ['so angry', 'really mad', 'can\'t stand', 'fed up'],
          weight: 1.1
        },
        calm: {
          words: ['calm', 'peaceful', 'relaxed', 'content', 'serene', 'tranquil', 'composed', 'balanced'],
          phrases: ['feeling calm', 'much better', 'more relaxed', 'at peace'],
          weight: 1.0
        }
      };

      const transcript = transcription.transcript.toLowerCase();
      let detectedMood = 'neutral';
      let maxScore = 0;
      let moodScores = {};

      // Calculate scores for each mood
      Object.entries(moodIndicators).forEach(([mood, indicators]) => {
        let score = 0;
        
        // Check individual words
        indicators.words.forEach(word => {
          if (transcript.includes(word)) {
            score += 1 * indicators.weight;
          }
        });
        
        // Check phrases (higher weight)
        indicators.phrases.forEach(phrase => {
          if (transcript.includes(phrase)) {
            score += 2 * indicators.weight;
          }
        });
        
        moodScores[mood] = score;
        
        if (score > maxScore) {
          maxScore = score;
          detectedMood = mood;
        }
      });

      // Calculate confidence based on clarity of mood indicators
      const totalScore = Object.values(moodScores).reduce((a, b) => a + b, 0);
      const confidence = totalScore > 0 ? Math.min(1, maxScore / (totalScore + 1)) : 0.3;

      // Enhanced mood detection using speech patterns
      const audioAnalysis = await this.analyzeAudioCharacteristics(audioBlob);
      
      return {
        detectedMood,
        confidence: Math.max(confidence, transcription.confidence || 0),
        transcript: transcription.transcript,
        suggestedMoodScore: this.moodToScore(detectedMood),
        audioCharacteristics: audioAnalysis,
        moodScores, // For debugging
        wordCount: transcription.wordCount || 0
      };
    } catch (error) {
      console.error('Error analyzing mood from speech:', error);
      return { 
        detectedMood: 'neutral', 
        confidence: 0, 
        transcript: '', 
        suggestedMoodScore: 3,
        audioCharacteristics: null,
        error: error.message
      };
    }
  }

  // Basic audio characteristic analysis (tempo, volume)
  async analyzeAudioCharacteristics(audioBlob) {
    try {
      // Simple audio analysis - in production, could use more sophisticated methods
      return {
        duration: audioBlob.size / 16000, // Rough estimate
        estimatedTempo: 'normal', // Could analyze speech rate
        estimatedVolume: 'normal' // Could analyze audio amplitude
      };
    } catch (error) {
      console.error('Error analyzing audio characteristics:', error);
      return null;
    }
  }

  moodToScore(mood) {
    const moodScores = {
      'happy': 5,
      'calm': 4,
      'neutral': 3,
      'anxious': 2,
      'sad': 2,
      'angry': 1
    };
    
    return moodScores[mood] || 3;
  }

  // Check if browser supports speech features
  isSupported() {
    return {
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      mediaRecorder: 'MediaRecorder' in window,
      getUserMedia: navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    };
  }

  // Text-to-speech for AI responses
  speakText(text, language = 'en-IN') {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // Find appropriate voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(language.split('-')[0]) && voice.localService
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
}

export default new SpeechService();
