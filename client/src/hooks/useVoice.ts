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

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number; voicePreference?: 'auto' | 'neerja' | 'prabhat'; language?: 'english' | 'hindi' }) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Ensure voices are loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        console.log('Voices not loaded yet, waiting...');
        // Wait for voices to load and retry
        window.speechSynthesis.onvoiceschanged = () => {
          console.log('Voices loaded, retrying speech...');
          speak(text, options);
        };
        return;
      }
      
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
      
      // Find best voice based on preferences
      const voicePreference = options?.voicePreference || 'auto';
      const language = options?.language || 'english';
      
      let selectedVoice = null;
      
      // PRIORITY 1: Always try to find Indian voices first
      const indianEnglishVoices = voices.filter(voice => 
        voice.lang.includes('en-IN') || 
        voice.name.includes('India') ||
        voice.name.includes('Neerja') ||
        voice.name.includes('Prabhat')
      );
      
      const indianHindiVoices = voices.filter(voice => 
        voice.lang.includes('hi-IN') || 
        voice.lang.includes('hi') ||
        voice.name.toLowerCase().includes('hindi') ||
        voice.name.includes('Madhur') ||
        voice.name.includes('Swara')
      );

      // FEMALE VOICE ONLY: Always use Neerja for English and Swara for Hindi (Akira's voice)
      if (language === 'english' && indianEnglishVoices.length > 0) {
        // Always use Neerja for English (Akira's English voice)
        selectedVoice = indianEnglishVoices.find(v => v.name.includes('Neerja')) || indianEnglishVoices[0];
      } else if (language === 'hindi' && indianHindiVoices.length > 0) {
        // Always use Swara for Hindi/Hinglish (Akira's Hindi voice)
        selectedVoice = indianHindiVoices.find(v => v.name.includes('Swara')) || 
                       indianHindiVoices.find(v => !v.name.includes('Madhur')) ||
                       indianHindiVoices[0];
      } else {
        // Fallback to any female-sounding voice
        const femaleVoiceNames = ['neerja', 'swara', 'aditi', 'kavya', 'priya', 'heera', 'female'];
        selectedVoice = voices.find(voice => 
          femaleVoiceNames.some(name => 
            voice.name.toLowerCase().includes(name)
          )
        );
      }
      
      // Additional debug logging
      console.log('Voice selection details:', {
        voicePreference,
        language,
        selectedVoiceName: selectedVoice?.name,
        selectedVoiceLang: selectedVoice?.lang,
        indianEnglishCount: indianEnglishVoices.length,
        indianHindiCount: indianHindiVoices.length,
        availableIndianHindiVoices: indianHindiVoices.map(v => v.name),
        availableIndianEnglishVoices: indianEnglishVoices.map(v => v.name)
      });
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        // Fallback to any English voice
        const englishVoice = voices.find(voice => voice.lang.includes('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      utterance.rate = options?.rate || 0.95; // Adjusted pace for better comprehension
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;
      
      utterance.onstart = () => {
        console.log('TTS started speaking');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('TTS finished speaking');
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
          fallbackUtterance.rate = options?.rate || 0.95;
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
      
      console.log('Starting TTS with text:', cleanText.substring(0, 100) + '...');
      console.log('Selected voice:', selectedVoice?.name || 'default');
      console.log('Available voices count:', voices.length);
      
      try {
        // Ensure speech synthesis is ready
        if (window.speechSynthesis.speaking) {
          console.log('Cancelling previous speech...');
          window.speechSynthesis.cancel();
          // Small delay to ensure cancellation is complete
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 100);
        } else {
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.error('Failed to start speech synthesis:', err);
        setIsSpeaking(false);
      }
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