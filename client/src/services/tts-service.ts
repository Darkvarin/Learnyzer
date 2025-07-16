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

      if (!result.success || !result.audioBase64) {
        throw new Error(result.error || 'No audio data received');
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
   * Process text to simulate Indian accent characteristics
   */
  private preprocessForIndianAccent(text: string, language: 'english' | 'hindi'): string {
    if (language === 'hindi') {
      return text; // Keep Hindi text as is
    }

    // Add Indian English pronunciation patterns and expressions
    let processedText = text
      // Add slight Hinglish mixing for natural flow
      .replace(/\bvery good\b/gi, 'bahut accha')
      .replace(/\bexcellent\b/gi, 'excellent hai')
      .replace(/\bunderstand\b/gi, 'samajh gaya')
      
      // Adjust phrasing to be more Indian English
      .replace(/\bGreat question\b/gi, 'Very good question')
      .replace(/\bYou see\b/gi, 'Actually, you see')
      .replace(/\bOkay\b/gi, 'Acha, okay')
      
      // Add characteristic Indian English expressions
      .replace(/\bLet me tell you\b/gi, 'Let me tell you na')
      .replace(/\bKeep going\b/gi, 'Keep going, you are doing well')
      .replace(/\bbasically\b/gi, 'basically what happens is')
      
      // Pronunciation hints that work better with OpenAI voices
      .replace(/\bwould\b/gi, 'vould')
      .replace(/\bwas\b/gi, 'vas')
      .replace(/\bwere\b/gi, 'vere');

    return processedText;
  }
}

// Export singleton instance
export const clientTTSService = new ClientTTSService();
export default clientTTSService;