import OpenAI from 'openai';

// Initialize OpenAI client for TTS
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class TTSService {
  /**
   * Generate speech audio using OpenAI TTS API with Indian accent voices
   */
  static async generateSpeech(text: string, options: {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    model?: 'tts-1' | 'tts-1-hd';
    speed?: number;
  } = {}) {
    try {
      const {
        voice = 'nova', // Nova has a pleasant female voice
        model = 'tts-1', // Standard quality for faster response
        speed = 0.9 // Slightly slower for clarity
      } = options;

      console.log(`🎤 Generating speech with OpenAI TTS: ${voice}, model: ${model}, speed: ${speed}`);

      const mp3 = await openai.audio.speech.create({
        model: model,
        voice: voice,
        input: text,
        speed: speed,
      });

      // Convert response to buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      console.log(`✅ Generated ${buffer.length} bytes of audio`);
      
      return {
        success: true,
        audio: buffer,
        mimeType: 'audio/mpeg',
        voice: voice,
        model: model
      };

    } catch (error) {
      console.error('TTS generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get recommended voice based on content language and user preference
   */
  static getRecommendedVoice(language: 'english' | 'hindi' = 'english', gender: 'female' | 'male' = 'female') {
    // OpenAI TTS voices - all are high quality
    const femaleVoices = ['nova', 'shimmer', 'alloy']; // Nova is most natural for Indian content
    const maleVoices = ['echo', 'fable', 'onyx'];
    
    if (gender === 'female') {
      return femaleVoices[0]; // Nova - most natural and clear
    } else {
      return maleVoices[0]; // Echo - clear male voice
    }
  }

  /**
   * Generate base64 encoded audio for direct frontend playback
   */
  static async generateSpeechBase64(text: string, options = {}) {
    const result = await this.generateSpeech(text, options);
    
    if (result.success && result.audio) {
      return {
        success: true,
        audioBase64: result.audio.toString('base64'),
        mimeType: result.mimeType,
        voice: result.voice
      };
    }
    
    return result;
  }
}

export const ttsService = TTSService;