import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useVoice } from './useVoice';

interface TeachingVoiceRequest {
  topic?: string;
  userMessage?: string;
  aiResponse?: string;
  subject?: string;
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
      return apiRequest('POST', '/api/ai/teaching-voice', data);
    },
    onSuccess: (response) => {
      console.log('Teaching voice response:', response);
      // Note: Speech is now handled in teachConcept function with user voice settings
    },
    onError: (error) => {
      console.error('Error generating teaching voice:', error);
    }
  });

  const teachConcept = async (data: TeachingVoiceRequest, voiceSettings?: {
    voicePreference?: 'neerja' | 'prabhat' | 'auto';
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
      const result = await generateTeachingVoice.mutateAsync(data);
      // Speak the teaching explanation with user voice settings
      if (result.teachingExplanation) {
        console.log('Teaching voice will speak:', result.teachingExplanation.substring(0, 100) + '...');
        console.log('Voice settings:', voiceSettings);
        
        // Try immediate speech first (works better after user interaction)
        speak(result.teachingExplanation, {
          rate: 1.1,
          voicePreference: voiceSettings?.voicePreference || 'auto',
          language: voiceSettings?.language || 'english'
        });
      }
    } catch (error) {
      console.error('Teaching voice error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const stopTeaching = () => {
    stopSpeaking();
    setIsGenerating(false);
  };

  // Cleanup when hook is unmounted
  useEffect(() => {
    return () => {
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