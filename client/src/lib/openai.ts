import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Generates AI tutoring response based on user message
 * @param message User message to the AI tutor
 * @returns Promise with the AI response
 */
export async function getAITutorResponse(message: string): Promise<{ response: string }> {
  try {
    const response = await apiRequest("POST", "/api/ai/tutor/respond", { message });
    return response.json();
  } catch (error) {
    console.error("Error getting AI tutor response:", error);
    throw error;
  }
}

/**
 * Generates custom study notes based on topic and user preferences
 * @param topic The topic to generate notes for
 * @param preferences User preferences for note style, length, etc.
 * @returns Promise with the generated notes
 */
export async function generateStudyNotes(topic: string, preferences: {
  style: string;
  length: string;
  includeExamples: boolean;
  focusAreas?: string[];
}): Promise<{ notes: string }> {
  try {
    const response = await apiRequest("POST", "/api/ai/tools/notes", { 
      topic, 
      preferences 
    });
    return response.json();
  } catch (error) {
    console.error("Error generating study notes:", error);
    throw error;
  }
}

/**
 * Checks user answers and provides feedback
 * @param question The question that was answered
 * @param answer User's answer
 * @param subject Subject area (e.g., "Physics", "Mathematics")
 * @returns Promise with evaluation and feedback
 */
export async function checkAnswer(
  question: string, 
  answer: string, 
  subject: string
): Promise<{ 
  score: number; 
  feedback: string; 
  correctAnswer?: string; 
  improvements?: string[];
}> {
  try {
    const response = await apiRequest("POST", "/api/ai/tools/answer-check", { 
      question, 
      answer, 
      subject 
    });
    return response.json();
  } catch (error) {
    console.error("Error checking answer:", error);
    throw error;
  }
}

/**
 * Generates flashcards for a given topic
 * @param topic The topic to create flashcards for
 * @param count Number of flashcards to generate
 * @returns Promise with generated flashcards
 */
export async function generateFlashcards(
  topic: string, 
  count: number = 10
): Promise<{ 
  flashcards: Array<{ question: string; answer: string }> 
}> {
  try {
    const response = await apiRequest("POST", "/api/ai/tools/flashcards", { 
      topic, 
      count 
    });
    return response.json();
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
}

/**
 * Analyzes user performance and provides insights
 * @param userId User identifier
 * @returns Promise with performance insights
 */
export async function getPerformanceInsights(
  userId: number
): Promise<{ 
  strengths: string[]; 
  weaknesses: string[]; 
  recommendations: string[];
  subjectPerformance: Record<string, { score: number; total: number }>;
}> {
  try {
    const response = await apiRequest("GET", `/api/ai/tools/insights/${userId}`);
    return response.json();
  } catch (error) {
    console.error("Error getting performance insights:", error);
    throw error;
  }
}

/**
 * Judges a battle between users
 * @param battleId Battle identifier
 * @returns Promise with battle results and feedback
 */
export async function judgeBattle(
  battleId: number
): Promise<{
  winnerId: number;
  scores: Record<number, number>;
  feedback: Record<number, string>;
}> {
  try {
    const response = await apiRequest("POST", `/api/ai/battle/judge/${battleId}`);
    return response.json();
  } catch (error) {
    console.error("Error judging battle:", error);
    throw error;
  }
}
