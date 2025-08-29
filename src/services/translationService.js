// src/services/translationService.js
import axios from 'axios';

const API_KEY = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
const BASE_URL = 'https://translation.googleapis.com/language/translate/v2';

class TranslationService {
  constructor() {
    this.supportedLanguages = {
      'en': 'English',
      'hi': 'Hindi',
      'bn': 'Bengali', 
      'ta': 'Tamil',
      'te': 'Telugu',
      'mr': 'Marathi',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'or': 'Odia'
    };
  }

  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    try {
      const response = await axios.post(`${BASE_URL}?key=${API_KEY}`, {
        q: text,
        target: targetLanguage,
        source: sourceLanguage,
        format: 'text'
      });

      return {
        translatedText: response.data.data.translations[0].translatedText,
        detectedSourceLanguage: response.data.data.translations[0].detectedSourceLanguage
      };
    } catch (error) {
      console.error('Translation API Error:', error);
      return { translatedText: text, detectedSourceLanguage: sourceLanguage };
    }
  }

  async detectLanguage(text) {
    try {
      const response = await axios.post(`https://translation.googleapis.com/language/translate/v2/detect?key=${API_KEY}`, {
        q: text
      });

      const detections = response.data.data.detections[0];
      return detections[0].language;
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  getLanguageName(code) {
    return this.supportedLanguages[code] || 'Unknown';
  }
}

export default new TranslationService();
