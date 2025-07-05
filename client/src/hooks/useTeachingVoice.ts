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
      if (response.teachingExplanation) {
        // Automatically speak the teaching explanation
        speak(response.teachingExplanation, { rate: 0.9 });
      }
    },
    onError: (error) => {
      console.error('Error generating teaching voice:', error);
    }
  });

  const teachConcept = async (data: TeachingVoiceRequest) => {
    setIsGenerating(true);
    try {
      await generateTeachingVoice.mutateAsync(data);
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