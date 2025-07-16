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
   * Generate speech using ttsMP3 free service with Indian accent
   */
  async generateWithTTSMP3(text: string, options: FreeTTSOptions = {}): Promise<TTSMp3Response> {
    try {
      const { language = 'english', speed = 0.8 } = options;
      
      // Preprocess text for Indian accent
      const processedText = this.preprocessForIndianAccent(text, language);
      
      // Use Indian English voice from ttsMP3
      const response = await fetch('https://ttsmp3.com/makemp3_new.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: new URLSearchParams({
          'msg': processedText,
          'lang': 'Raveena', // Indian English female voice
          'source': 'ttsmp3'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as any;
      
      if (result.Error === 0 && result.URL) {
        return {
          success: true,
          audioUrl: result.URL
        };
      } else {
        throw new Error(result.Text || 'Unknown error from ttsMP3');
      }
      
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
      
      // Preprocess text for Indian accent
      const processedText = this.preprocessForIndianAccent(text, language);
      
      // Use Hindi Female voice for Indian accent
      const voiceName = language === 'hindi' ? 'Hindi Female' : 'Indian English Female';
      
      const audioUrl = `https://responsivevoice.org/responsivevoice/getvoice.php?t=${encodeURIComponent(processedText)}&tl=${voiceName}&sv=&vn=&pitch=1&rate=${speed}&vol=1&gender=female`;
      
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
   * Main method that tries multiple free services with Indian accent
   */
  async generateSpeech(text: string, options: FreeTTSOptions = {}): Promise<TTSMp3Response> {
    console.log('🆓 Attempting free Indian accent TTS generation...');
    
    // Try ttsMP3 first (most reliable for Indian accent)
    let result = await this.generateWithTTSMP3(text, options);
    if (result.success) {
      console.log('✅ Generated with ttsMP3 Indian voice');
      return result;
    }
    
    console.log('⚠️ ttsMP3 failed, trying ResponsiveVoice...');
    
    // Try ResponsiveVoice as backup
    result = await this.generateWithResponsiveVoice(text, options);
    if (result.success) {
      console.log('✅ Generated with ResponsiveVoice Indian accent');
      return result;
    }
    
    console.log('⚠️ ResponsiveVoice failed, trying SpeechT5...');
    
    // Try SpeechT5 as final backup
    result = await this.generateWithSpeechT5(text, options);
    if (result.success) {
      console.log('✅ Generated with SpeechT5');
      return result;
    }
    
    console.log('❌ All free TTS services failed');
    return {
      success: false,
      error: 'All free TTS services are currently unavailable'
    };
  }

  /**
   * Process text to enhance Indian accent characteristics
   */
  private preprocessForIndianAccent(text: string, language: 'english' | 'hindi'): string {
    if (language === 'hindi') {
      return text; // Keep Hindi text as is
    }

    // Enhanced Indian English preprocessing
    let processedText = text
      // Add natural Indian expressions
      .replace(/\bHello\b/gi, 'Namaste')
      .replace(/\bvery good\b/gi, 'bahut accha')
      .replace(/\bexcellent\b/gi, 'excellent hai')
      .replace(/\bunderstand\b/gi, 'samajh')
      .replace(/\bbasically\b/gi, 'basically yaar')
      
      // Indian English phrasing
      .replace(/\bGreat question\b/gi, 'Acha question')
      .replace(/\bYou see\b/gi, 'Dekho, you see')
      .replace(/\bOkay\b/gi, 'Acha, okay')
      .replace(/\bLet me tell you\b/gi, 'Let me tell you na')
      
      // Pronunciation adjustments for clearer Indian accent
      .replace(/\bwould\b/gi, 'vould')
      .replace(/\bwas\b/gi, 'vas')
      .replace(/\bwere\b/gi, 'vere')
      .replace(/\bthree\b/gi, 'tree')
      .replace(/\bthirty\b/gi, 'tirty')
      
      // Add emphasis markers for better pronunciation
      .replace(/important/gi, 'very important')
      .replace(/concept/gi, 'main concept')
      .replace(/\b(\w+)ing\b/gi, '$1-ing') // Add slight pause before -ing
      
      // Add natural Indian filler words
      .replace(/\. /g, ', you know. ')
      .replace(/However,/gi, 'But actually,')
      .replace(/Therefore,/gi, 'So basically,');

    return processedText;
  }
}

export const freeTTSService = new FreeTTSService();