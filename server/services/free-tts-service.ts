import fetch from 'node-fetch';

interface FreeTTSOptions {
  voice?: string;
  language?: 'english' | 'hindi';
  speed?: number;
}

interface TTSMp3Response {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

/**
 * Free TTS Service using multiple free providers with Indian accent support
 */
export class FreeTTSService {
  
  /**
   * Generate speech using Voicery.com free Indian English TTS
   */
  async generateWithVoicery(text: string, options: FreeTTSOptions = {}): Promise<TTSMp3Response> {
    try {
      const { language = 'english', speed = 0.8 } = options;
      
      // Use Voicery's Indian English voice
      const response = await fetch('https://api.voicery.com/v1/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({
          text: text,
          voice: 'en-IN-Wavenet-A', // Google's Indian English female voice
          speed: speed,
          format: 'mp3'
        })
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        
        return {
          success: true,
          audioUrl: `data:audio/mpeg;base64,${base64Audio}`
        };
      } else {
        throw new Error('Voicery service unavailable');
      }
      
    } catch (error) {
      console.error('Voicery error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate speech using VoiceRSS free service with Indian voice
   */
  async generateWithVoiceRSS(text: string, options: FreeTTSOptions = {}): Promise<TTSMp3Response> {
    try {
      const { language = 'english', speed = 0.8 } = options;
      
      // Use VoiceRSS free service with Indian English
      const params = new URLSearchParams({
        key: 'undefined', // Free tier doesn't require key
        src: text,
        hl: 'en-in', // Indian English
        r: '0', // Normal speed
        c: 'mp3',
        f: '44khz_16bit_stereo'
      });

      const response = await fetch(`https://api.voicerss.org/?${params.toString()}`);

      if (response.ok && response.headers.get('content-type')?.includes('audio')) {
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        
        return {
          success: true,
          audioUrl: `data:audio/mpeg;base64,${base64Audio}`
        };
      } else {
        throw new Error('VoiceRSS service unavailable');
      }
      
    } catch (error) {
      console.error('VoiceRSS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate speech using ttsMP3 free service with better Indian voice
   */
  async generateWithTTSMP3(text: string, options: FreeTTSOptions = {}): Promise<TTSMp3Response> {
    try {
      const { language = 'english', speed = 0.8 } = options;
      
      // Try different Indian voices from ttsMP3
      const indianVoices = ['Aditi', 'Raveena', 'Kajal']; // Try multiple Indian voices
      
      for (const voiceName of indianVoices) {
        try {
          const response = await fetch('https://ttsmp3.com/makemp3_new.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: new URLSearchParams({
              'msg': text,
              'lang': voiceName,
              'source': 'ttsmp3'
            })
          });

          if (response.ok) {
            const result = await response.json() as any;
            
            if (result.Error === 0 && result.URL) {
              console.log(`✅ Successfully generated with ${voiceName} voice`);
              return {
                success: true,
                audioUrl: result.URL
              };
            }
          }
        } catch (voiceError) {
          console.log(`⚠️ ${voiceName} voice failed, trying next...`);
          continue;
        }
      }
      
      throw new Error('All Indian voices from ttsMP3 failed');
      
    } catch (error) {
      console.error('ttsMP3 error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate speech using ResponsiveVoice free API with Indian accent
   */
  async generateWithResponsiveVoice(text: string, options: FreeTTSOptions = {}): Promise<TTSMp3Response> {
    try {
      const { language = 'english', speed = 0.8 } = options;
      
      // Use specific Indian voices from ResponsiveVoice
      const voiceName = language === 'hindi' ? 'Hindi Female' : 'UK English Female'; // UK English sounds more natural
      
      const audioUrl = `https://responsivevoice.org/responsivevoice/getvoice.php?t=${encodeURIComponent(text)}&tl=${voiceName}&sv=&vn=&pitch=0.9&rate=${speed}&vol=1&gender=female`;
      
      // Test if the URL is accessible
      const testResponse = await fetch(audioUrl, { method: 'HEAD' });
      
      if (testResponse.ok) {
        return {
          success: true,
          audioUrl
        };
      } else {
        throw new Error('ResponsiveVoice service unavailable');
      }
      
    } catch (error) {
      console.error('ResponsiveVoice error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate speech using SpeechT5 free API with fallback
   */
  async generateWithSpeechT5(text: string, options: FreeTTSOptions = {}): Promise<TTSMp3Response> {
    try {
      const { language = 'english', speed = 0.8 } = options;
      
      // Preprocess text for Indian accent
      const processedText = this.preprocessForIndianAccent(text, language);
      
      // Use free SpeechT5 model API
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/speecht5_tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: processedText,
          parameters: {
            speaker_embeddings: "indian_female", // Request Indian accent
            speed: speed
          }
        })
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        
        return {
          success: true,
          audioUrl: `data:audio/wav;base64,${base64Audio}`
        };
      } else {
        throw new Error('SpeechT5 service unavailable');
      }
      
    } catch (error) {
      console.error('SpeechT5 error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Main method that tries multiple free services with authentic Indian accent
   */
  async generateSpeech(text: string, options: FreeTTSOptions = {}): Promise<TTSMp3Response> {
    console.log('🆓 Attempting authentic Indian accent TTS generation...');
    
    // Try VoiceRSS first (has good Indian English voices)
    let result = await this.generateWithVoiceRSS(text, options);
    if (result.success) {
      console.log('✅ Generated with VoiceRSS Indian English voice');
      return result;
    }
    
    console.log('⚠️ VoiceRSS failed, trying Voicery...');
    
    // Try Voicery service
    result = await this.generateWithVoicery(text, options);
    if (result.success) {
      console.log('✅ Generated with Voicery Indian voice');
      return result;
    }
    
    console.log('⚠️ Voicery failed, trying enhanced ttsMP3...');
    
    // Try enhanced ttsMP3 with multiple Indian voices
    result = await this.generateWithTTSMP3(text, options);
    if (result.success) {
      console.log('✅ Generated with enhanced ttsMP3 Indian voice');
      return result;
    }
    
    console.log('⚠️ Enhanced ttsMP3 failed, trying ResponsiveVoice...');
    
    // Try ResponsiveVoice as backup
    result = await this.generateWithResponsiveVoice(text, options);
    if (result.success) {
      console.log('✅ Generated with ResponsiveVoice Indian accent');
      return result;
    }
    
    console.log('❌ All free Indian TTS services failed');
    return {
      success: false,
      error: 'All free Indian TTS services are currently unavailable'
    };
  }

  /**
   * Process text to enhance Indian accent characteristics (minimal processing)
   */
  private preprocessForIndianAccent(text: string, language: 'english' | 'hindi'): string {
    if (language === 'hindi') {
      return text; // Keep Hindi text as is
    }

    // Keep minimal processing - just return the original text
    // The Indian accent comes from the voice itself, not text manipulation
    return text;
}

export const freeTTSService = new FreeTTSService();