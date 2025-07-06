import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && 'speechSynthesis' in window) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-IN'; // Indian English
        
        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript(finalTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Clean text for better TTS - remove markdown and make it speech-friendly
      const cleanText = text
        .replace(/#{1,6}\s+/g, '') // Remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/`(.*?)`/g, '$1') // Remove code markdown
        .replace(/>\s+(.*?)$/gm, 'Note: $1') // Convert blockquotes to "Note:"
        .replace(/\$\$(.*?)\$\$/g, (match, equation) => `The equation: ${equation.replace(/\\times/g, ' times ').replace(/\\text\{([^}]+)\}/g, '$1').replace(/\^/g, ' to the power of ').replace(/\{([^}]+)\}/g, '$1').replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2').replace(/\\mu/g, 'mu').replace(/\\cdot/g, ' dot ')}`) // Handle display math
        .replace(/\$([^$]+)\$/g, (match, equation) => `${equation.replace(/\\times/g, ' times ').replace(/\\text\{([^}]+)\}/g, '$1').replace(/\^/g, ' to the power of ').replace(/\{([^}]+)\}/g, '$1').replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2').replace(/\\mu/g, 'mu').replace(/\\cdot/g, ' dot ')}`) // Handle inline math
        .replace(/\d+\.\s+/g, '') // Remove numbered list markers
        .replace(/[-*+]\s+/g, '') // Remove bullet points
        .replace(/\n+/g, '. ') // Replace line breaks with periods
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Find best Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      
      // Priority order for Indian voices (most authentic first)
      const indianVoicePriority = [
        // Microsoft Natural voices (best quality)
        'Microsoft Neerja Online (Natural) - English (India)',
        'Microsoft Prabhat Online (Natural) - English (India)', 
        // Other Indian voices
        'Ravi', 'Veena', 'Aditi', 'Kavya'
      ];
      
      let indianVoice = null;
      
      // First, try to find voices by exact name match (highest priority)
      for (const preferredName of indianVoicePriority) {
        indianVoice = voices.find(voice => voice.name === preferredName);
        if (indianVoice) break;
      }
      
      // If no exact match, try language and name patterns
      if (!indianVoice) {
        indianVoice = voices.find(voice => 
          voice.lang.includes('en-IN') || 
          voice.name.toLowerCase().includes('indian') ||
          voice.name.toLowerCase().includes('ravi') ||
          voice.name.toLowerCase().includes('veena') ||
          voice.name.toLowerCase().includes('aditi') ||
          voice.name.toLowerCase().includes('kavya')
        );
      }
      
      if (indianVoice) {
        utterance.voice = indianVoice;
      } else {
        // Fallback to any English voice
        const englishVoice = voices.find(voice => voice.lang.includes('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      utterance.rate = options?.rate || 1.1; // Natural speaking pace
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsSpeaking(false);
        // Handle common speech synthesis errors gracefully
        if (error.error === 'network') {
          console.warn('Network error during speech synthesis - this is normal and can be ignored');
        } else if (error.error === 'synthesis-failed') {
          console.warn('Speech synthesis failed - retrying with fallback voice');
          // Try again with system default voice
          const fallbackUtterance = new SpeechSynthesisUtterance(cleanText);
          fallbackUtterance.rate = options?.rate || 0.9;
          fallbackUtterance.pitch = options?.pitch || 1.0;
          fallbackUtterance.volume = options?.volume || 1.0;
          fallbackUtterance.onend = () => setIsSpeaking(false);
          fallbackUtterance.onerror = () => setIsSpeaking(false);
          try {
            window.speechSynthesis.speak(fallbackUtterance);
          } catch (e) {
            console.warn('Fallback speech synthesis also failed:', e);
            setIsSpeaking(false);
          }
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Cleanup when hook is unmounted
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
}