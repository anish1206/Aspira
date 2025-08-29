// src/components/VoiceRecorder.js
import React, { useState, useEffect } from 'react';
import speechService from '../services/speechService';

export default function VoiceRecorder({ onTranscription, onMoodDetection, language = 'en' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    const support = speechService.isSupported();
    setIsSupported(support.speechRecognition && support.getUserMedia);
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setTranscript('');
      
      await speechService.startRecording((transcript, confidence) => {
        setTranscript(transcript);
        if (onTranscription) {
          onTranscription(transcript, confidence);
        }
      }, language);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      const audioBlob = await speechService.stopRecording();
      
      if (audioBlob && onMoodDetection) {
        const moodAnalysis = await speechService.analyzeMoodFromSpeech(audioBlob);
        onMoodDetection(moodAnalysis);
      }
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('Failed to process recording.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div style={{
        padding: 12,
        border: '1px solid #ffcc02',
        borderRadius: 6,
        background: '#fff8e1',
        color: '#ef6c00',
        fontSize: 14,
        textAlign: 'center'
      }}>
        🎤 Voice features not supported in this browser. Please use text input.
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: 16,
      background: 'white'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 16,
        marginBottom: 12
      }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: 'none',
            background: isRecording ? '#f44336' : '#1976d2',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            transition: 'all 0.2s',
            opacity: isProcessing ? 0.6 : 1
          }}
        >
          {isProcessing ? '⏳' : isRecording ? '⏹️' : '🎤'}
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>
            {isRecording ? '🔴 Recording...' : 
             isProcessing ? '⏳ Processing...' : 
             '🎤 Voice Check-in'}
          </div>
          {isRecording && (
            <div style={{ fontSize: 12, color: '#666' }}>
              {formatTime(recordingTime)}
            </div>
          )}
          {!isRecording && !isProcessing && (
            <div style={{ fontSize: 12, color: '#666' }}>
              Tap to start recording your mood
            </div>
          )}
        </div>
      </div>
      
      {transcript && (
        <div style={{
          marginTop: 16,
          padding: 12,
          background: '#f8f9fa',
          borderRadius: 6,
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            📝 Live Transcript:
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.4 }}>
            {transcript}
          </div>
        </div>
      )}
      
      <div style={{
        marginTop: 12,
        padding: 8,
        background: '#e3f2fd',
        borderRadius: 4,
        fontSize: 12,
        color: '#1565c0'
      }}>
        💡 Tip: Speak naturally about how you're feeling. Our AI will detect your mood and provide personalized support.
      </div>
    </div>
  );
}
