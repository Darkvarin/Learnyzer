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
  const cachedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

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
      
      // CACHED VOICE SELECTION: Use previously selected voice for consistency
      let selectedVoice = cachedVoiceRef.current;
      
      // If no cached voice, select and cache a voice
      if (!selectedVoice || !voices.includes(selectedVoice)) {
        // PRIORITY: Indian accent English and Hinglish FEMALE voices ONLY
        
        // Step 1: Find all Indian voices (prioritize English over Hindi for English content)
        const indianEnglishVoices = voices.filter(voice => 
          voice.lang.includes('en-IN') || 
          voice.name.includes('India') ||
          voice.name.includes('Neerja') ||
          voice.name.includes('Aditi') ||
          voice.name.includes('Kavya') ||
          voice.name.includes('Priya')
        );
        
        const indianHindiVoices = voices.filter(voice => 
          voice.lang.includes('hi-IN') ||
          voice.name.includes('Swara')
        );
        
        // Step 2: Combine and filter for female voices only (exclude male names)
        const allIndianVoices = [...indianEnglishVoices, ...indianHindiVoices];
        const femaleIndianVoices = allIndianVoices.filter(voice => {
          const maleName = ['prabhat', 'madhur', 'male'].some(name => 
            voice.name.toLowerCase().includes(name)
          );
          return !maleName; // Exclude male voices
        });
        
        console.log('🇮🇳 Indian voices found:', allIndianVoices.map(v => `${v.name} (${v.lang})`));
        console.log('♀️ Female Indian voices:', femaleIndianVoices.map(v => `${v.name} (${v.lang})`));
        
        // Step 3: REALISTIC voice selection based on what's actually available
        console.log('🔍 Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Priority 1: Look for ANY Indian English voices (en-IN)
        selectedVoice = voices.find(voice => 
          voice.lang === 'en-IN' && 
          !['male', 'prabhat', 'madhur'].some(male => voice.name.toLowerCase().includes(male))
        );
        
        // Priority 2: Look for any voice with "India" in name
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('india') && 
            voice.lang.startsWith('en') &&
            !['male', 'prabhat', 'madhur'].some(male => voice.name.toLowerCase().includes(male))
          );
        }
        
        // Priority 3: Use best available female English voices (avoid Hindi for English content)
        if (!selectedVoice) {
          const goodFemaleVoices = voices.filter(voice => {
            const isMale = ['male', 'mark', 'david', 'daniel', 'james', 'kevin', 'ryan', 'aaron', 'thomas'].some(name => 
              voice.name.toLowerCase().includes(name)
            );
            const isFemale = ['female', 'anna', 'aria', 'linda', 'hazel', 'zoe', 'samantha', 'karen', 'fiona', 'susan', 'mary'].some(name => 
              voice.name.toLowerCase().includes(name)
            );
            const isEnglish = voice.lang.startsWith('en') && !voice.lang.includes('hi');
            return isEnglish && (isFemale || !isMale);
          });
          
          // Prefer specific good female voices
          selectedVoice = goodFemaleVoices.find(v => v.name.includes('Samantha')) || 
                         goodFemaleVoices.find(v => v.name.includes('Anna')) ||
                         goodFemaleVoices.find(v => v.name.includes('Karen')) ||
                         goodFemaleVoices.find(v => v.name.includes('Susan')) ||
                         goodFemaleVoices[0];
        }
        
        // Final fallback: Any female English voice (avoid male voices completely)
        if (!selectedVoice) {
          const femaleEnglishVoices = voices.filter(voice => {
            const isMale = ['male', 'mark', 'david', 'daniel', 'james', 'kevin', 'ryan', 'aaron'].some(name => 
              voice.name.toLowerCase().includes(name)
            );
            const isFemale = ['female', 'anna', 'aria', 'linda', 'hazel', 'zoe', 'samantha', 'karen', 'fiona'].some(name => 
              voice.name.toLowerCase().includes(name)
            );
            return voice.lang.startsWith('en') && (isFemale || !isMale);
          });
          
          // Prefer US/UK female voices if Indian not available
          selectedVoice = femaleEnglishVoices.find(v => v.name.includes('Anna')) || 
                         femaleEnglishVoices.find(v => v.name.includes('Aria')) ||
                         femaleEnglishVoices.find(v => v.name.includes('Samantha')) ||
                         femaleEnglishVoices[0];
        }
        
        // Cache the selected voice for future use
        if (selectedVoice) {
          cachedVoiceRef.current = selectedVoice;
          console.log('✅ CACHED FEMALE VOICE:', selectedVoice.name, selectedVoice.lang);
        } else {
          console.error('❌ NO SUITABLE VOICE FOUND! Using system default.');
        }
      } else {
        console.log('🔄 USING CACHED VOICE:', selectedVoice.name, selectedVoice.lang);
      }
      
      // Debug logging for Indian female voice selection
      console.log('INDIAN FEMALE VOICE SELECTION:', {
        selectedVoiceName: selectedVoice?.name,
        selectedVoiceLang: selectedVoice?.lang,
        totalVoicesAvailable: voices.length,
        indianVoicesCount: voices.filter(v => v.lang.includes('IN') || v.name.includes('India')).length,
        femaleIndianVoices: voices.filter(v => 
          (v.lang.includes('IN') || v.name.includes('India')) && 
          !['prabhat', 'madhur', 'male'].some(name => v.name.toLowerCase().includes(name))
        ).map(v => v.name)
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
      
      // CRITICAL: Force volume to maximum for audibility
      utterance.volume = 1.0;
      
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
      
      console.log('🔊 STARTING TTS with text:', cleanText.substring(0, 100) + '...');
      console.log('🎤 Selected voice:', selectedVoice?.name || 'default', selectedVoice?.lang);
      console.log('📢 Volume:', utterance.volume, 'Rate:', utterance.rate);
      console.log('🗣️ Available voices count:', voices.length);
      
      try {
        // ENHANCED TTS RELIABILITY: Prevent mid-speech interruptions
        if (window.speechSynthesis.speaking) {
          console.log('Cancelling previous speech...');
          window.speechSynthesis.cancel();
          // Wait longer to ensure proper cancellation
          setTimeout(() => {
            speakChunked(utterance, cleanText);
          }, 200);
        } else {
          speakChunked(utterance, cleanText);
        }
      } catch (err) {
        console.error('Failed to start speech synthesis:', err);
        setIsSpeaking(false);
      }
      
      // Helper function to speak in chunks to prevent interruption
      function speakChunked(utterance: SpeechSynthesisUtterance, text: string) {
        // For longer texts, split into sentences to prevent timeout
        if (text.length > 200) {
          const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
          let currentIndex = 0;
          
          function speakNextSentence() {
            if (currentIndex < sentences.length && isSpeaking) {
              const sentence = sentences[currentIndex].trim() + '.';
              const sentenceUtterance = new SpeechSynthesisUtterance(sentence);
              
              // Use same voice and settings
              if (selectedVoice) sentenceUtterance.voice = selectedVoice;
              sentenceUtterance.rate = options?.rate || 0.95;
              sentenceUtterance.pitch = options?.pitch || 1.0;
              sentenceUtterance.volume = options?.volume || 1.0;
              
              sentenceUtterance.onend = () => {
                currentIndex++;
                // Small pause between sentences
                setTimeout(() => {
                  if (currentIndex < sentences.length && isSpeaking) {
                    speakNextSentence();
                  } else {
                    setIsSpeaking(false);
                  }
                }, 100);
              };
              
              sentenceUtterance.onerror = () => {
                console.warn('Sentence TTS failed, continuing to next...');
                currentIndex++;
                setTimeout(speakNextSentence, 100);
              };
              
              window.speechSynthesis.speak(sentenceUtterance);
            } else {
              setIsSpeaking(false);
            }
          }
          
          speakNextSentence();
        } else {
          // Short text, speak normally
          window.speechSynthesis.speak(utterance);
        }
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