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
      
      // Send real-time notification about generated study notes
      if ((global as any).sendToUser) {
        (global as any).sendToUser((req.user as any).id, {
          type: 'ai_insight_generated',
          userId: (req.user as any).id,
          messageType: 'study_notes',
          message: `Study notes on "${topic}" have been generated!`,
          timestamp: new Date().toISOString()
        });
      }
      
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
      
      // Send real-time notification about answer evaluation
      if ((global as any).sendToUser) {
        (global as any).sendToUser((req.user as any).id, {
          type: 'ai_insight_generated',
          userId: (req.user as any).id,
          messageType: 'answer_check',
          message: `Your answer has been evaluated with a score of ${evaluation.score}/10`,
          timestamp: new Date().toISOString()
        });
      }
      
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
      
      // Send real-time notification about generated flashcards
      if ((global as any).sendToUser) {
        (global as any).sendToUser((req.user as any).id, {
          type: 'ai_insight_generated',
          userId: (req.user as any).id,
          messageType: 'flashcards',
          message: `${trimmedFlashcards.length} flashcards on "${topic}" have been generated!`,
          timestamp: new Date().toISOString()
        });
      }
      
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
   * Get performance analytics using AI
   */
  async getPerformanceAnalytics(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = parseInt(req.params.userId || (req.user as any).id.toString());
      const timeRange = req.query.timeRange as string || 'month';
      const subject = req.query.subject as string || 'all';
      
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
          recommendations: ["Start completing more activities to get personalized analytics."],
          subjectPerformance: {},
          timeSpent: [],
          skillDistribution: []
        });
      }
      
      // Build the prompt for AI insights with more detailed analytics
      const prompt = `
Analyze this student's performance data and provide comprehensive analytics:
        ${JSON.stringify(userPerformance)}
        
        Please provide:
        1. Their top 3 strengths with score percentages
        2. Areas they need to improve (up to 3) with score percentages
        3. Specific actionable recommendations for improvement (3-5 points)
        4. Time analysis showing study patterns over the ${timeRange} period
        5. Skill distribution across cognitive domains (Problem Solving, Memorization, Critical Thinking, Application)
        
        Format your response as JSON with these fields: 
        - strengths (array of {topic: string, score: number})
        - weaknesses (array of {topic: string, score: number})
        - recommendations (array of {id: number, title: string, description: string, category: string})
        - timeSpent (array of {date: string, hours: number})
        - skillDistribution (array of {name: string, value: number})
        
        Make the data realistic and personalized. For the timeSpent, create entries for each day in the past ${timeRange === 'week' ? '7' : timeRange === 'month' ? '30' : timeRange === 'quarter' ? '90' : '365'} days.
      `;
      
      // Get insights from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert educational data analyst who provides comprehensive, actionable analytics for students based on their performance data using visualizations and patterns." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });
      
      const responseContent = completion.choices[0].message.content;
      const analytics = JSON.parse(responseContent);
      
      // Combine AI analytics with the raw performance data
      const result = {
        ...analytics,
        subjectPerformance: userPerformance.subjectPerformance
      };
      
      // Increment user's AI sessions count
      await storage.incrementAISessionCount((req.user as any).id);
      
      // Send real-time notification about generated analytics
      if ((global as any).sendToUser) {
        (global as any).sendToUser(userId, {
          type: 'ai_insight_generated',
          userId,
          messageType: 'performance_analytics',
          message: 'Your performance analytics have been generated with detailed visualizations!',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Performance analytics error:", error);
      return res.status(500).json({ message: "Error generating performance analytics" });
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
  },

  /**
   * Generate an interactive diagram for entrance exam learning
   */
  async generateDiagram(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const diagramSchema = z.object({
        subject: z.string().min(1, "Subject is required"),
        topic: z.string().min(1, "Topic is required"),
        examType: z.string().optional()
      });
      
      const validatedData = diagramSchema.parse(req.body);
      const { subject, topic, examType } = validatedData;
      
      // Format the subject and topic for better AI understanding
      const formattedSubject = subject.replace(/_/g, ' ');
      const formattedExamType = examType || subject.split('_')[0];
      
      // Create a detailed prompt for the diagram
      const prompt = `
        Create an educational, interactive diagram to help students understand "${topic}" for the ${formattedExamType} entrance exam in ${formattedSubject}.
        
        The diagram should:
        1. Visually represent key concepts related to ${topic}
        2. Include important formulas, equations, or principles if applicable
        3. Use color-coding to highlight important elements
        4. Show relationships between different concepts
        5. Include brief text explanations for each component
        
        In addition, please provide 5 key points that students often struggle with when learning this topic.
        
        Format your response as JSON with these fields:
        - diagramUrl: A detailed textual description of what the diagram should show (will be converted to SVG)
        - keyPoints: Array of 5 important points that students often struggle with in this topic
      `;
      
      // Generate AI response 
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert entrance exam tutor who specializes in creating visual educational content for Indian competitive exams like JEE, NEET, UPSC, CLAT, and CUET." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });
      
      let diagramData;
      try {
        diagramData = JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        console.error("Error parsing AI response:", error);
        return res.status(500).json({ message: "Error generating diagram" });
      }
      
      // In production, we would convert the text description to an actual diagram
      // For now, we'll return a placeholder URL plus the description
      const diagramUrl = `/images/diagram-${formattedExamType.toLowerCase()}.svg`;
      
      // Increment user's AI sessions count
      await storage.incrementAISessionCount((req.user as any).id);
      
      // Send real-time notification about the generated diagram
      if ((global as any).sendToUser) {
        (global as any).sendToUser((req.user as any).id, {
          type: 'ai_insight_generated',
          userId: (req.user as any).id,
          messageType: 'interactive_diagram',
          message: `Interactive diagram for "${topic}" has been generated!`,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(200).json({
        diagramUrl: diagramUrl,
        keyPoints: diagramData.keyPoints || [],
        description: diagramData.diagramUrl
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error generating diagram:", error);
      return res.status(500).json({ message: "Error generating diagram content" });
    }
  }
};
