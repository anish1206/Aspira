import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechToText = () => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.interimResults = false;
            recognitionRef.current.continuous = false;
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }, []);

    const startListening = useCallback((callback) => {
        if (!recognitionRef.current) {
            console.error("Speech Recognition not supported");
            return;
        }

        if (isListening) return;

        // Define handlers
        recognitionRef.current.onresult = (event) => {
            const text = event.results[0][0].transcript;
            if (callback) callback(text);
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            console.error("Failed to start speech recognition:", e);
            setIsListening(false);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return { isListening, startListening, stopListening };
};

export default useSpeechToText;
