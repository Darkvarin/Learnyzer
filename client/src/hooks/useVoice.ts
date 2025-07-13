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
      
      // Voice selection logic based on preference
      if (voicePreference === 'neerja') {
        // Look for female voices - Neerja or any female-sounding name
        const femaleVoiceNames = [
          'neerja', 'aditi', 'kavya', 'priya', 'shreya', 'riya', 'ananya', 'siri', 
          'samantha', 'victoria', 'susan', 'karen', 'zira', 'heera', 'female'
        ];
        
        selectedVoice = voices.find(voice => 
          femaleVoiceNames.some(name => 
            voice.name.toLowerCase().includes(name)
          )
        );
        
        // If no female name found, try pitch/gender detection by looking at voice characteristics
        if (!selectedVoice) {
          // Often female voices are the first in each language group
          const indianVoices = voices.filter(voice => 
            voice.lang.includes('en-IN') || voice.lang.includes('en')
          );
          // Try to pick voices that are likely female (often have higher pitch characteristics in name)
          selectedVoice = indianVoices.find((voice, index) => index % 2 === 0);
        }
        
      } else if (voicePreference === 'prabhat') {
        // Look for male voices - Prabhat or any male-sounding name  
        const maleVoiceNames = [
          'prabhat', 'ravi', 'arjun', 'vikash', 'mukul', 'alex', 'daniel', 'mark', 
          'david', 'paul', 'adam', 'male', 'man'
        ];
        
        selectedVoice = voices.find(voice => 
          maleVoiceNames.some(name => 
            voice.name.toLowerCase().includes(name)
          )
        );
        
        // If no male name found, try to pick voices that are likely male
        if (!selectedVoice) {
          const indianVoices = voices.filter(voice => 
            voice.lang.includes('en-IN') || voice.lang.includes('en')
          );
          // Try to pick voices that are likely male (often odd-indexed or deeper sounding)
          selectedVoice = indianVoices.find((voice, index) => index % 2 === 1);
        }
        
      } else {
        // Auto selection - prefer actual Indian voices first
        const indianVoicePriority = [
          'Microsoft Neerja Online (Natural) - English (India)',
          'Microsoft Prabhat Online (Natural) - English (India)', 
          'Ravi', 'Veena', 'Aditi', 'Kavya'
        ];
        
        for (const preferredName of indianVoicePriority) {
          selectedVoice = voices.find(voice => voice.name === preferredName);
          if (selectedVoice) break;
        }
        
        // If no exact match, try language and name patterns
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.includes('en-IN') || 
            voice.name.toLowerCase().includes('indian') ||
            voice.name.toLowerCase().includes('ravi') ||
            voice.name.toLowerCase().includes('veena') ||
            voice.name.toLowerCase().includes('aditi') ||
            voice.name.toLowerCase().includes('kavya')
          );
        }
      }
      
      // Force Indian English voices for English language (not American accent)
      if (language === 'english') {
        // Override with Indian English voices when available
        const indianEnglishVoices = voices.filter(voice => 
          voice.lang.includes('en-IN') || 
          voice.name.includes('India') ||
          voice.name.includes('Neerja') ||
          voice.name.includes('Prabhat')
        );
        
        if (indianEnglishVoices.length > 0) {
          if (voicePreference === 'neerja') {
            selectedVoice = indianEnglishVoices.find(v => v.name.includes('Neerja')) || indianEnglishVoices[0];
          } else if (voicePreference === 'prabhat') {
            selectedVoice = indianEnglishVoices.find(v => v.name.includes('Prabhat')) || indianEnglishVoices[0];
          } else {
            // Auto: prefer any Indian English voice over American
            selectedVoice = indianEnglishVoices[0];
          }
        }
      }
      
      // For Hindi language, respect gender preference and find appropriate Hindi voices
      if (language === 'hindi') {
        let hindiVoices = voices.filter(voice => 
          voice.lang.includes('hi-IN') || 
          voice.lang.includes('hi') ||
          voice.name.toLowerCase().includes('hindi')
        );
        
        if (hindiVoices.length > 0) {
          if (voicePreference === 'neerja') {
            // Look for female Hindi voices
            const femaleHindiVoice = hindiVoices.find(voice => 
              voice.name.toLowerCase().includes('heera') ||
              voice.name.toLowerCase().includes('kalpana') ||
              voice.name.toLowerCase().includes('swara') ||
              !voice.name.toLowerCase().includes('madhur') && // Madhur is male
              !voice.name.toLowerCase().includes('prabhat')
            );
            if (femaleHindiVoice) {
              selectedVoice = femaleHindiVoice;
            } else {
              // Fallback: use Indian English female voice for Hinglish
              const indianFemaleVoice = voices.find(voice => 
                voice.name.includes('Neerja') || 
                (voice.lang.includes('en-IN') && voice.name.toLowerCase().includes('female'))
              );
              if (indianFemaleVoice) {
                selectedVoice = indianFemaleVoice;
              }
            }
          } else if (voicePreference === 'prabhat') {
            // Look for male Hindi voices (Madhur is typically male)
            const maleHindiVoice = hindiVoices.find(voice => 
              voice.name.toLowerCase().includes('madhur') ||
              voice.name.toLowerCase().includes('prabhat')
            );
            selectedVoice = maleHindiVoice || hindiVoices[0];
          } else {
            // Auto: prefer any Hindi voice
            selectedVoice = hindiVoices[0];
          }
        } else {
          // If no Hindi voice found, use selected Indian English voice (they can speak Hindi too)
          // Keep the previously selected voice
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        // Fallback to any English voice
        const englishVoice = voices.find(voice => voice.lang.includes('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      utterance.rate = options?.rate || 0.85; // Slower pace for better comprehension
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
          fallbackUtterance.rate = options?.rate || 0.85;
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