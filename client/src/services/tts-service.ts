/**
 * Client-side TTS service using OpenAI TTS API for consistent Indian accent voices
 */

interface TTSOptions {
  voice?: 'nova' | 'shimmer' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'indian_female' | 'indian_male';
  language?: 'english' | 'hindi';
  gender?: 'female' | 'male';
  rate?: number;
}

interface TTSResponse {
  success: boolean;
  audioBase64?: string;
  mimeType?: string;
  voice?: string;
  error?: string;
}

class ClientTTSService {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;

  /**
   * Generate and play speech using OpenAI TTS API
   */
  async speak(text: string, options: TTSOptions = {}): Promise<boolean> {
    try {
      // Stop any currently playing audio
      this.stop();

      const {
        voice = 'indian_female', // Use free Indian accent by default
        language = 'english',
        gender = 'female',
        rate = 0.8 // Optimized for Indian accent
      } = options;

      // Preprocess text for Indian accent characteristics
      const processedText = this.preprocessForIndianAccent(text, language);

      console.log(`🎤 Requesting TTS from server: ${processedText.substring(0, 50)}...`);
      console.log(`🔧 Voice settings: ${voice}, ${language}, ${gender}, rate: ${rate}`);

      // Call our backend TTS API
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: processedText,
          voice,
          language,
          gender,
          useFree: true // Try free Indian accent TTS first
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'TTS request failed');
      }

      const result: TTSResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'TTS request failed');
      }

      // Check if server wants us to use browser TTS
      if ((result as any).useBrowserTTS) {
        console.log('🎤 Server directed to browser TTS for reliable speech');
        return this.fallbackToBrowserTTS((result as any).text || text, options);
      }

      if (!result.audioBase64) {
        throw new Error('No audio data received');
      }

      // Create audio blob from base64
      const binaryString = atob(result.audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: result.mimeType || 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      this.audio = new Audio(audioUrl);
      this.audio.volume = 1.0; // Maximum volume
      this.audio.playbackRate = rate;

      console.log(`✅ Playing audio with ${result.voice} voice`);

      return new Promise((resolve, reject) => {
        if (!this.audio) {
          reject(new Error('Audio creation failed'));
          return;
        }

        this.audio.onended = () => {
          console.log('🔊 TTS playback finished');
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          resolve(true);
        };

        this.audio.onerror = (error) => {
          console.error('🚫 Audio playback error:', error);
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };

        this.audio.onloadstart = () => {
          this.isPlaying = true;
        };

        this.audio.play().catch(error => {
          console.error('🚫 Audio play failed:', error);
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          reject(error);
        });
      });

    } catch (error) {
      console.error('❌ TTS Service Error:', error);
      console.log('⚠️ Trying browser fallback with Indian voice...');
      return this.fallbackToBrowserTTS(text, options);
    }
  }

  /**
   * Enhanced browser TTS with Indian voice priority and chunked speech
   */
  private async fallbackToBrowserTTS(text: string, options: TTSOptions = {}): Promise<boolean> {
    try {
      if (!('speechSynthesis' in window)) {
        console.error('❌ Browser TTS not supported');
        return false;
      }

      this.stop(); // Stop any current audio

      // Wait for voices to load
      await new Promise<void>((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve();
        } else {
          speechSynthesis.onvoiceschanged = () => resolve();
        }
      });

      const voices = speechSynthesis.getVoices();
      console.log('🔍 Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Enhanced Indian voice detection - prioritize English voices
      const indianEnglishVoice = voices.find(voice => 
        voice.lang === 'en-IN' ||
        (voice.name.toLowerCase().includes('indian') && voice.lang.startsWith('en')) ||
        voice.name.toLowerCase().includes('raveena') ||
        voice.name.toLowerCase().includes('aditi') ||
        voice.name.toLowerCase().includes('priya') ||
        voice.name.toLowerCase().includes('neerja')
      );
      
      // Fallback voice options
      const britishVoice = voices.find(voice => 
        voice.lang === 'en-GB' || 
        voice.name.toLowerCase().includes('british') ||
        voice.name.toLowerCase().includes('uk')
      );

      const femaleVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman'))
      );

      let selectedVoice = indianEnglishVoice || britishVoice || femaleVoice || voices.find(v => v.lang.startsWith('en'));

      if (selectedVoice) {
        console.log('✅ Selected voice:', selectedVoice.name, '(' + selectedVoice.lang + ')');
      }

      // Split text into sentences to prevent timeout
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (!sentence) continue;

        await new Promise<void>((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance(sentence);
          
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          
          utterance.rate = 0.85; // Slightly slower for clarity
          utterance.pitch = 0.9;
          utterance.volume = 1.0;

          utterance.onend = () => {
            console.log(`✅ Completed sentence ${i + 1}/${sentences.length}`);
            // Small pause between sentences
            setTimeout(resolve, 300);
          };
          
          utterance.onerror = (error) => {
            console.error(`❌ Sentence ${i + 1} failed:`, error);
            setTimeout(resolve, 100); // Continue with next sentence after brief pause
          };

          // Ensure speech synthesis is ready
          if (speechSynthesis.paused) {
            speechSynthesis.resume();
          }
          
          speechSynthesis.speak(utterance);
        });
      }

      console.log('🔊 Browser TTS playback finished');
      return true;

    } catch (error) {
      console.error('❌ Browser TTS fallback failed:', error);
      return false;
    }
  }

  /**
   * Stop any currently playing audio
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    this.isPlaying = false;
    console.log('⏹️ TTS stopped');
  }

  /**
   * Check if audio is currently playing
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get available voice options
   */
  getAvailableVoices() {
    return {
      female: ['indian_female', 'nova', 'shimmer', 'alloy'],
      male: ['indian_male', 'echo', 'fable', 'onyx']
    };
  }

  /**
   * Get recommended voice for Indian content
   */
  getRecommendedVoice(language: 'english' | 'hindi' = 'english', gender: 'female' | 'male' = 'female') {
    if (gender === 'female') {
      return 'indian_female'; // Free Indian accent female voice
    } else {
      return 'indian_male'; // Free Indian accent male voice
    }
  }

  /**
   * Process text to simulate Indian accent characteristics (minimal processing)
   */
  private preprocessForIndianAccent(text: string, language: 'english' | 'hindi'): string {
    if (language === 'hindi') {
      return text; // Keep Hindi text as is
    }

    // Keep minimal processing - the authentic Indian voice handles the accent
    // Only do basic cleanup for better pronunciation
    return text
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim(); // Remove leading/trailing spaces
  }
}

// Export singleton instance
export const clientTTSService = new ClientTTSService();
export default clientTTSService;