import type { Request, Response } from "express";
import { storage } from "../storage";
import OpenAI from "openai";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { AnalyticsService } from "./analytics-service";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-api-key" // fallback for development
});

// Initialize analytics service for ecosystem awareness
const analyticsService = new AnalyticsService();

// Helper function to get allowed subjects for each exam type
const getExamSubjects = (examType: string): string[] => {
  const examSubjects: Record<string, string[]> = {
    'jee': ['Physics', 'Chemistry', 'Mathematics'],
    'neet': ['Physics', 'Chemistry', 'Biology'],
    'upsc': ['History', 'Geography', 'Political Science', 'Economics', 'Public Administration', 'Sociology', 'Philosophy', 'Psychology'],
    'clat': ['English', 'General Knowledge', 'Legal Reasoning', 'Logical Reasoning', 'Quantitative Techniques'],
    'cuet': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'General Knowledge'],
    'cse': ['Programming', 'Data Structures', 'Algorithms', 'Operating Systems', 'Networks', 'Database Systems', 'Computer Architecture'],
    'cgle': ['General Awareness', 'Quantitative Aptitude', 'English Language', 'Reasoning']
  };
  
  return examSubjects[examType.toLowerCase()] || [];
};

// Function to check if user's exam is locked and validate content access
const validateExamAccess = async (userId: number, requestedExam?: string, requestedSubject?: string) => {
  const user = await storage.getUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // If user hasn't locked an exam yet, allow access to all content
  if (!user.examLocked || !user.selectedExam) {
    return { 
      allowed: true, 
      lockedExam: null,
      allowedSubjects: [],
      message: 'No exam locked - full access available'
    };
  }

  const userExam = user.selectedExam.toLowerCase();
  const allowedSubjects = getExamSubjects(userExam);

  // If requesting specific exam content, check if it matches locked exam
  if (requestedExam && requestedExam.toLowerCase() !== userExam) {
    return {
      allowed: false,
      lockedExam: userExam,
      allowedSubjects,
      message: `Access denied. You can only study ${userExam.toUpperCase()} content. Your exam is locked until next subscription.`
    };
  }

  // If requesting specific subject, check if it's allowed for the locked exam
  if (requestedSubject) {
    const isSubjectAllowed = allowedSubjects.some(subject => {
      const subjectLower = subject.toLowerCase();
      const requestedLower = requestedSubject.toLowerCase();
      
      // Allow exact matches or partial matches for compound subjects
      return subjectLower === requestedLower || 
             subjectLower.includes(requestedLower) || 
             requestedLower.includes(subjectLower);
    });
    
    if (!isSubjectAllowed) {
      return {
        allowed: false,
        lockedExam: userExam,
        allowedSubjects,
        message: `Access denied. ${requestedSubject} is not part of ${userExam.toUpperCase()} syllabus. You can only study: ${allowedSubjects.join(', ')}`
      };
    }
  }

  return {
    allowed: true,
    lockedExam: userExam,
    allowedSubjects,
    message: `Access granted for ${userExam.toUpperCase()} content`
  };
};

