import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useVoice } from './useVoice';

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
      console.log('Sending teaching voice request:', data);
      const response = await apiRequest('POST', '/api/ai/teaching-voice', data);
      console.log('Raw API response object:', response);
      const jsonData = await response.json();
      console.log('Parsed JSON data:', jsonData);
      return jsonData;
    },
    onSuccess: (response) => {
      console.log('Teaching voice response:', response);
      console.log('Teaching explanation text:', response.teachingExplanation);
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
      // Add language preference to the API request
      const requestData = {
        ...data,
        language: voiceSettings?.language || 'english'
      };
      const result = await generateTeachingVoice.mutateAsync(requestData);
      // Speak the teaching explanation with user voice settings
      if (result.teachingExplanation) {
        console.log('Teaching voice will speak:', result.teachingExplanation.substring(0, 100) + '...');
        console.log('Voice settings:', voiceSettings);
        console.log('Full teaching explanation length:', result.teachingExplanation.length);
        
        // Try immediate speech first (works better after user interaction)
        speak(result.teachingExplanation, {
          rate: 0.95, // Adjusted rate for better comprehension
          voicePreference: 'neerja', // Always use female voice
          language: voiceSettings?.language || 'english'
        });
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