import type { Request, Response } from "express";
import { storage } from "../storage";
import OpenAI from "openai";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-api-key" // fallback for development
});

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: () => void) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export const aiService = {
  /**
   * Get the AI tutor assigned to the user
   */
  async getAITutor(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      const tutor = await storage.getAITutorForUser(userId);
      
      if (!tutor) {
        // If no tutor is assigned, get a default one
        const defaultTutor = await storage.getDefaultAITutor();
        return res.status(200).json(defaultTutor);
      }
      
      return res.status(200).json(tutor);
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving AI tutor" });
    }
  },
  
  /**
   * Get a response from the AI tutor
   */
  async getAITutorResponse(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const schema = z.object({
      message: z.string().min(1, "Message cannot be empty")
    });
    
    try {
      const { message } = schema.parse(req.body);
      const userId = (req.user as any).id;
      
      // Get the user's AI tutor
      const tutor = await storage.getAITutorForUser(userId);
      
      if (!tutor) {
        return res.status(404).json({ message: "AI tutor not found" });
      }
      
      // Get the user's conversation history
      const conversation = await storage.getRecentConversation(userId);
      
      // Build the prompt context
      let promptContext = `You are ${tutor.name}, ${tutor.specialty}. Your personality traits are ${tutor.personalityTraits}. `;
      promptContext += `You are helping a student named ${(req.user as any).name} who is on the ${(req.user as any).track} track. `;
      promptContext += "Provide educational guidance in a friendly, encouraging manner. Be concise and helpful. ";
      
      // Format previous messages for context if they exist
      const previousMessages = conversation 
        ? conversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        : [];
      
      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: promptContext },
          ...previousMessages,
          { role: "user", content: message }
        ],
        max_tokens: 500
      });
      
      const response = completion.choices[0].message.content;
      
      // Return the AI response
      return res.status(200).json({ response });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("AI tutor response error:", error);
      return res.status(500).json({ message: "Error generating AI response" });
    }
  },
  
  /**
   * Get the most recent conversation with AI tutor
   */
  async getRecentConversation(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      const conversation = await storage.getRecentConversation(userId);
      
      if (!conversation) {
        return res.status(200).json({ messages: [] });
      }
      
      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving conversation" });
    }
  },
  
  /**
   * Save a message to the conversation history
   */
  async saveConversation(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const schema = z.object({
      message: z.string().min(1, "Message cannot be empty")
    });
    
    try {
      const { message } = schema.parse(req.body);
      const userId = (req.user as any).id;
      
      // Get the user's AI tutor
      const tutor = await storage.getAITutorForUser(userId);
      
      if (!tutor) {
        return res.status(404).json({ message: "AI tutor not found" });
      }
      
      // Get the user's conversation
      let conversation = await storage.getRecentConversation(userId);
      
      // Create a new conversation if none exists
      if (!conversation) {
        conversation = {
          userId,
          aiTutorId: tutor.id,
          messages: []
        };
      }
      
      // Add the user message
      conversation.messages.push({
        role: "user",
        content: message,
        timestamp: new Date()
      });
      
      // Get AI response
      const promptContext = `You are ${tutor.name}, ${tutor.specialty}. Your personality traits are ${tutor.personalityTraits}. `;
      const previousMessages = conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: promptContext },
          ...previousMessages
        ],
        max_tokens: 500
      });
      
      const aiResponse = completion.choices[0].message.content;
      
      // Add the AI response
      conversation.messages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      });
      
      // Save the conversation
      await storage.saveConversation(conversation);
      
      return res.status(200).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Save conversation error:", error);
      return res.status(500).json({ message: "Error saving conversation" });
    }
  },
  
  /**
   * Get all available AI tools
   */
  async getAITools(req: Request, res: Response) {
    try {
      const tools = await storage.getAllAITools();
      return res.status(200).json(tools);
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving AI tools" });
    }
  },
  
  /**
   * Get a specific AI tool by ID
   */
  async getAITool(req: Request, res: Response) {
    try {
      const toolId = Number(req.params.id);
      
      if (isNaN(toolId)) {
        return res.status(400).json({ message: "Invalid tool ID" });
      }
      
      const tool = await storage.getAIToolById(toolId);
      
      if (!tool) {
        return res.status(404).json({ message: "AI tool not found" });
      }
      
      return res.status(200).json(tool);
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving AI tool" });
    }
  },
  
  /**
   * Generate study notes using AI
   */
  async generateStudyNotes(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const schema = z.object({
      topic: z.string().min(2, "Topic must be at least 2 characters"),
      preferences: z.object({
        style: z.string().optional(),
        length: z.string().optional(),
        includeExamples: z.boolean().optional(),
        focusAreas: z.array(z.string()).optional()
      })
    });
    
    try {
      const { topic, preferences } = schema.parse(req.body);
      
      // Build the prompt
      let prompt = `Generate comprehensive study notes on "${topic}". `;
      
      if (preferences.style) {
        prompt += `Use a ${preferences.style} style. `;
      }
      
      if (preferences.length) {
        prompt += `Make the notes ${preferences.length}. `;
      }
      
      if (preferences.includeExamples) {
        prompt += "Include practical examples and illustrations. ";
      }
      
      if (preferences.focusAreas && preferences.focusAreas.length > 0) {
        prompt += `Focus especially on: ${preferences.focusAreas.join(", ")}. `;
      }
      
      prompt += "Format the notes in a structured, easy-to-understand manner with clear headings and bullet points where appropriate. Target Indian students preparing for exams.";
      
      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert educational content creator specializing in creating high-quality study notes for Indian students." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500
      });
      
      const notes = completion.choices[0].message.content;
      
      // Increment user's AI sessions count
      await storage.incrementAISessionCount((req.user as any).id);
      
      return res.status(200).json({ notes });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Study notes generation error:", error);
      return res.status(500).json({ message: "Error generating study notes" });
    }
  },
  
  /**
   * Check an answer using AI
   */
  async checkAnswer(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const schema = z.object({
      question: z.string().min(1, "Question cannot be empty"),
      answer: z.string().min(1, "Answer cannot be empty"),
      subject: z.string().min(1, "Subject cannot be empty")
    });
    
    try {
      const { question, answer, subject } = schema.parse(req.body);
      
      // Build the prompt
      const prompt = `
        Question: ${question}
        Student's Answer: ${answer}
        Subject: ${subject}
        
        Evaluate the student's answer and provide:
        1. A score out of 10
        2. Detailed feedback on the accuracy and completeness
        3. The correct answer (if the student's answer is incorrect)
        4. Specific improvements the student can make
        
        Format your response as JSON with the fields: score, feedback, correctAnswer (if needed), and improvements (as an array).
      `;
      
      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert educational evaluator who provides detailed, constructive feedback on student answers. Your feedback should be specific, actionable, and encouraging for Indian students preparing for competitive exams." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });
      
      const responseContent = completion.choices[0].message.content;
      const evaluation = JSON.parse(responseContent);
      
      // Normalize the score to be between 0 and 10
      evaluation.score = Math.min(10, Math.max(0, evaluation.score));
      
      // Increment user's AI sessions count
      await storage.incrementAISessionCount((req.user as any).id);
      
      return res.status(200).json(evaluation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Answer checking error:", error);
      return res.status(500).json({ message: "Error checking answer" });
    }
  },
  
  /**
   * Generate flashcards using AI
   */
  async generateFlashcards(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const schema = z.object({
      topic: z.string().min(2, "Topic must be at least 2 characters"),
      count: z.number().min(1).max(20).default(10)
    });
    
    try {
      const { topic, count } = schema.parse(req.body);
      
      // Build the prompt
      const prompt = `
        Generate ${count} high-quality flashcards for studying "${topic}". 
        Each flashcard should have a concise question on the front and a clear, accurate answer on the back.
        Format your response as a JSON array of objects, each with "question" and "answer" fields.
      `;
      
      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert in creating effective educational flashcards for Indian students preparing for exams. Focus on key concepts, formulas, dates, and definitions." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });
      
      const responseContent = completion.choices[0].message.content;
      const flashcardsObj = JSON.parse(responseContent);
      
      const flashcards = flashcardsObj.flashcards || [];
      
      // Ensure we have the requested number of flashcards (up to what was generated)
      const trimmedFlashcards = flashcards.slice(0, count);
      
      // Increment user's AI sessions count
      await storage.incrementAISessionCount((req.user as any).id);
      
      return res.status(200).json({ flashcards: trimmedFlashcards });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Flashcard generation error:", error);
      return res.status(500).json({ message: "Error generating flashcards" });
    }
  },
  
  /**
   * Get performance insights using AI
   */
  async getPerformanceInsights(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if the user is requesting their own data or if they're an admin
      if (userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized to access this data" });
      }
      
      // Get the user's performance data
      const userPerformance = await storage.getUserPerformanceData(userId);
      
      if (!userPerformance || Object.keys(userPerformance.subjectPerformance).length === 0) {
        return res.status(200).json({
          strengths: [],
          weaknesses: [],
          recommendations: ["Start completing more activities to get personalized insights."],
          subjectPerformance: {}
        });
      }
      
      // Build the prompt for AI insights
      const prompt = `
        Analyze this student's performance data and provide personalized insights:
        ${JSON.stringify(userPerformance)}
        
        Please identify:
        1. Their top 3 strengths
        2. Areas they need to improve (up to 3)
        3. Specific recommendations for improvement (3-5 points)
        
        Format your response as JSON with the fields: strengths (array), weaknesses (array), and recommendations (array).
      `;
      
      // Get insights from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert educational analyst who provides personalized, actionable insights for students based on their performance data." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });
      
      const responseContent = completion.choices[0].message.content;
      const insights = JSON.parse(responseContent);
      
      // Combine AI insights with the raw performance data
      const result = {
        ...insights,
        subjectPerformance: userPerformance.subjectPerformance
      };
      
      // Increment user's AI sessions count
      await storage.incrementAISessionCount((req.user as any).id);
      
      // Send real-time notification about generated insights
      if ((global as any).sendToUser) {
        (global as any).sendToUser(userId, {
          type: 'ai_insight_generated',
          userId: userId,
          messageType: 'performance_insights',
          message: 'New performance insights are available with personalized recommendations!',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Performance insights error:", error);
      return res.status(500).json({ message: "Error getting performance insights" });
    }
  },
  
  /**
   * Judge a battle using AI
   */
  async judgeBattle(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const battleId = parseInt(req.params.battleId);
      
      if (isNaN(battleId)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }
      
      // Get the battle
      const battle = await storage.getBattleById(battleId);
      
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      // Check if the battle is ready to be judged
      if (battle.status !== "completed") {
        return res.status(400).json({ message: "Battle is not ready to be judged" });
      }
      
      // Get all participant submissions
      const participants = await storage.getBattleParticipants(battleId);
      
      if (!participants || participants.length === 0) {
        return res.status(400).json({ message: "No participants in this battle" });
      }
      
      // Build the prompt for AI judging
      const prompt = `
        Judge this academic competition between students. The battle topic was: "${battle.title}" covering ${battle.topics.join(", ")}.
        
        Participants' submissions:
        ${JSON.stringify(participants.map(p => ({
          id: p.userId,
          name: p.username,
          submission: p.submission
        })))}
        
        Please evaluate each submission based on:
        1. Accuracy of content
        2. Depth of understanding
        3. Clarity of explanation
        4. Proper use of concepts
        
        Provide a score out of 100 for each participant and specific feedback on their performance.
        Determine the winner based on the highest score.
        
        Format your response as JSON with the fields: 
        - winnerId (the user ID of the winner)
        - scores (object mapping user IDs to their scores)
        - feedback (object mapping user IDs to feedback strings)
      `;
      
      // Get judging from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert academic judge who evaluates educational competitions fairly and provides constructive feedback." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });
      
      const responseContent = completion.choices[0].message.content;
      const judgement = JSON.parse(responseContent);
      
      // Update battle with results
      await storage.updateBattleResults(battleId, judgement);
      
      // Award XP to the winner and participants - reduced for more challenge
      const winnerXp = Math.floor(battle.rewardPoints * 0.7); // Reduced rewards for more challenge
      const participantXp = Math.floor(battle.rewardPoints * 0.1); // 10% of reward points for participation
      
      await storage.awardBattleXP(battleId, judgement.winnerId, winnerXp, participantXp);
      
      return res.status(200).json(judgement);
    } catch (error) {
      console.error("Battle judging error:", error);
      return res.status(500).json({ message: "Error judging battle" });
    }
  }
};