// Function to get exam-specific forbidden keywords for content filtering
const getExamForbiddenKeywords = (examType: string): string[] => {
  const forbiddenKeywords: Record<string, string[]> = {
    'jee': [
      // Biology topics forbidden for JEE
      'botany', 'zoology', 'anatomy', 'physiology', 'genetics', 'evolution', 'ecology', 
      'biodiversity', 'biotechnology', 'molecular biology', 'cell biology', 'microbiology',
      'biochemistry', 'photosynthesis', 'respiration', 'digestion', 'circulation',
      // Humanities forbidden for JEE
      'history', 'geography', 'political science', 'economics', 'sociology', 'philosophy',
      'psychology', 'literature', 'linguistics', 'archaeology', 'anthropology'
    ],
    'neet': [
      // Computer Science topics forbidden for NEET
      'programming', 'coding', 'algorithms', 'data structures', 'software', 'hardware',
      'computer science', 'artificial intelligence', 'machine learning', 'database',
      'networks', 'operating systems', 'computer architecture', 'cybersecurity',
      // Engineering topics forbidden for NEET
      'mechanical engineering', 'electrical engineering', 'civil engineering',
      // Advanced Math forbidden for NEET
      'calculus', 'differential equations', 'linear algebra', 'complex numbers'
    ],
    'upsc': [
      // Highly technical/specialized topics not relevant to UPSC
      'quantum mechanics', 'advanced organic chemistry', 'differential equations',
      'computer programming', 'software development', 'machine learning',
      'biotechnology research', 'nanotechnology', 'advanced physics',
      'specialized engineering', 'technical coding', 'algorithms'
    ],
    'clat': [
      // Advanced science and math topics forbidden for CLAT
      'quantum physics', 'organic chemistry', 'calculus', 'differential equations',
      'advanced mathematics', 'biotechnology', 'computer programming',
      'engineering', 'advanced biology', 'molecular biology', 'genetics'
    ],
    'cse': [
      // Humanities topics forbidden for CSE
      'history', 'geography', 'political science', 'economics', 'sociology',
      'philosophy', 'psychology', 'literature', 'linguistics', 'archaeology',
      'anthropology', 'fine arts', 'music theory', 'classical studies'
    ],
    'cgle': [
      // Advanced technical topics forbidden for CGLE
      'advanced programming', 'machine learning', 'quantum physics',
      'advanced mathematics', 'biotechnology', 'nanotechnology',
      'specialized engineering', 'research methodology', 'advanced chemistry'
    ]
  };
  
  return forbiddenKeywords[examType.toLowerCase()] || [];
};

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: () => void) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// MCQ Generation utility
export const generateMCQUtil = async (options: {
  topic: string;
  subject?: string;
  examType?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionType?: 'conceptual' | 'application' | 'mixed';
  context?: {
    userQuestion?: string;
    aiResponse?: string;
    conversationTopic?: string;
  };
}) => {
  const { 
    topic, 
    subject = 'General', 
    examType = 'general', 
    difficulty = 'medium', 
    questionType = 'mixed',
    context 
  } = options;

  // Enhanced prompt with context awareness
  let prompt = `Generate 1 high-quality multiple choice question for ${examType} exam preparation.

Topic: ${topic}
Subject: ${subject}  
Difficulty: ${difficulty}
Type: ${questionType}`;

  // Add context if available for more relevant questions
  if (context) {
    prompt += `\n\nConversation Context:`;
    if (context.userQuestion) {
      prompt += `\nStudent's Question: ${context.userQuestion}`;
    }
    if (context.aiResponse) {
      prompt += `\nAI Explanation: ${context.aiResponse}`;
    }
    if (context.conversationTopic) {
      prompt += `\nConversation Topic: ${context.conversationTopic}`;
    }
  }

  prompt += `\n\nRequirements:
1. Question must be directly related to the specific topic "${topic}" discussed in the conversation
2. Base the question on concepts that were just explained in the AI response (if provided)
3. Test the student's understanding of what they just learned
4. Provide exactly 4 options (A, B, C, D) with realistic distractors
5. Include brief explanation for correct answer
6. Keep explanation concise (2-3 lines max)
7. Match ${examType} exam pattern and difficulty level
8. Ensure the question tests comprehension of the specific concept discussed
9. IMPORTANT: For mathematical expressions, wrap them in double dollar signs for proper rendering: $$\\frac{1}{4\\pi \\varepsilon_0} \\cdot \\frac{qd}{r^2}$$
10. Use proper LaTeX formatting for all formulas, equations, and mathematical symbols
11. Escape backslashes properly in JSON (use double backslashes: \\\\frac instead of \\frac)

Mathematical Formatting Examples:
- Fractions: $$\\frac{numerator}{denominator}$$
- Square roots: $$\\sqrt{expression}$$
- Superscripts: $$x^2$$
- Subscripts: $$x_0$$
- Greek letters: $$\\alpha, \\beta, \\gamma, \\varepsilon_0$$

Respond with JSON in this exact format:
{
  "question": "Question text here?",
  "options": {
    "A": "Option A text with $$\\frac{formula}{here}$$ if needed",
    "B": "Option B text", 
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "explanation": "Brief explanation why this answer is correct."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No content received from OpenAI');
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating MCQ:', error);
    throw new Error('Failed to generate MCQ');
  }
};

// Utility functions for generating content
export const generateStudyNotesUtil = async (options: {
  topic: string;
  subject?: string;
  style?: string;
  level?: string;
  examType?: string;
  preferences?: any;
}) => {
  const { topic, subject, style, level, examType, preferences } = options;
  
  // Merge preferences for backwards compatibility
  const mergedPreferences = {
    style: style || preferences?.style || 'concise',
    level: level || preferences?.level || 'high_school',
    length: preferences?.length,
    includeExamples: preferences?.includeExamples,
    focusAreas: preferences?.focusAreas
  };
  
  // Build a comprehensive, topic-focused prompt
  const systemPrompt = `You are an expert Indian competitive exam tutor specializing in creating highly focused, exam-relevant study notes. Your expertise spans JEE, NEET, UPSC, CLAT, CUET, and CSE preparation.

Key Requirements:
1. Stay STRICTLY focused on the given topic
2. Provide exam-relevant content only
3. Include specific formulas, concepts, and facts
4. Use Indian educational context and examples
5. Structure content for optimal retention and understanding
6. Use NUMBERED HEADINGS instead of markdown # headers
7. Format sections as: "1. Introduction", "2. Key Concepts", "3. Important Formulas", etc.`;

  let userPrompt = `Create comprehensive study notes specifically focused on "${topic}"`;
  
  if (subject) {
    userPrompt += ` for ${subject}`;
  }
  
  if (examType) {
    userPrompt += ` targeting ${examType.toUpperCase()} exam preparation`;
  }
  
  userPrompt += `
  
Style: ${mergedPreferences.style}
Level: ${mergedPreferences.level}
${mergedPreferences.length ? `Length: ${mergedPreferences.length}` : ''}
${mergedPreferences.includeExamples ? 'Include practical examples and solved problems' : ''}
${mergedPreferences.focusAreas ? `Focus areas: ${mergedPreferences.focusAreas.join(', ')}` : ''}

Requirements:
- Start directly with content about "${topic}"
- Use clear headings and bullet points
- Include key formulas and concepts
- Provide exam-relevant insights
- Use structured format for easy reading
- Include memory techniques where applicable`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Cost-optimized model for study notes
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.3, // Lower temperature for factual content
    max_tokens: 2000
  });

  return response.choices[0].message.content;
};

export const generateEducationalImageUtil = async (options: {
  topic: string;
  description: string;
  style?: string;
  examType?: string;
}) => {
  const { topic, description, style = 'educational', examType } = options;
  
  // Generate canvas-based diagram instead of DALL-E 3
  try {
    const canvasInstructions = await aiService.generateCanvasInstructions({
      topic,
      subject: examType || 'General',
      examType,
      style: 'educational_diagram'
    });

    return {
      canvasInstructions,
      description: `Interactive canvas diagram for ${topic}`,
      hasVisual: true
    };
  } catch (error) {
    console.error('Canvas diagram generation failed:', error);
    return {
      canvasInstructions: null,
      description: `Failed to generate diagram for ${topic}`,
      hasVisual: false
    };
  }
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
      
      // Get user data, AI tutor, and analytics for ecosystem awareness
      const [tutor, user, analyticsData] = await Promise.all([
        storage.getAITutorForUser(userId),
        storage.getUserById(userId),
        aiService.getUserAnalyticsForAI(userId)
      ]);
      
      if (!tutor) {
        return res.status(404).json({ message: "AI tutor not found" });
      }

      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate access
      const examAccess = await validateExamAccess(userId, undefined, subject);
      if (!examAccess.allowed) {
        return res.status(403).json({
          message: examAccess.message,
          lockedExam: examAccess.lockedExam,
          allowedSubjects: examAccess.allowedSubjects,
          examLocked: true
        });
      }

      // CRITICAL: Exam-specific subject validation to prevent abuse
      if (user?.track) {
        const allowedSubjects = getExamSubjects(user.track);
        console.log(`[AI Tutor] User ${user.name} (${user.username}) has exam track: ${user.track}, allowed subjects:`, allowedSubjects);
        
        // Check explicit subject parameter
        if (subject) {
          console.log(`[AI Tutor] Checking subject parameter: ${subject}`);
          
          // Extract subject name from exam-prefixed subjects (e.g., "neet_biology" -> "biology")
          const subjectName = subject.includes('_') ? subject.split('_').slice(1).join(' ') : subject;
          
          const isSubjectAllowed = allowedSubjects.some(allowedSubj => 
            allowedSubj.toLowerCase().includes(subjectName.toLowerCase()) || 
            subjectName.toLowerCase().includes(allowedSubj.toLowerCase())
          );
          
          if (!isSubjectAllowed) {
            console.log(`[AI Tutor] Subject ${subject} (extracted: ${subjectName}) not allowed for ${user.track} exam`);
            return res.status(403).json({ 
              message: `This subject is not available for ${user.track.toUpperCase()} exam preparation. Please focus on: ${allowedSubjects.join(', ')}`,
              allowedSubjects,
              examType: user.track
            });
          } else {
            console.log(`[AI Tutor] Subject ${subject} (extracted: ${subjectName}) allowed for ${user.track} exam`);
          }
        }

        // Check message content for exam-specific subject keywords
        const messageToCheck = message.toLowerCase();
        
        // ENHANCED FILTERING: Check if message is relevant to UPSC
        if (user.track === 'upsc') {
          const upscRelevantKeywords = [
            // History keywords
            'history', 'ancient', 'medieval', 'modern', 'independence', 'freedom struggle', 'colonial', 'mughal', 'british', 'revolt', 'nationalism', 'gandhi', 'nehru', 'patel', 'chandragupta', 'ashoka', 'akbar', 'shah jahan', 'aurangzeb', 'sepoy mutiny', 'quit india',
            // Geography keywords  
            'geography', 'climate', 'monsoon', 'river', 'mountain', 'plateau', 'desert', 'forest', 'mineral', 'agriculture', 'irrigation', 'soil', 'vegetation', 'population', 'urbanization', 'migration', 'himalayas', 'ganga', 'brahmaputra', 'deccan', 'thar', 'western ghats', 'eastern ghats',
            // Political Science keywords
            'political', 'polity', 'constitution', 'fundamental rights', 'directive principles', 'amendment', 'parliament', 'judiciary', 'executive', 'election', 'democracy', 'federalism', 'separation of powers', 'checks and balances', 'president', 'prime minister', 'supreme court', 'high court', 'governor', 'chief minister',
            // Economics keywords
            'economics', 'economy', 'gdp', 'inflation', 'unemployment', 'poverty', 'budget', 'fiscal', 'monetary', 'planning', 'development', 'agriculture economy', 'industrial policy', 'service sector', 'foreign trade', 'balance of payments', 'economic reforms', 'liberalization', 'globalization', 'economic survey',
            // Current Affairs keywords
            'current affairs', 'government scheme', 'policy', 'bill', 'act', 'supreme court judgment', 'international relations', 'diplomacy', 'foreign policy', 'india china', 'india pakistan', 'neighbourhood', 'UN', 'WTO', 'IMF', 'world bank',
            // General Studies keywords
            'environment', 'biodiversity', 'climate change', 'pollution', 'sustainable development', 'renewable energy', 'disaster management', 'internal security', 'terrorism', 'naxalism', 'cyber security', 'ethics', 'integrity', 'governance', 'transparency', 'accountability',
            // Administrative keywords
            'administration', 'civil service', 'bureaucracy', 'public policy', 'implementation', 'monitoring', 'evaluation', 'good governance', 'citizen charter', 'right to information', 'e-governance'
          ];
          
          const isUpscRelevant = upscRelevantKeywords.some(keyword => 
            messageToCheck.includes(keyword)
          );
          
          if (!isUpscRelevant) {
            console.log(`[AI Tutor] Message "${messageToCheck}" not relevant to ${user.track.toUpperCase()} syllabus - blocking request`);
            return res.status(403).json({ 
              message: `This topic is not part of the ${user.track.toUpperCase()} syllabus. Please ask about ${allowedSubjects.join(', ')} topics relevant to ${user.track.toUpperCase()} preparation.`,
              allowedSubjects,
              examType: user.track,
              suggestion: `Try asking about: ${allowedSubjects.slice(0, 3).join(', ')} or other ${user.track.toUpperCase()} subjects`
            });
          } else {
            console.log(`[AI Tutor] Message is UPSC-relevant, proceeding with response`);
          }
        }
        
        // Define forbidden keywords for other exams (more precise filtering)
        const examForbiddenKeywords: Record<string, string[]> = {
          'jee': ['biology', 'botany', 'zoology', 'anatomy', 'physiology', 'genetics', 'ecology', 'evolution', 'cell biology', 'protein synthesis', 'dna replication', 'ecosystem', 'organism classification', 'biodiversity', 'medicine', 'medical'],
          'neet': ['computer science', 'programming', 'algorithm', 'data structure', 'coding', 'software', 'database', 'java', 'python', 'c++', 'html', 'css', 'javascript', 'networking', 'operating system', 'machine learning', 'artificial intelligence'],
          'clat': ['advanced physics', 'chemistry', 'biology', 'advanced mathematics', 'calculus', 'algebra', 'molecular biology', 'genetics', 'quantum mechanics', 'thermodynamics', 'programming', 'algorithm', 'computer science'],
          'cuet': [], // CUET can have mixed subjects based on chosen combination
          'cse': ['ancient history', 'medieval history', 'mughal empire', 'british colonialism', 'freedom struggle', 'independence movement', 'political philosophy', 'constitutional law', 'public administration', 'sociology concepts', 'anthropology'],
          'cgle': ['advanced physics', 'chemistry', 'biology', 'advanced mathematics', 'calculus', 'linear algebra', 'molecular biology', 'genetics', 'programming', 'algorithm', 'data structure', 'computer science']
        };
        
        const forbiddenKeywords = examForbiddenKeywords[user.track] || [];
        
        if (forbiddenKeywords.length > 0) {
          console.log(`[AI Tutor] ${user.track.toUpperCase()} student detected, checking for forbidden keywords in message: ${messageToCheck.substring(0, 100)}...`);
          const containsForbidden = forbiddenKeywords.some(forbidden => 
            messageToCheck.includes(forbidden)
          );
          
          if (containsForbidden) {
            const matchedKeyword = forbiddenKeywords.find(forbidden => messageToCheck.includes(forbidden));
            console.log(`[AI Tutor] Forbidden keyword "${matchedKeyword}" found in ${user.track.toUpperCase()} student's message - blocking request`);
            return res.status(403).json({ 
              message: `This topic is not relevant for ${user.track.toUpperCase()} exam preparation. Please focus on: ${allowedSubjects.join(', ')}`,
              allowedSubjects,
              examType: user.track,
              blockedKeyword: matchedKeyword
            });
          } else {
            console.log(`[AI Tutor] No forbidden keywords found in ${user.track.toUpperCase()} student's message`);
          }
        } else {
          console.log(`[AI Tutor] ${user.track.toUpperCase()} student - no keyword restrictions defined`);
        }
      } else {
        console.log(`[AI Tutor] User has no exam track set, allowing all subjects`);
      }
      
      // Get conversation history for context
      const conversation = await storage.getRecentConversation(userId);
      
      // Enhanced system prompt for topic-focused, immersive experience with ecosystem awareness
      const systemPrompt = `You are ${tutor.name}, an expert AI tutor specializing EXCLUSIVELY in ${user.track?.toUpperCase() || 'competitive'} exam preparation.

🚨 CRITICAL EXAM-SPECIFIC RESTRICTIONS:
${user?.track ? `
- This student is preparing for ${user.track.toUpperCase()} exam ONLY
- ALLOWED SUBJECTS: ${getExamSubjects(user.track).join(', ')}
- MANDATORY: REJECT any question outside these subjects
- MANDATORY: Every response must be ${user.track.toUpperCase()}-exam specific
- MANDATORY: Include ${user.track.toUpperCase()} syllabus references, exam patterns, previous year questions
- MANDATORY: No generic academic content - only ${user.track.toUpperCase()} preparation material
- If asked about non-${user.track.toUpperCase()} topics, respond: "This topic is not part of ${user.track.toUpperCase()} syllabus. Let's focus on [suggest ${user.track.toUpperCase()} topic]"
` : '- Student has not selected specific exam track yet'}

🎯 ${user?.track?.toUpperCase() || 'EXAM'}-SPECIFIC CONTENT REQUIREMENTS:
${user?.track === 'upsc' ? `
- Reference UPSC Prelims/Mains syllabus
- Mention specific papers (GS 1, GS 2, GS 3, GS 4, CSAT)  
- Include previous year questions examples
- Provide answer writing techniques
- Give UPSC-specific preparation tips
- Use UPSC terminology and framework` : user?.track === 'clat' ? `
- Reference CLAT exam pattern and syllabus
- Focus on Legal Reasoning, Logical Reasoning, English, Quantitative Techniques, and General Knowledge
- Include previous year CLAT questions examples
- Provide legal reasoning techniques and case study analysis
- Give CLAT-specific preparation tips and time management strategies
- Use legal terminology and CLAT framework` : user?.track === 'jee' ? `
- Reference JEE Main/Advanced syllabus and exam pattern
- Focus on Physics, Chemistry, Mathematics concepts
- Include previous year JEE questions examples
- Provide problem-solving techniques and shortcuts
- Give JEE-specific preparation tips and time management
- Use technical terminology and JEE framework` : user?.track === 'neet' ? `
- Reference NEET exam pattern and syllabus
- Focus on Physics, Chemistry, Biology concepts
- Include previous year NEET questions examples
- Provide medical entrance preparation techniques
- Give NEET-specific preparation tips and time management
- Use medical terminology and NEET framework` : `
- Reference ${user?.track?.toUpperCase()} exam pattern and syllabus
- Focus on ${getExamSubjects(user?.track || '').join(', ')} subjects
- Include previous year questions examples
- Provide exam-specific preparation techniques
- Give ${user?.track?.toUpperCase()}-specific tips and strategies`}

Student Profile:
- Name: ${user?.name}
- Grade: ${user?.grade || 'Competitive Exam Level'}
- Level: ${user?.level || 1}
- Track: ${user?.track || 'General'}
- Current XP: ${user?.currentXp || 0}

📊 ECOSYSTEM INTELLIGENCE - Student Performance Insights:
- Weak Subjects: ${analyticsData.weakSubjects.length > 0 ? analyticsData.weakSubjects.join(', ') : 'None identified yet'}
- Strong Subjects: ${analyticsData.strongSubjects.length > 0 ? analyticsData.strongSubjects.join(', ') : 'None identified yet'}
- Study Pattern: ${analyticsData.studyPattern}
- Average Score: ${analyticsData.averageScore}%
- Study Streak: ${analyticsData.streakDays} days
- Total Study Time: ${analyticsData.totalStudyTime} hours
- Preferred Learning Style: ${analyticsData.preferredLearningStyle}
- Problem Areas: ${analyticsData.problemAreas.length > 0 ? analyticsData.problemAreas.join(', ') : 'None identified'}

🎯 ADAPTIVE TEACHING STRATEGY:
${analyticsData.weakSubjects.length > 0 ? 
  `- Focus extra attention on weak subjects: ${analyticsData.weakSubjects.join(', ')}
