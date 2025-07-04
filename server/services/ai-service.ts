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
   * Get a response from the AI tutor with enhanced GPT-4o capabilities
   */
  async getAITutorResponse(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const schema = z.object({
      message: z.string().min(1, "Message cannot be empty"),
      subject: z.string().optional(),
      includeVisuals: z.boolean().optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional()
    });
    
    try {
      const { message, subject, includeVisuals, difficulty } = schema.parse(req.body);
      const userId = (req.user as any).id;
      
      // Get user data and AI tutor
      const [tutor, user] = await Promise.all([
        storage.getAITutorForUser(userId),
        storage.getUserById(userId)
      ]);
      
      if (!tutor) {
        return res.status(404).json({ message: "AI tutor not found" });
      }
      
      // Get conversation history for context
      const conversation = await storage.getRecentConversation(userId);
      
      // Enhanced system prompt for topic-focused, immersive experience
      const systemPrompt = `You are ${tutor.name}, an expert AI tutor specializing in ${tutor.specialty} for Indian competitive exams (JEE, NEET, UPSC, CLAT, CUET, CSE).

Student Profile:
- Name: ${user?.name}
- Grade: ${user?.grade || 'Competitive Exam Level'}
- Level: ${user?.level || 1}
- Track: ${user?.track || 'General'}
- Current XP: ${user?.currentXp || 0}

CRITICAL INSTRUCTIONS - Topic Focus:
1. ALWAYS stay directly relevant to the student's question/topic
2. Provide SPECIFIC, exam-relevant information
3. Include concrete examples, formulas, and facts
4. Avoid generic study advice unless specifically asked
5. Connect every response to actual exam patterns and question types

Your Enhanced Teaching Approach:
- Give precise, step-by-step explanations with Indian educational context
- Use NCERT references and competitive exam examples
- Adapt complexity to student level: ${difficulty || 'intermediate'}
- Provide specific formulas, theorems, or key facts
- Suggest exact visual aids (diagrams, charts, graphs) when helpful
- Include memory techniques and mnemonics for the specific topic
- Reference how this exact topic appears in ${subject || 'competitive'} exams
- Ask focused follow-up questions to test understanding

Personality: ${tutor.personalityTraits}
Current Subject Focus: ${subject || 'Cross-subject consultation'}

REMEMBER: Every response must be directly tied to the student's specific query. Provide actionable, exam-focused content that helps them master the exact topic they're asking about.`;

      // Format conversation history
      const previousMessages = conversation 
        ? conversation.messages.slice(-6).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        : [];
      
      // Generate enhanced AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...previousMessages,
          { role: "user", content: message }
        ],
        max_tokens: 1500,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });
      
      const aiResponse = completion.choices[0].message.content;
      
      // Check if visual content would be helpful
      const needsVisuals = includeVisuals || 
        /diagram|chart|graph|visual|illustration|draw|image|picture|flowchart|concept map|structure|formula|equation/i.test(aiResponse || '');
      
      let visualSuggestions = null;
      if (needsVisuals) {
        visualSuggestions = await this.generateVisualSuggestions(message, subject || '', aiResponse || '');
      }
      
      // Save enhanced conversation
      await storage.saveConversation({
        userId,
        tutorId: tutor.id,
        messages: [
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: aiResponse || '', timestamp: new Date() }
        ],
        subject: subject || 'General',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Update achievements
      await storage.incrementAISessionCount(userId);
      
      return res.status(200).json({ 
        response: aiResponse,
        tutor: {
          name: tutor.name,
          specialty: tutor.specialty,
          avatar: tutor.avatar
        },
        visualSuggestions,
        personalized: true,
        studentLevel: user?.level || 1,
        subject: subject || 'General'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Enhanced AI tutor response error:", error);
      return res.status(500).json({ message: "Error generating AI response" });
    }
  },

  /**
   * Generate visual content suggestions using GPT-4o analysis
   */
  async generateVisualSuggestions(userMessage: string, subject: string, aiResponse: string) {
    try {
      const visualPrompt = `Analyze this educational interaction and suggest specific visual aids that would enhance understanding:

Subject: ${subject}
Student Question: ${userMessage}
AI Response: ${aiResponse}

Provide a JSON response with practical visual suggestions:
{
  "diagrams": ["specific diagram descriptions that would help visualize concepts"],
  "illustrations": ["educational illustrations that would clarify complex ideas"],
  "charts": ["types of charts/graphs that would organize information better"],
  "conceptMaps": ["concept mapping suggestions for connecting ideas"],
  "generateImage": true/false,
  "imagePrompt": "specific DALL-E prompt if an image would be most helpful"
}

Focus on visuals that directly support Indian competitive exam preparation.`;

      const visualResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: visualPrompt }],
        max_tokens: 600,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      return JSON.parse(visualResponse.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Visual suggestions generation error:', error);
      return null;
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
      
      // Get AI response with enhanced topic focus
      const promptContext = `You are ${tutor.name}, an expert ${tutor.specialty} tutor for Indian competitive exams.

Personality: ${tutor.personalityTraits}

CRITICAL INSTRUCTIONS:
1. Stay focused on the student's specific question/topic
2. Provide exam-relevant, factual information
3. Include specific formulas, concepts, or facts when applicable
4. Use Indian educational context and references
5. Give precise, actionable answers that help with exam preparation

Avoid generic responses. Focus on the exact topic the student is asking about.`;
      
      const previousMessages = Array.isArray(conversation.messages) 
        ? conversation.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        : [];
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: promptContext },
          ...previousMessages
        ],
        max_tokens: 800,
        temperature: 0.3 // Lower temperature for more focused responses
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
      subject: z.string().optional(),
      examType: z.string().optional(),
      preferences: z.object({
        style: z.string().optional(),
        length: z.string().optional(),
        includeExamples: z.boolean().optional(),
        focusAreas: z.array(z.string()).optional()
      })
    });
    
    try {
      const { topic, subject, examType, preferences } = schema.parse(req.body);
      const userId = (req.user as any).id;
      const user = await storage.getUserById(userId);
      
      // Build a comprehensive, topic-focused prompt
      const systemPrompt = `You are an expert Indian competitive exam tutor specializing in creating highly focused, exam-relevant study notes. Your expertise spans JEE, NEET, UPSC, CLAT, CUET, and CSE preparation.

Key Requirements:
1. Stay STRICTLY focused on the given topic
2. Provide exam-relevant content only
3. Include specific formulas, concepts, and facts
4. Use Indian educational context and examples
5. Structure content for optimal retention and understanding`;

      let userPrompt = `Create comprehensive study notes specifically focused on "${topic}"`;
      
      if (subject) {
        userPrompt += ` in ${subject}`;
      }
      
      if (examType) {
        userPrompt += ` for ${examType} exam preparation`;
      }
      
      userPrompt += `.\n\nStudent Profile:
- Grade/Level: ${user?.grade || 'Competitive Exam Level'}
- Track: ${user?.track || 'General'}
- Current Level: ${user?.level || 1}

MANDATORY Structure:
1. **Topic Overview** (2-3 lines defining the exact topic)
2. **Key Concepts** (Core principles directly related to ${topic})
3. **Important Formulas/Facts** (Specific to ${topic} only)
4. **Exam-Specific Points** (How ${topic} appears in questions)
5. **Memory Techniques** (Mnemonics for ${topic})
6. **Common Mistakes** (Errors students make with ${topic})
7. **Practice Strategy** (How to master ${topic})

`;
      
      if (preferences.style) {
        userPrompt += `Style: ${preferences.style}\n`;
      }
      
      if (preferences.length) {
        userPrompt += `Length: ${preferences.length}\n`;
      }
      
      if (preferences.includeExamples) {
        userPrompt += `Include specific examples and solved problems related to ${topic}.\n`;
      }
      
      if (preferences.focusAreas && preferences.focusAreas.length > 0) {
        userPrompt += `Special focus areas within ${topic}: ${preferences.focusAreas.join(", ")}\n`;
      }
      
      userPrompt += `\nCRITICAL: Every piece of content must be directly related to "${topic}". Do not include general study advice or unrelated concepts. Focus exclusively on mastering this specific topic.`;
      
      // Get response from OpenAI (using GPT-3.5 Turbo for cost optimization)
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1800,
        temperature: 0.3 // Lower temperature for more focused, factual content
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
      
      // Get response from OpenAI (using GPT-3.5 Turbo for cost optimization)
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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
  },

  /**
   * Generate educational images using DALL-E 3 for immersive learning
   */
  async generateEducationalImage(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const schema = z.object({
      topic: z.string().min(1, "Topic is required"),
      subject: z.string().min(1, "Subject is required"),
      style: z.enum(["diagram", "illustration", "chart", "concept_map", "infographic"]).optional(),
      examType: z.string().optional(),
      customPrompt: z.string().optional()
    });

    try {
      const { topic, subject, style, examType, customPrompt } = schema.parse(req.body);
      const userId = (req.user as any).id;

      // Create topic-focused educational image prompt for DALL-E 3
      let imagePrompt = customPrompt || `Create a highly specific educational ${style || 'diagram'} exclusively about "${topic}" in ${subject}${examType ? ` for ${examType} competitive exam` : ''}. 

CRITICAL REQUIREMENTS FOR "${topic}":
- Show ONLY concepts, formulas, and principles directly related to ${topic}
- Include specific step-by-step breakdown of ${topic} processes
- Add precise labels and annotations explaining ${topic} components
- Use visual elements that directly teach ${topic}
- Include key formulas, equations, or facts specific to ${topic}
- Show how ${topic} appears in competitive exam questions
- Make it comprehensive for complete ${topic} understanding
- Use Indian educational context and standards

Create a focused visual learning tool that teaches ${topic} completely. Every element must be directly relevant to mastering ${topic}.`;

      // Generate image using DALL-E 3
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      const imageUrl = imageResponse.data[0].url;

      // Generate explanation for the image
      const explanationPrompt = `Explain this educational image about "${topic}" in ${subject}. Describe:
1. What the image illustrates
2. Key concepts shown
3. How students can use this for exam preparation
4. Important details to focus on

Keep the explanation concise and exam-oriented.`;

      const explanationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert educator explaining visual learning materials for Indian competitive exams." },
          { role: "user", content: explanationPrompt }
        ],
        max_tokens: 600,
        temperature: 0.4
      });

      const explanation = explanationResponse.choices[0].message.content;

      // Update user's AI tool usage
      await storage.incrementAISessionCount(userId);

      // Send real-time notification
      if ((global as any).sendToUser) {
        (global as any).sendToUser(userId, {
          type: 'ai_insight_generated',
          userId,
          messageType: 'educational_image',
          message: `Educational image for "${topic}" has been generated!`,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        success: true,
        imageUrl,
        explanation,
        topic,
        subject,
        style: style || 'diagram',
        examType,
        generatedAt: new Date()
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("DALL-E image generation error:", error);
      return res.status(500).json({ 
        message: "Error generating educational image",
        details: error.message 
      });
    }
  },

  /**
   * Generate comprehensive visual learning package (Image + SVG + Explanation + Quiz)
   */
  async generateVisualLearningPackage(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const schema = z.object({
      topic: z.string().min(1, "Topic is required"),
      subject: z.string().min(1, "Subject is required"),
      examType: z.string().optional(),
      includeImage: z.boolean().default(true),
      includeDiagram: z.boolean().default(true),
      includeQuiz: z.boolean().default(true)
    });

    try {
      const { topic, subject, examType, includeImage, includeDiagram, includeQuiz } = schema.parse(req.body);
      const userId = (req.user as any).id;

      const results: any = {
        topic,
        subject,
        examType,
        generatedAt: new Date(),
        packageComponents: []
      };

      // Generate DALL-E 3 image if requested
      if (includeImage) {
        try {
          const imagePrompt = `Create a highly detailed educational diagram specifically for "${topic}" in ${subject}${examType ? ` (${examType} exam preparation)` : ''}. 

SPECIFIC REQUIREMENTS for ${topic}:
- Show the exact concepts, formulas, and principles of ${topic}
- Include step-by-step visual breakdown of how ${topic} works
- Add clear labels, annotations, and explanations specific to ${topic}
- Use diagrams, flowcharts, or visual representations relevant to ${topic}
- Include key formulas, equations, or definitions related to ${topic}
- Color-code different aspects of ${topic} for better understanding
- Make it exam-focused with competitive exam question patterns
- Ensure Indian educational context and NCERT alignment

Create a comprehensive visual guide that teaches ${topic} completely through the illustration. Focus on accuracy and educational value for ${subject} students.`;

          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: imagePrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard"
          });

          results.educationalImage = {
            url: imageResponse.data[0].url,
            type: "comprehensive_illustration"
          };
          results.packageComponents.push("educational_image");
        } catch (imageError) {
          console.error("Image generation failed:", imageError);
          results.imageError = "Failed to generate educational image";
        }
      }

      // Generate comprehensive explanation
      const explanationPrompt = `Create a comprehensive learning guide for "${topic}" in ${subject}${examType ? ` for ${examType} exam preparation` : ''}. Include:

1. **Concept Overview**: Clear explanation of the fundamental concepts
2. **Visual Elements**: Description of key visual components and their significance
3. **Exam Strategy**: How this topic appears in competitive exams
4. **Memory Techniques**: Mnemonics and memory aids
5. **Common Mistakes**: Typical errors students make
6. **Practice Approach**: How to practice and master this topic
7. **Related Topics**: Connections to other subjects/chapters
8. **Quick Review Points**: Key facts for last-minute revision

Format this as a comprehensive study guide that complements the visual materials.`;

      const explanationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert educator creating comprehensive study guides for Indian competitive exam preparation. Focus on practical learning strategies and exam success." },
          { role: "user", content: explanationPrompt }
        ],
        max_tokens: 1200,
        temperature: 0.5
      });

      results.comprehensiveGuide = explanationResponse.choices[0].message.content;
      results.packageComponents.push("comprehensive_guide");

      // Generate quiz questions if requested
      if (includeQuiz) {
        try {
          const quizPrompt = `Create 5 multiple-choice questions for "${topic}" in ${subject}${examType ? ` for ${examType} exams` : ''}. Include explanations for each answer.

Format as JSON:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}`;

          const quizResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: quizPrompt }],
            max_tokens: 1000,
            temperature: 0.4,
            response_format: { type: "json_object" }
          });

          results.practiceQuiz = JSON.parse(quizResponse.choices[0].message.content || '{}');
          results.packageComponents.push("practice_quiz");
        } catch (quizError) {
          console.error("Quiz generation failed:", quizError);
          results.quizError = "Failed to generate practice quiz";
        }
      }

      // Update user stats
      await storage.incrementAISessionCount(userId);

      // Send real-time notification
      if ((global as any).sendToUser) {
        (global as any).sendToUser(userId, {
          type: 'ai_insight_generated',
          userId,
          messageType: 'visual_learning_package',
          message: `Complete visual learning package for "${topic}" has been generated!`,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        success: true,
        ...results,
        totalComponents: results.packageComponents.length
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Visual learning package generation error:", error);
      return res.status(500).json({ message: "Error generating visual learning package" });
    }
  },

  /**
   * Generate interactive study session with AI tutor and visuals
   */
  async generateInteractiveStudySession(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const schema = z.object({
      topic: z.string().min(1, "Topic is required"),
      subject: z.string().min(1, "Subject is required"),
      duration: z.number().min(15).max(120).default(30), // Study session duration in minutes
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
      includeVisuals: z.boolean().default(true)
    });

    try {
      const { topic, subject, duration, difficulty, includeVisuals } = schema.parse(req.body);
      const userId = (req.user as any).id;
      const user = await storage.getUserById(userId);
      const tutor = await storage.getAITutorForUser(userId);

      // Create personalized study session plan
      const sessionPrompt = `Create a ${duration}-minute interactive study session for "${topic}" in ${subject} at ${difficulty} level.

Student Profile:
- Name: ${user?.name}
- Level: ${user?.level}
- Current XP: ${user?.currentXp}

Create a structured session with:
1. **Introduction** (5 minutes): Hook and learning objectives
2. **Core Content** (60% of time): Main concepts with examples
3. **Practice** (25% of time): Interactive exercises
4. **Review** (10% of time): Summary and key takeaways

Include:
- Engaging explanations that build on previous knowledge
- Real-world applications and Indian context examples
- Interactive questions throughout
- Memory techniques and mnemonics
- Exam-focused tips and strategies

Format as JSON:
{
  "sessionPlan": {
    "title": "Session title",
    "duration": ${duration},
    "sections": [
      {
        "name": "Section name",
        "duration": "X minutes",
        "content": "Detailed content",
        "activities": ["activity1", "activity2"],
        "keyPoints": ["point1", "point2"]
      }
    ]
  },
  "learningObjectives": ["objective1", "objective2"],
  "prerequisites": ["prerequisite1"],
  "nextSteps": ["next topic to study"]
}`;

      const sessionResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: `You are ${tutor?.name || 'an expert AI tutor'} creating personalized interactive study sessions for Indian competitive exam preparation.` },
          { role: "user", content: sessionPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const sessionData = JSON.parse(sessionResponse.choices[0].message.content || '{}');

      // Generate supporting visual if requested
      let supportingVisual = null;
      if (includeVisuals) {
        try {
          const visualPrompt = `Create an educational infographic for "${topic}" in ${subject} that supports a ${duration}-minute study session. 

The infographic should:
- Summarize key concepts visually
- Include flowcharts, diagrams, or process illustrations
- Use color coding for different concept categories
- Include memorable visual mnemonics
- Be optimized for quick reference during study
- Have a modern, engaging design suitable for competitive exam prep

Focus on visual clarity and educational value.`;

          const visualResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: visualPrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard"
          });

          supportingVisual = {
            url: visualResponse.data[0].url,
            type: "study_session_infographic",
            description: "Visual summary and reference guide for the study session"
          };
        } catch (visualError) {
          console.error("Visual generation failed:", visualError);
        }
      }

      // Update user stats
      await storage.incrementAISessionCount(userId);

      // Send real-time notification
      if ((global as any).sendToUser) {
        (global as any).sendToUser(userId, {
          type: 'ai_insight_generated',
          userId,
          messageType: 'interactive_study_session',
          message: `Interactive ${duration}-minute study session for "${topic}" is ready!`,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(200).json({
        success: true,
        ...sessionData,
        supportingVisual,
        tutor: {
          name: tutor?.name || 'AI Tutor',
          specialty: tutor?.specialty || 'General Studies'
        },
        generatedAt: new Date(),
        estimatedCompletionTime: `${duration} minutes`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Interactive study session generation error:", error);
      return res.status(500).json({ message: "Error generating interactive study session" });
    }
  }
};
