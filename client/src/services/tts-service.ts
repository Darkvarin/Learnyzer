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
   * Simplified and reliable browser TTS implementation
   */
  private async fallbackToBrowserTTS(text: string, options: TTSOptions = {}): Promise<boolean> {
    try {
      if (!('speechSynthesis' in window)) {
        console.error('❌ Browser TTS not supported');
        return false;
      }

      this.stop(); // Stop any current audio

      // Create utterance immediately
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set basic properties first
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-GB'; // Set to British English for better accent

      console.log('🎤 Created utterance, starting speech...');

      // Start speaking immediately without waiting for voice loading
      speechSynthesis.cancel(); // Clear any existing speech
      speechSynthesis.speak(utterance);

      console.log('✅ Browser TTS command executed');
      return true;

    } catch (error) {
      console.error('❌ Browser TTS failed:', error);
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