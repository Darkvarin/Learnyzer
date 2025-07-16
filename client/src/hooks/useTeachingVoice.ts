import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useVoice } from './useVoice';
import { clientTTSService } from '../services/tts-service';

interface TeachingVoiceRequest {
  topic?: string;
  userMessage?: string;
  aiResponse?: string;
  subject?: string;
  language?: string;
}

interface TeachingVoiceResponse {
  success: boolean;
  teachingExplanation: string;
  metadata: {
    exam: string;
    grade: string;
    subject: string;
  };
}

export function useTeachingVoice() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { speak, stopSpeaking, isSpeaking } = useVoice();

  const generateTeachingVoice = useMutation({
    mutationFn: async (data: TeachingVoiceRequest): Promise<TeachingVoiceResponse> => {
      const response = await apiRequest('POST', '/api/ai/teaching-voice', data);
      const jsonData = await response.json();
      return jsonData;
    }
  });

  const teachConcept = async (data: TeachingVoiceRequest, voiceSettings?: {
    voicePreference?: 'nova' | 'shimmer' | 'alloy'; // OpenAI female voices
    language?: 'english' | 'hindi';
  }) => {
    // If already speaking/teaching, stop it
    if (isSpeaking || isGenerating) {
      stopSpeaking();
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    try {
      // Add language preference to the API request
      const requestData = {
        ...data,
        language: voiceSettings?.language || 'english'
      };
      const result = await generateTeachingVoice.mutateAsync(requestData);
      // Speak the teaching explanation with OpenAI TTS
      if (result.teachingExplanation) {
        console.log('🎓 Teaching with OpenAI TTS for consistent quality');
        
        // Use OpenAI TTS directly for reliable voice quality
        const preferredVoice = voiceSettings?.voicePreference || 'nova'; // Default to Nova
        
        const success = await clientTTSService.speak(result.teachingExplanation, {
          voice: preferredVoice,
          language: voiceSettings?.language || 'english',
          gender: 'female',
          rate: 0.9
        });
        
        if (!success) {
          // Fallback to browser TTS if OpenAI fails
          speak(result.teachingExplanation, {
            rate: 0.95,
            voicePreference: preferredVoice,
            language: voiceSettings?.language || 'english'
          });
        }
      } else {
        console.error('No teaching explanation received!', result);
      }
    } catch (error) {
      console.error('Teaching voice error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const stopTeaching = () => {
    // Stop OpenAI TTS service
    clientTTSService.stop();
    
    // Also stop browser TTS as fallback
    stopSpeaking();
    setIsGenerating(false);
  };

  // Cleanup when hook is unmounted
  useEffect(() => {
    return () => {
      clientTTSService.stop();
      stopSpeaking();
      setIsGenerating(false);
    };
  }, []);

  return {
    teachConcept,
    stopTeaching,
    isGenerating: isGenerating || generateTeachingVoice.isPending,
    isTeaching: isSpeaking,
    error: generateTeachingVoice.error,
    lastResponse: generateTeachingVoice.data
  };
}