- Provide additional explanations and examples for these areas
- Use encouraging tone when addressing weak subject questions` : 
  '- Maintain balanced teaching across all subjects'}
${analyticsData.strongSubjects.length > 0 ? 
  `- Leverage strong subjects (${analyticsData.strongSubjects.join(', ')}) for confidence building
- Use cross-subject connections to reinforce learning` : ''}
${analyticsData.averageScore < 60 ? 
  '- Emphasize foundational concepts and step-by-step problem solving' : 
  analyticsData.averageScore > 80 ? 
  '- Challenge with advanced concepts and complex problem variations' : 
  '- Balance between reinforcing basics and introducing advanced concepts'}

CRITICAL INSTRUCTIONS - Topic Focus:
1. ALWAYS stay directly relevant to the student's question/topic
2. Provide SPECIFIC, exam-relevant information
3. Include concrete examples, formulas, and facts
4. Avoid generic study advice unless specifically asked
5. Connect every response to actual exam patterns and question types

🎨 VISUAL CONTENT CAPABILITIES:
- You HAVE FULL CAPABILITY to create interactive educational diagrams and visual explanations
- When students ask about topics that benefit from visualization (anatomy, physics processes, chemical structures, mathematical concepts, etc.), confidently create visual content
- Use phrases like "Here's an interactive diagram I've created..." or "I'll generate a visual representation showing..."
- NEVER say "I can't create images" - you CAN create interactive diagrams through the system
- For topics like heart structure, cellular processes, chemical reactions, physics concepts - always offer to create diagrams
- The system automatically generates interactive SVG diagrams based on your responses when visual content is mentioned

Your Enhanced Teaching Approach:
- Give precise, step-by-step explanations with Indian educational context
- Use NCERT references and competitive exam examples
- Adapt complexity to student level: ${difficulty || 'intermediate'}
- Provide specific formulas, theorems, or key facts
- Suggest exact visual aids (diagrams, charts, graphs) when helpful
- Include memory techniques and mnemonics for the specific topic
- Reference how this exact topic appears in ${subject || 'competitive'} exams
- Ask focused follow-up questions to test understanding

CRITICAL FORMATTING RULES:
- Always use proper markdown formatting for structure
- Use ## for main headings, ### for subheadings
- Use **bold** for key terms and concepts
- Use numbered lists (1., 2., 3.) for steps and sequences
- Use bullet points (- ) for related items
- Use proper mathematical notation with LaTeX (EXTREMELY CRITICAL - follow exact syntax):
  * ALWAYS surround inline math with single $ symbols: $F = ma$
  * ALWAYS surround display math with double $$ symbols: $$E = mc^2$$
  * For electric dipole moment: $\mu = q \times d$
  * For calculations: $\mu = (1.602 \times 10^{-19}) \times (10^{-10}) = 1.602 \times 10^{-29}$
  * For units in math: $1.602 \times 10^{-19} \text{ C}$ and $10^{-10} \text{ m}$
  * For fractions: $\frac{1}{2}mv^2$
  * NEVER EVER use [ ] square brackets for math equations
  * NEVER use ( ) parentheses around entire equations  
  * Example of CORRECT format: The formula is $\mu = q \times d$ where $q = 1.602 \times 10^{-19} \text{ C}$
- Always add line breaks between sections
- Use > for important notes or tips
- Use \`code\` formatting for constants or specific values

Response Structure Template:
## Topic Introduction
Brief overview of the concept

### Key Concepts
**Important terms** and definitions

### Mathematical Formulas
Key equations with proper notation

### Step-by-Step Explanation
1. First step
2. Second step
3. Third step

> **Exam Tip:** Important notes for competitive exams

### Practice Examples
Concrete examples with solutions

Personality: ${tutor.personalityTraits}
Current Subject Focus: ${subject || 'Cross-subject consultation'}

REMEMBER: Every response must be directly tied to the student's specific query. Use proper markdown formatting for readability and structure!`;

      // Format conversation history
      const previousMessages = conversation 
        ? conversation.messages.slice(-6).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        : [];
      
      // Generate enhanced AI response
      console.log("Starting OpenAI API call...");
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
      
      console.log("OpenAI API call completed");
      const aiResponse = completion.choices[0].message.content;
      
      // Check if visual content would be helpful
      const needsVisuals = includeVisuals || 
        /diagram|chart|graph|visual|illustration|draw|image|picture|flowchart|concept map|structure|formula|equation/i.test(aiResponse || '');
      
      let visualSuggestions = null;
      if (needsVisuals) {
        try {
          console.log(`[Interactive Diagram] Generating for subject: ${subject}`);
          
          const diagramPrompt = `Create an interactive educational diagram structure for "${message}" in ${subject}.

Generate a detailed JSON structure for an interactive SVG diagram that students can click and explore. Focus on making it educational and engaging.

Respond with JSON:
{
  "title": "Diagram Title",
  "description": "What students will learn",
  "type": "interactive_svg",
  "hasVisual": true,
  "interactionType": "clickable_elements",
  "svgElements": [
    {
      "id": "element1",
      "type": "circle",
      "x": 200,
      "y": 150,
      "radius": 40,
      "fill": "#4CAF50",
      "stroke": "#2E7D32",
      "strokeWidth": 2,
      "label": "Main Concept",
      "clickable": true,
      "tooltip": "Click to learn more about this concept",
      "explanation": "Detailed explanation when clicked"
    },
    {
      "id": "element2", 
      "type": "rectangle",
      "x": 100,
      "y": 250,
      "width": 120,
      "height": 60,
      "fill": "#2196F3",
      "stroke": "#1976D2",
      "strokeWidth": 2,
      "label": "Key Process",
      "clickable": true,
      "tooltip": "Interactive process explanation",
      "explanation": "Step-by-step process details"
    },
    {
      "id": "arrow1",
      "type": "arrow",
      "x1": 200,
      "y1": 190,
      "x2": 160,
      "y2": 250,
      "stroke": "#FF9800",
      "strokeWidth": 3,
      "label": "Flow",
      "animated": true
    },
    {
      "id": "text1",
      "type": "text",
      "x": 200,
      "y": 50,
      "content": "Main Title",
      "fontSize": 20,
      "fontWeight": "bold",
      "fill": "#1A1A1A",
      "textAnchor": "middle"
    }
  ],
  "interactions": [
    {
      "elementId": "element1",
      "action": "click",
      "response": "Show detailed explanation popup"
    },
    {
      "elementId": "element2", 
      "action": "hover",
      "response": "Highlight related elements"
    }
  ],
  "learningObjectives": [
    "Understand core concept structure",
    "Visualize relationships between components",
    "Interactive exploration of key processes"
  ],
  "examRelevance": "How this diagram helps with ${subject?.replace('_', ' ')} exam preparation"
}`;

          const diagramResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { 
                role: "system", 
                content: "You are an expert educational diagram designer who creates interactive learning experiences for competitive exam students. Always respond with valid JSON." 
              },
              { role: "user", content: diagramPrompt }
            ],
            max_tokens: 1500,
            temperature: 0.4,
            response_format: { type: "json_object" }
          });

          const diagramContent = diagramResponse.choices[0].message.content;
          if (diagramContent) {
            visualSuggestions = JSON.parse(diagramContent);
            console.log(`[Interactive Diagram] Generated interactive diagram for ${subject}:`, JSON.stringify(visualSuggestions, null, 2));
          }
        } catch (visualError) {
          console.error('[Interactive Diagram] Generation error:', visualError);
          
          // Fallback to helpful study guide
          visualSuggestions = {
            title: `Interactive Study Guide: ${subject?.replace('_', ' ') || 'Topic'}`,
            description: "While generating the interactive diagram, here's a structured learning approach:",
            type: "study_guide",
            hasVisual: false,
            studySteps: [
              "Break down the concept into key components",
              "Identify relationships between different parts", 
              "Practice with examples and applications",
              "Test understanding with practice questions"
            ],
            examTips: [
              "Focus on understanding core principles",
              "Practice drawing simple diagrams yourself",
              "Connect concepts to exam question patterns"
            ],
            nextSteps: "Try asking more specific questions about individual components"
          };
        }
      }
      
      // Append new messages to existing conversation
      const existingMessages = conversation?.messages ? 
        (typeof conversation.messages === 'string' ? 
          JSON.parse(conversation.messages) : 
          conversation.messages) : [];
      
      const newMessages = [
        ...existingMessages,
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: aiResponse || '', timestamp: new Date() }
      ];

      await storage.saveConversation({
        userId,
        aiTutorId: tutor.id,
        messages: newMessages,
        subject: subject || 'General',
        createdAt: conversation?.createdAt || new Date(),
        updatedAt: new Date()
      });
      
      // Update achievements
      await storage.incrementAISessionCount(userId);
      
      // Note: XP and RP rewards are now only awarded when students correctly answer quiz questions
      
      const responseData = { 
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
      };
      
      console.log('[AI Tutor Response] Sending response to frontend:', {
        responseLength: aiResponse?.length || 0,
        hasVisualSuggestions: !!visualSuggestions,
        visualSuggestionsType: visualSuggestions?.type,
        visualHasVisual: visualSuggestions?.hasVisual,
        responseKeys: Object.keys(responseData)
      });
      
      return res.status(200).json(responseData);
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
      const canvasPrompt = `Create Canvas drawing instructions for an educational diagram based on this conversation:

Subject: ${subject}
Student Question: ${userMessage}
AI Response: ${aiResponse}

Generate precise Canvas drawing instructions that will create a clear, educational diagram. Use JSON format with these drawing commands:
- text: {x, y, content, fontSize, color, align}
- circle: {x, y, radius, fillColor, strokeColor, strokeWidth}
- rectangle: {x, y, width, height, fillColor, strokeColor, strokeWidth}
- line: {x1, y1, x2, y2, strokeColor, strokeWidth}
- arrow: {x1, y1, x2, y2, strokeColor, strokeWidth}

Canvas size: 800x600 pixels. Use these colors:
- Primary text: "#FFFFFF" 
- Secondary text: "#CCCCCC"
- Accent: "#00A3FF"
- Background elements: "#2A2A3A"
- Highlight: "#FFD700"

Respond with JSON:
{
  "title": "Diagram title",
  "description": "What this diagram teaches",
  "hasVisual": true,
  "drawingInstructions": [
    {"type": "text", "x": 400, "y": 50, "content": "Title", "fontSize": 24, "color": "#FFFFFF", "align": "center"},
    {"type": "rectangle", "x": 100, "y": 100, "width": 200, "height": 80, "fillColor": "#2A2A3A", "strokeColor": "#00A3FF", "strokeWidth": 2}
  ],
  "educationalValue": "How this diagram helps understanding"
}`;

      const canvasResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert educational diagram designer who creates precise Canvas drawing instructions for Indian competitive exam preparation." },
          { role: "user", content: canvasPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      return JSON.parse(canvasResponse.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Canvas instructions generation error:', error);
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
   * Create new conversation (clears chat history)
   */
  async createNewConversation(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      
      // Get the user's current AI tutor
      const aiTutor = await storage.getAITutorForUser(userId);
      if (!aiTutor) {
        return res.status(404).json({ message: 'AI tutor not found' });
      }
      
      // Archive current conversation and create a new one
      const newConversation = await storage.archiveAndCreateNewConversation(userId, aiTutor.id);
      
      return res.status(200).json({ 
        message: 'New conversation started', 
        conversation: newConversation 
      });
    } catch (error) {
      console.error('Error creating new conversation:', error);
      return res.status(500).json({ message: 'Failed to create new conversation' });
    }
  },

  /**
   * Get conversation history for a user
   */
  async getConversationHistory(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const conversations = await storage.getConversationHistory(userId, limit);
      
      return res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return res.status(500).json({ message: 'Failed to fetch conversation history' });
    }
  },

  /**
   * Load a specific conversation by ID
   */
  async loadConversation(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID' });
      }
      
      const conversation = await storage.getConversationById(conversationId, userId);
      
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      return res.status(200).json(conversation);
    } catch (error) {
      console.error('Error loading conversation:', error);
      return res.status(500).json({ message: 'Failed to load conversation' });
    }
  },

  /**
   * Generate MCQ for assessment
   */
  async generateMCQ(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { topic, subject, examType, difficulty = 'medium', questionType = 'mixed', context } = req.body;
      const userId = (req.user as any).id;
      
      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate access
      const examAccess = await validateExamAccess(userId, examType, subject);
      if (!examAccess.allowed) {
        return res.status(403).json({
          message: examAccess.message,
          lockedExam: examAccess.lockedExam,
          allowedSubjects: examAccess.allowedSubjects,
          examLocked: true
        });
      }
      
      if (!topic) {
        return res.status(400).json({ message: 'Topic is required' });
      }
      
      const mcq = await generateMCQUtil({
        topic,
        subject,
        examType,
        difficulty,
        questionType,
        context
      });
      
      return res.status(200).json(mcq);
    } catch (error) {
      console.error('Error generating MCQ:', error);
      return res.status(500).json({ message: 'Failed to generate MCQ' });
    }
  },

  /**
   * Evaluate MCQ answer and provide feedback
   */
  async evaluateMCQAnswer(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { question, selectedAnswer, correctAnswer, options, topic, subject } = req.body;
      const userId = (req.user as any).id;
      
      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate access
      const examAccess = await validateExamAccess(userId, undefined, subject);
      if (!examAccess.allowed) {
        return res.status(403).json({
          message: examAccess.message,
          lockedExam: examAccess.lockedExam,
          allowedSubjects: examAccess.allowedSubjects,
          examLocked: true
        });
      }
      
      if (!question || !selectedAnswer || !correctAnswer) {
        return res.status(400).json({ message: 'Question, selected answer, and correct answer are required' });
      }
      
      const isCorrect = selectedAnswer === correctAnswer;
      
      // Generate personalized feedback
      const feedbackPrompt = `Student answered a multiple choice question ${isCorrect ? 'correctly' : 'incorrectly'}.

Question: ${question}
Selected Answer: ${selectedAnswer}. ${options[selectedAnswer]}
Correct Answer: ${correctAnswer}. ${options[correctAnswer]}
Topic: ${topic}
Subject: ${subject}

Provide ${isCorrect ? 'encouraging feedback and additional insight' : 'corrective feedback and explanation'} in 2-3 lines maximum. Be supportive and educational like a real teacher.

${isCorrect ? 
  'Since they got it right, briefly explain why their answer is correct and add one interesting related fact.' : 
  'Since they got it wrong, briefly explain why the correct answer is right and why their choice was incorrect. Be encouraging.'}`;

      const feedbackResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: feedbackPrompt }],
        temperature: 0.3,
        max_tokens: 150
      });

      const feedback = feedbackResponse.choices[0].message.content || '';
      
      // Award XP and RP only for correct answers
      let xpEarned = 0;
      let rpEarned = 0;
      
      if (isCorrect) {
        
        // Base reward for correct answer
        xpEarned += 15; // Base learning reward
        
        // Subject-specific bonus
        if (subject && subject !== 'General' && subject !== 'general') {
          xpEarned += 5; // Subject focus bonus
          rpEarned += 2; // Subject engagement RP
        }
        
        // Advanced topic bonus
        if (topic && topic.length > 20) {
          xpEarned += 5; // Complex topic bonus
          rpEarned += 1; // Advanced learning RP
        }
        
        // Award the rewards
        await storage.addUserXP(userId, xpEarned);
        if (rpEarned > 0) {
          await storage.updateUserRankPoints(userId, rpEarned);
        }
      }
      
      return res.status(200).json({
        isCorrect,
        feedback,
        correctAnswer,
        selectedAnswer,
        rewards: isCorrect ? {
          xpEarned,
          rpEarned,
          breakdown: {
            correctAnswerBonus: 15,
            subjectFocusBonus: (subject && subject !== 'General' && subject !== 'general') ? 5 : 0,
            complexTopicBonus: (topic && topic.length > 20) ? 5 : 0,
            subjectEngagementRP: (subject && subject !== 'General' && subject !== 'general') ? 2 : 0,
            advancedLearningRP: (topic && topic.length > 20) ? 1 : 0
          }
        } : null
      });
    } catch (error) {
      console.error('Error evaluating MCQ answer:', error);
      return res.status(500).json({ message: 'Failed to evaluate answer' });
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
      style: z.string().optional(),
      level: z.string().optional(),
      examType: z.string().optional(),
      preferences: z.object({
        style: z.string().optional(),
        level: z.string().optional(),
        length: z.string().optional(),
        includeExamples: z.boolean().optional(),
        focusAreas: z.array(z.string()).optional()
      }).optional()
    });
    
    try {
      const { topic, subject, style, level, examType, preferences } = schema.parse(req.body);
      const userId = (req.user as any).id;
      
      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate access
      const examAccess = await validateExamAccess(userId, examType, subject);
      if (!examAccess.allowed) {
        return res.status(403).json({
          message: examAccess.message,
          lockedExam: examAccess.lockedExam,
          allowedSubjects: examAccess.allowedSubjects,
          examLocked: true
        });
      }
      
      // Merge top-level style/level with preferences object for backwards compatibility
      const mergedPreferences = {
        style: style || preferences?.style || 'concise',
        level: level || preferences?.level || 'high_school',
        length: preferences?.length,
        includeExamples: preferences?.includeExamples,
        focusAreas: preferences?.focusAreas
      };
      const user = await storage.getUserById(userId);
      
      // Build a comprehensive, topic-focused prompt
      const systemPrompt = `You are an expert Indian competitive exam tutor specializing in creating highly focused, exam-relevant study notes. Your expertise spans JEE, NEET, UPSC, CLAT, CUET, and CSE preparation.

Key Requirements:
1. Stay STRICTLY focused on the given topic
2. Provide exam-relevant content only
3. Include specific formulas, concepts, and facts
4. Use NUMBERED HEADINGS instead of markdown # headers
5. Format sections as: "1. Introduction", "2. Key Concepts", "3. Important Formulas", etc.
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

`;

      // Adapt content structure and complexity based on note style and education level
      const noteStyle = mergedPreferences.style || 'concise';
      const educationLevel = mergedPreferences.level || 'high_school';
      
      // Define education level complexity
      const levelComplexity = {
        'elementary': 'very simple language, basic concepts, no complex formulas',
        'middle_school': 'simple language, fundamental concepts, basic formulas with explanations', 
        'high_school': 'moderate complexity, standard concepts, formulas with derivations',
        'undergraduate': 'advanced language, detailed concepts, complex formulas and proofs',
        'graduate': 'highly technical language, comprehensive analysis, advanced mathematical treatments',
        'competitive_exam': 'exam-focused, formula-heavy, problem-solving oriented'
      };
      
      // Define note style requirements
      const styleRequirements = {
        'concise': {
          structure: `MANDATORY Structure (use NUMBERED HEADINGS, NOT markdown #):

${topic}

1. Quick Overview
(1-2 lines introduction)

2. Key Points
• Point 1
• Point 2  
• Point 3
• Point 4
• Point 5

3. Essential Formulas
• Formula 1: explanation
• Formula 2: explanation

4. Quick Tips
• Memory aid 1
• Shortcut 2`,
          tone: 'Brief, direct, no fluff. Use bullet points and short sentences.'
        },
        'detailed': {
          structure: `MANDATORY Structure (use NUMBERED HEADINGS, NOT markdown #):

${topic}

1. Comprehensive Overview
(Detailed introduction to the topic)

2. Fundamental Concepts
   2.1 Concept 1
   (Detailed explanation)
   2.2 Concept 2
   (Detailed explanation)

3. Derivations & Proofs
   3.1 Derivation 1
   (Step-by-step working)

4. Formulas & Applications
   4.1 Formula 1
   • Formula: [mathematical expression]
   • Application: [example]
   4.2 Formula 2
   • Formula: [mathematical expression]  
   • Application: [example]

5. Advanced Applications
(Real-world connections and advanced uses)

6. Problem-Solving Strategies
   6.1 Strategy 1
   6.2 Strategy 2
   6.3 Strategy 3

7. Common Pitfalls
• Pitfall 1: [explanation]
• Pitfall 2: [explanation]`,
          tone: 'Thorough, explanatory, include reasoning behind concepts.'
        },
        'visual': {
          structure: `MANDATORY Structure:
1. **Visual Overview** (Describe what diagrams would show)
2. **Concept Map** (How topics connect visually)
3. **Flowchart Elements** (Process steps)
4. **Diagram Descriptions** (For charts, graphs, models)
5. **Visual Memory Aids** (Spatial learning techniques)
6. **Infographic Style Points** (Data visualization approach)`,
          tone: 'Descriptive, spatial, emphasize visual relationships and patterns.'
        },
        'question': {
          structure: `MANDATORY Structure:
1. **What is ${topic}?** (Definition and scope)
2. **Why is ${topic} important?** (Significance and applications)
3. **How does ${topic} work?** (Mechanisms and processes)
4. **When is ${topic} used?** (Contexts and scenarios)
5. **What are common questions about ${topic}?** (FAQ format)
6. **How to solve ${topic} problems?** (Step-by-step approach)`,
          tone: 'Interactive, question-driven, conversational format.'
        },
        'simplified': {
          structure: `MANDATORY Structure:
1. **Simple Explanation** (Like explaining to a friend)
2. **Easy Examples** (Relatable, everyday analogies)
3. **Basic Formulas** (Simplified presentation)
4. **Memory Tricks** (Simple mnemonics)
5. **Common Confusions** (What students mix up)
6. **Practice Steps** (Easy-to-follow approach)`,
          tone: 'Very simple language, analogies, avoid jargon, explain everything clearly.'
        }
      };
      
      const selectedStyle = styleRequirements[noteStyle as keyof typeof styleRequirements] || styleRequirements['concise'];
      const complexity = levelComplexity[educationLevel as keyof typeof levelComplexity] || levelComplexity['high_school'];
      
      userPrompt += `CONTENT REQUIREMENTS:
- Education Level: ${educationLevel.replace('_', ' ')} (Use ${complexity})
- Note Style: ${noteStyle} format

${selectedStyle.structure}

STYLE GUIDELINES:
${selectedStyle.tone}

ADAPTATION RULES:
- Adjust vocabulary complexity for ${educationLevel.replace('_', ' ')} level
- Use examples appropriate for ${educationLevel.replace('_', ' ')} students
- Include formulas at ${educationLevel.replace('_', ' ')} complexity level
- Focus on concepts relevant to ${educationLevel.replace('_', ' ')} curriculum

`;
      
      if (mergedPreferences.includeExamples) {
        userPrompt += `Include specific examples and solved problems appropriate for ${educationLevel.replace('_', ' ')} level.\n`;
      }
      
      if (mergedPreferences.focusAreas && mergedPreferences.focusAreas.length > 0) {
        userPrompt += `Special focus areas within ${topic}: ${mergedPreferences.focusAreas.join(", ")}\n`;
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
      subject: z.string().min(1, "Subject cannot be empty"),
      inputMode: z.enum(["text", "image"]),
      answer: z.string().optional(), // For text mode
      imageData: z.string().optional() // For image mode (base64)
    });
    
    try {
      const { question, subject, inputMode, answer, imageData } = schema.parse(req.body);
      const userId = (req.user as any).id;
      
      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate access
      const examAccess = await validateExamAccess(userId, undefined, subject);
      if (!examAccess.allowed) {
        return res.status(403).json({
          message: examAccess.message,
          lockedExam: examAccess.lockedExam,
          allowedSubjects: examAccess.allowedSubjects,
          examLocked: true
        });
      }
      
      let studentAnswer = answer;
      
      // Handle OCR for image input
      if (inputMode === "image") {
        if (!imageData) {
          return res.status(400).json({ message: "Image data is required for image mode" });
        }
        
        // Extract text from image using GPT-4o Vision
        const ocrCompletion = await openai.chat.completions.create({
          model: "gpt-4o", // Use GPT-4o for vision capabilities
          messages: [
            {
              role: "system",
              content: "You are an expert at extracting text from handwritten student answers. Extract all text content from the image accurately, maintaining the structure and mathematical expressions. If you see mathematical formulas or equations, transcribe them clearly."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please extract all the text content from this image of a student's handwritten answer. Include any mathematical formulas, equations, diagrams, or written explanations you see:"
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        });
        
        studentAnswer = ocrCompletion.choices[0].message.content || "";
        
        if (!studentAnswer.trim()) {
          return res.status(400).json({ message: "Could not extract text from the uploaded image. Please ensure the image is clear and contains readable text." });
        }
      }
      
      // Build the evaluation prompt
      const prompt = `
        Question: ${question}
        Student's Answer: ${studentAnswer}
        Subject: ${subject}
        ${inputMode === "image" ? "\n(Note: This answer was extracted from a handwritten image using OCR)" : ""}
        
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
      const userId = (req.user as any).id;
      
      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate topic access
      const examAccess = await validateExamAccess(userId, undefined, undefined, topic);
      if (!examAccess.allowed) {
        return res.status(403).json({
          message: examAccess.message,
          lockedExam: examAccess.lockedExam,
          allowedSubjects: examAccess.allowedSubjects,
          examLocked: true
        });
      }
      
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
      
      // EXAM LOCKING VALIDATION: Check if user's exam is locked
      const user = await storage.getUserById(userId);
      if (user?.examLocked && subject !== 'all') {
        const examAccess = await validateExamAccess(userId, undefined, subject);
        if (!examAccess.allowed) {
          return res.status(403).json({
            message: examAccess.message,
            lockedExam: examAccess.lockedExam,
            allowedSubjects: examAccess.allowedSubjects,
            examLocked: true
          });
        }
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

      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate access
      const examAccess = await validateExamAccess(userId, examType, subject, topic);
      if (!examAccess.allowed) {
        return res.status(403).json({
          message: examAccess.message,
          lockedExam: examAccess.lockedExam,
          allowedSubjects: examAccess.allowedSubjects,
          examLocked: true
        });
      }

      // Create highly specific, educational DALL-E 3 prompt focused on actual diagrams
      let imagePrompt = customPrompt;
      
      if (!customPrompt) {
        // Build subject-specific educational image prompts based on the topic and subject
        const subjectSpecificPrompts = {
          'Physics': `Create a clear, simple physics ${style || 'diagram'} showing "${topic}" with LARGE, READABLE text:
- LARGE labels and annotations that students can easily read
- BIG, bold mathematical equations and formulas (at least 16pt font size)
- Simple, clean arrows and force vectors with clear labels
- BOLD text for all measurements, units, and values
- High contrast colors (black text on white/light backgrounds)
- Minimal clutter - focus on key concepts only
- Large, clear diagrams similar to educational textbook illustrations
- Each label should be easily readable from a distance`,

          'Chemistry': `Create a clear, simple chemistry ${style || 'diagram'} illustrating "${topic}" with LARGE, READABLE text:
- LARGE molecular structures with BIG atomic symbols and clear bonds
- BIG, bold chemical equations and reaction arrows
- LARGE labels for all atoms, molecules, and compounds
- High contrast colors with black text on light backgrounds
- Simple, clean molecular diagrams without clutter
- BOLD text for all chemical formulas and names
- Educational chemistry textbook style with large, clear labels`,

          'Biology': `Create a clear, simple biological ${style || 'diagram'} showing "${topic}" with LARGE, READABLE text:
- LARGE anatomical labels and annotations that are easy to read
- BIG, bold text for all biological terms and processes
- Simple, clean diagrams with minimal clutter
- High contrast colors (black text on white/light backgrounds)
- LARGE arrows showing biological processes and flows
- BOLD labels for all structures, organs, and systems
- Medical textbook style with large, clear, readable text`,

          'Mathematics': `Create a clear, simple mathematical ${style || 'diagram'} demonstrating "${topic}" with LARGE, READABLE text:
- BIG, bold mathematical formulas and equations
- LARGE numbers, variables, and mathematical symbols
- Clear coordinate axes with LARGE labels and values
- Simple, clean geometric constructions
- High contrast colors with black text on white backgrounds
- BOLD text for all measurements and calculations
- Educational math textbook style with large, clear labels`,

          'General Science': `Create a clear, simple educational ${style || 'diagram'} explaining "${topic}" with LARGE, READABLE text:
- BIG, bold scientific principles and laws
- LARGE labels for all processes and concepts
- Simple, clean diagrams with minimal clutter
- High contrast colors (black text on white/light backgrounds)
- BOLD text for all scientific terms and definitions
- Clear arrows and flow indicators
- Educational science textbook style with large, readable labels`,

          'Computer Science': `Create a clear, simple technical ${style || 'diagram'} showing "${topic}" with LARGE, READABLE text:
- LARGE flowchart boxes with BIG, bold text
- Clear algorithm steps with readable labels
- Simple data structure diagrams with large annotations
- BIG, bold code snippets or pseudocode
- High contrast colors with black text on light backgrounds
- LARGE arrows and connecting lines
- Professional computer science textbook style with clear, readable text`
        };

        // Select appropriate prompt based on subject, with fallback to general
        const basePrompt = subjectSpecificPrompts[subject as keyof typeof subjectSpecificPrompts] || 
                          subjectSpecificPrompts['General Science'];
        
        imagePrompt = `${basePrompt}

CRITICAL TEXT READABILITY REQUIREMENTS for "${topic}":
- ALL TEXT MUST BE LARGE AND BOLD (minimum 16pt font size equivalent)
- Use HIGH CONTRAST: Black text on white/light backgrounds ONLY
- MINIMAL TEXT - only essential labels and key formulas
- SIMPLE, CLEAN design without visual clutter
- Focus EXCLUSIVELY on "${topic}" - no unrelated content
- Include only the most important formulas/laws for ${topic}
- Make it look like a simple, clear educational poster
- Students should be able to read ALL text easily
- Suitable for ${examType || 'competitive exam'} preparation

Style: Simple, clean educational diagram with LARGE, BOLD, READABLE text throughout.`;
      }

      // Generate Canvas drawing instructions using GPT-4o
      const canvasPrompt = `Create detailed Canvas drawing instructions for "${topic}" in ${subject}. 

REQUIREMENTS:
- Return a JSON object with canvas drawing commands
- Use simple shapes, text, arrows, and lines
- Make text large and readable (minimum 16px font)
- Use high contrast colors (black text on white background)
- Include clear labels and annotations
- Show key formulas and concepts visually
- Make it educational and exam-focused

Return JSON format:
{
  "title": "${topic}",
  "canvasWidth": 800,
  "canvasHeight": 600,
  "backgroundColor": "#ffffff",
  "elements": [
    {
      "type": "text",
      "x": 100,
      "y": 50,
      "text": "Example Text",
      "fontSize": 20,
      "fontWeight": "bold",
      "color": "#000000"
    },
    {
      "type": "circle",
      "x": 200,
      "y": 150,
      "radius": 30,
      "fillColor": "#e0e0e0",
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "line",
      "x1": 100,
      "y1": 200,
      "x2": 300,
      "y2": 200,
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "arrow",
      "x1": 150,
      "y1": 250,
      "x2": 250,
      "y2": 250,
      "strokeColor": "#000000",
      "strokeWidth": 2
    }
  ]
}

Create a comprehensive diagram for ${topic} showing all key concepts, formulas, and visual elements that will help students understand this topic completely.`;

      const canvasResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert educational diagram designer. Create detailed Canvas drawing instructions for educational topics. Always return valid JSON with precise drawing commands." },
          { role: "user", content: canvasPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.3
      });

      const canvasInstructions = JSON.parse(canvasResponse.choices[0].message.content || '{}');

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
        canvasInstructions,
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

      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate access
      const examAccess = await validateExamAccess(userId, examType, subject, topic);
      if (!examAccess.allowed) {
        return res.status(403).json({
          message: examAccess.message,
          lockedExam: examAccess.lockedExam,
          allowedSubjects: examAccess.allowedSubjects,
          examLocked: true
        });
      }

      const results: any = {
        topic,
        subject,
        examType,
        generatedAt: new Date(),
        packageComponents: []
      };

      // Generate Canvas-based interactive diagram if requested
      if (includeImage) {
        try {
          const canvasInstructions = await aiService.generateCanvasInstructions({
            topic,
            subject,
            examType: examType || undefined,
            style: 'comprehensive_diagram'
          });

          if (canvasInstructions) {
            results.canvasInstructions = canvasInstructions;
            results.packageComponents.push("interactive_diagram");
          } else {
            results.diagramError = "Failed to generate canvas instructions";
          }
        } catch (diagramError) {
          console.error("Canvas diagram generation failed:", diagramError);
          results.diagramError = "Failed to generate interactive diagram";
        }
      }

      // Generate comprehensive explanation with proper markdown formatting
      const explanationPrompt = `Create a comprehensive learning guide for "${topic}" in ${subject}${examType ? ` for ${examType} exam preparation` : ''}. 

CRITICAL FORMATTING REQUIREMENTS:
- Use proper markdown headers (# ## ###)
- Use **bold** for emphasis, not raw ** symbols
- Use bullet points with - or *
- Use numbered lists where appropriate
- Format should be clean and professional

Content Structure:
# ${topic} - Complete Study Guide

## 1. Concept Overview
Clear explanation of the fundamental concepts

## 2. Key Components
- Important elements and their significance
- Visual representations and meanings

## 3. ${examType} Exam Strategy
How this topic appears in ${examType} competitive exams

## 4. Memory Techniques
Mnemonics and memory aids for better retention

## 5. Common Mistakes to Avoid
Typical errors students make and how to prevent them

## 6. Practice Approach
Step-by-step approach to master this topic

## 7. Quick Review Points
• Key facts for last-minute revision
• Important formulas/rules
• Critical concepts to remember

Make this content specific to ${examType} exam requirements and use proper markdown formatting throughout.`;

      const explanationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: `You are an expert educator creating comprehensive study guides for ${examType} exam preparation. Always use proper markdown formatting and focus on exam-specific content. Never use raw ** symbols - use proper markdown syntax.` },
          { role: "user", content: explanationPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.5
      });

      results.comprehensiveGuide = explanationResponse.choices[0].message.content;
      results.packageComponents.push("comprehensive_guide");

      // Generate practice quiz specific to exam type and subject
      if (includeQuiz) {
        try {
          const quizPrompt = `Create a practice quiz for "${topic}" in ${subject} specifically for ${examType} exam preparation.

CRITICAL REQUIREMENTS:
- Questions must be relevant to ${examType} exam pattern and syllabus
- Use ${examType}-specific question format and style
- Focus on concepts from ${subject} that actually appear in ${examType} exams
- Match difficulty level of actual ${examType} exam
- For CGLE Law topics: focus on legal concepts, not mathematical problems
- For UPSC topics: focus on conceptual understanding and current affairs
- For JEE/NEET: focus on problem-solving and application

Generate 5 multiple-choice questions relevant to ${examType} exam on ${subject}.

Format as JSON:
{
  "examType": "${examType}",
  "subject": "${subject}",
  "topic": "${topic}",
  "questions": [
    {
      "question": "Question text relevant to ${examType} exam pattern",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "Why this answer is correct with ${examType} exam context"
    }
  ]
}`;

          const quizResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { 
                role: "system", 
                content: `You are an expert ${examType} exam question creator. Create questions that match the exact pattern and difficulty of ${examType} exam. For ${subject} questions, focus ONLY on concepts relevant to ${examType} syllabus. Never create math questions for law topics or vice versa.` 
              },
              { role: "user", content: quizPrompt }
            ],
            max_tokens: 1200,
            temperature: 0.2,
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
      
      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate access
      const examAccess = await validateExamAccess(userId, undefined, subject, topic);
      if (!examAccess.allowed) {
        return res.status(403).json({
          message: examAccess.message,
          lockedExam: examAccess.lockedExam,
          allowedSubjects: examAccess.allowedSubjects,
          examLocked: true
        });
      }
      
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

      // Generate supporting canvas diagram if requested
      let supportingVisual = null;
      if (includeVisuals) {
        try {
          const canvasInstructions = await aiService.generateCanvasInstructions({
            topic,
            subject,
            examType: user?.track,
            style: 'study_session_infographic'
          });

          if (canvasInstructions) {
            supportingVisual = {
              canvasInstructions,
              type: "interactive_study_diagram",
              description: "Interactive visual summary and reference guide for the study session"
            };
          }
        } catch (visualError) {
          console.error("Canvas diagram generation failed:", visualError);
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
  },

  /**
   * Get comprehensive analytics data for AI tutor ecosystem awareness
   */
  async getUserAnalyticsForAI(userId: number) {
    try {
      // Get comprehensive analytics data from the analytics service
      const analyticsData = await analyticsService.getStudentAnalytics(userId);
      
      // Extract key insights for AI tutor context
      const insights = {
        weakSubjects: analyticsData.weakSubjects || [],
        strongSubjects: analyticsData.strongSubjects || [],
        studyPattern: analyticsData.studyPattern || 'regular',
        averageScore: analyticsData.averageScore || 0,
        totalStudyTime: analyticsData.totalStudyTime || 0,
        streakDays: analyticsData.streakDays || 0,
        preferredLearningStyle: analyticsData.preferredLearningStyle || 'mixed',
        recentActivity: analyticsData.recentActivity || [],
        problemAreas: analyticsData.problemAreas || [],
        improvementTrends: analyticsData.improvementTrends || []
      };
      
      return insights;
    } catch (error) {
      console.error('Error getting user analytics for AI:', error);
      // Return default analytics if service fails
      return {
        weakSubjects: [],
        strongSubjects: [],
        studyPattern: 'regular',
        averageScore: 0,
        totalStudyTime: 0,
        streakDays: 0,
        preferredLearningStyle: 'mixed',
        recentActivity: [],
        problemAreas: [],
        improvementTrends: []
      };
    }
  },

  /**
   * Generate AI insights for battle answers
   */
  async generateAnswerInsight(req: Request, res: Response) {
    try {
      const { question, userAnswer, correctAnswer, explanation, examType } = req.body;
      
      if (!question || !userAnswer || !correctAnswer) {
        return res.status(400).json({ message: "Question, user answer, and correct answer are required" });
      }

      const user = req.user as any;
      const userId = user.id;
      
      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate access
      const examAccess = await validateExamAccess(userId, examType, undefined, question);
      if (!examAccess.allowed) {
        return res.status(403).json({
          message: examAccess.message,
          lockedExam: examAccess.lockedExam,
          allowedSubjects: examAccess.allowedSubjects,
          examLocked: true
        });
      }
      
      const isCorrect = userAnswer === correctAnswer;

      const prompt = `
        You are an expert AI tutor providing personalized insights for ${examType || 'competitive exam'} preparation.
        
        Question: ${question}
        Student's Answer: ${userAnswer}
        Correct Answer: ${correctAnswer}
        Basic Explanation: ${explanation}
        
        Provide a detailed, encouraging insight that:
        1. ${isCorrect ? 'Celebrates the correct answer and explains why it\'s right' : 'Gently explains why the answer was incorrect'}
        2. Gives deeper conceptual understanding beyond the basic explanation
        3. Connects to ${examType} exam patterns and similar question types
        4. Provides a helpful tip or memory technique
        5. Encourages continued learning with specific next steps
        
        Keep it motivational, educational, and exam-focused. Limit to 100 words.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert AI tutor who provides personalized, encouraging insights to help students learn from their answers." 
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      const insight = completion.choices[0].message.content?.trim() || "Great effort! Keep practicing to improve your understanding.";

      res.json({ insight });
    } catch (error) {
      console.error("Error generating AI insight:", error);
      res.status(500).json({ message: "Failed to generate AI insight" });
    }
  },

  /**
   * Generate comprehensive battle insights for all questions
   */
  async generateBattleInsights(req: Request, res: Response) {
    try {
      const { questionsAndAnswers, examType, totalScore, totalQuestions } = req.body;
      
      if (!questionsAndAnswers || !Array.isArray(questionsAndAnswers)) {
        return res.status(400).json({ message: "Questions and answers array is required" });
      }

      const user = req.user as any;
      const userId = user.id;
      
      // EXAM LOCKING VALIDATION: Check if user's exam is locked and validate access
      if (examType) {
        const examAccess = await validateExamAccess(userId, examType);
        if (!examAccess.allowed) {
          return res.status(403).json({
            message: examAccess.message,
            lockedExam: examAccess.lockedExam,
            allowedSubjects: examAccess.allowedSubjects,
            examLocked: true
          });
        }
      }
      const percentage = Math.round((totalScore / (totalQuestions * 10)) * 100);
      
      // Analyze performance patterns
      const correctAnswers = questionsAndAnswers.filter(qa => qa.isCorrect).length;
      const incorrectAnswers = questionsAndAnswers.filter(qa => !qa.isCorrect).length;
      
      // Build comprehensive insight prompt
      const prompt = `
        You are an expert AI tutor providing comprehensive analysis for ${examType || 'competitive exam'} preparation.
        
        BATTLE PERFORMANCE ANALYSIS:
        - Total Questions: ${totalQuestions}
        - Correct Answers: ${correctAnswers}
        - Incorrect Answers: ${incorrectAnswers}
        - Score: ${totalScore}/${totalQuestions * 10} points (${percentage}%)
        - Exam Type: ${examType}
        
        DETAILED QUESTION ANALYSIS:
        ${questionsAndAnswers.map((qa, index) => `
        Question ${index + 1}: ${qa.question}
        Student Answer: ${qa.userAnswer}
        Correct Answer: ${qa.correctAnswer}
        Result: ${qa.isCorrect ? 'CORRECT ✓' : 'INCORRECT ✗'}
        `).join('\n')}
        
        Provide a comprehensive, encouraging analysis that includes:
        
        1. **Overall Performance Summary**: Congratulate strengths and acknowledge areas for improvement
        2. **Key Learning Points**: Extract 3-4 main concepts from the questions that are crucial for ${examType}
        3. **Mistake Pattern Analysis**: If there were incorrect answers, identify common themes or knowledge gaps
        4. **Study Recommendations**: Specific topics to focus on based on performance
        5. **Motivation & Next Steps**: Encouraging message with actionable next steps
        
        Keep it educational, personalized, and exam-focused. Limit to 250 words maximum.
        Make it sound like a caring tutor who wants to help the student succeed.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `You are an expert ${examType} preparation tutor who provides comprehensive, encouraging performance analysis to help students improve their exam preparation.` 
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.6
      });

      const insight = completion.choices[0].message.content?.trim() || "Great effort completing this battle! Continue practicing to improve your performance.";

      res.json({ insight });
    } catch (error) {
      console.error("Error generating battle insights:", error);
      res.status(500).json({ message: "Failed to generate comprehensive insights" });
    }
  },

  /**
   * Generate Canvas drawing instructions for educational diagrams
   */
  async generateCanvasInstructions(options: {
    topic: string;
    subject: string;
    examType?: string;
    style?: string;
  }) {
    const { topic, subject, examType, style = 'diagram' } = options;
    
    const canvasPrompt = `Generate detailed Canvas drawing instructions for an educational diagram about "${topic}" in ${subject}${examType ? ` (${examType} exam preparation)` : ''}.

Create a comprehensive, well-structured diagram that helps students understand this topic completely.

Return ONLY valid JSON with this exact structure:
{
  "title": "${topic} - Educational Diagram",
  "width": 800,
  "height": 600,
  "elements": [
    {
      "type": "text",
      "x": 400,
      "y": 40,
      "text": "${topic}",
      "fontSize": 28,
      "fontWeight": "bold",
      "color": "#1e40af",
      "textAlign": "center"
    },
    {
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 180,
      "height": 60,
      "fillColor": "#dbeafe",
      "strokeColor": "#2563eb",
      "strokeWidth": 2
    },
    {
      "type": "text",
      "x": 190,
      "y": 135,
      "text": "Key Concept 1",
      "fontSize": 14,
      "fontWeight": "normal",
      "color": "#1e40af",
      "textAlign": "center"
    },
    {
      "type": "rectangle",
      "x": 320,
      "y": 100,
      "width": 180,
      "height": 60,
      "fillColor": "#fef3c7",
      "strokeColor": "#f59e0b",
      "strokeWidth": 2
    },
    {
      "type": "text",
      "x": 410,
      "y": 135,
      "text": "Key Concept 2",
      "fontSize": 14,
      "fontWeight": "normal",
      "color": "#b45309",
      "textAlign": "center"
    },
    {
      "type": "rectangle",
      "x": 540,
      "y": 100,
      "width": 180,
      "height": 60,
      "fillColor": "#d1fae5",
      "strokeColor": "#10b981",
      "strokeWidth": 2
    },
    {
      "type": "text",
      "x": 630,
      "y": 135,
      "text": "Key Concept 3",
      "fontSize": 14,
      "fontWeight": "normal",
      "color": "#047857",
      "textAlign": "center"
    },
    {
      "type": "arrow",
      "x1": 280,
      "y1": 130,
      "x2": 320,
      "y2": 130,
      "strokeColor": "#6b7280",
      "strokeWidth": 3
    },
    {
      "type": "arrow",
      "x1": 500,
      "y1": 130,
      "x2": 540,
      "y2": 130,
      "strokeColor": "#6b7280",
      "strokeWidth": 3
    },
    {
      "type": "rectangle",
      "x": 200,
      "y": 250,
      "width": 400,
      "height": 100,
      "fillColor": "#fef2f2",
      "strokeColor": "#dc2626",
      "strokeWidth": 2
    },
    {
      "type": "text",
      "x": 400,
      "y": 280,
      "text": "Important Application",
      "fontSize": 16,
      "fontWeight": "bold",
      "color": "#dc2626",
      "textAlign": "center"
    },
    {
      "type": "text",
      "x": 400,
      "y": 310,
      "text": "Real-world usage and exam relevance",
      "fontSize": 12,
      "fontWeight": "normal",
      "color": "#991b1b",
      "textAlign": "center"
    },
    {
      "type": "arrow",
      "x1": 400,
      "y1": 180,
      "x2": 400,
      "y2": 240,
      "strokeColor": "#dc2626",
      "strokeWidth": 3
    },
    {
      "type": "text",
      "x": 400,
      "y": 450,
      "text": "Key Formula/Rule (if applicable)",
      "fontSize": 14,
      "fontWeight": "bold",
      "color": "#7c3aed",
      "textAlign": "center"
    },
    {
      "type": "rectangle",
      "x": 250,
      "y": 480,
      "width": 300,
      "height": 50,
      "fillColor": "#f3e8ff",
      "strokeColor": "#7c3aed",
      "strokeWidth": 2
    },
    {
      "type": "text",
      "x": 400,
      "y": 510,
      "text": "Formula or important rule here",
      "fontSize": 12,
      "fontWeight": "normal",
      "color": "#6b21a8",
      "textAlign": "center"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Make text readable and properly centered
- Use consistent colors and styling
- Include relevant formulas or rules for ${examType} exam
- Show clear relationships between concepts
- Focus on ${examType} exam-specific content
- Use proper text alignment and positioning
- Include 12-15 elements for comprehensive coverage`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `You are an expert educational diagram designer specializing in ${examType} exam preparation. Create detailed Canvas drawing instructions that are visually clear, properly formatted, and exam-focused. Always return valid JSON with precise positioning and readable text elements.` 
          },
          { role: "user", content: canvasPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 3000,
        temperature: 0.2
      });

      const canvasInstructions = JSON.parse(response.choices[0].message.content || '{}');
      return canvasInstructions;
    } catch (error) {
      console.error('Canvas instructions generation failed:', error);
      return null;
    }
  }
};
