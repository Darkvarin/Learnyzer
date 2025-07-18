// Initialize OpenAI client lazily
let openai: any | null = null;

const getOpenAIClient = () => {
  if (!openai) {
    // Import OpenAI dynamically to avoid module-level initialization
    const OpenAI = require("openai");
    // Directly pass API key to bypass environment variable check
    openai = new OpenAI({ 
      apiKey: "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"
    });
  }
  return openai;
};

export interface MockTestQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  difficulty: string;
}

export interface MockTestData {
  title: string;
  questions: MockTestQuestion[];
  answerKey: string[];
  totalMarks: number;
}

export class MockTestService {
  static async generateMockTest(params: {
    examType: string;
    subject: string;
    difficulty: string;
    questionCount: number;
    duration: number;
    topics?: string[];
  }): Promise<MockTestData> {
    const { examType, subject, difficulty, questionCount, topics } = params;
    
    // Prepare topics string
    const topicsText = topics && topics.length > 0 
      ? `Focus specifically on these topics: ${topics.join(', ')}`
      : '';

    const prompt = `Generate a comprehensive ${examType} mock test for ${subject} with the following specifications:

EXAM DETAILS:
- Exam: ${examType}
- Subject: ${subject}
- Difficulty: ${difficulty}
- Number of Questions: ${questionCount}
${topicsText}

INSTRUCTIONS:
1. Create ${questionCount} multiple choice questions (MCQs) with 4 options each
2. Questions should be ${difficulty} level and exam-specific for ${examType}
3. Include variety: conceptual, application, and analytical questions
4. Each question should have exactly 4 options labeled A, B, C, D
5. Provide COMPREHENSIVE, educational explanations (minimum 2-3 sentences)
6. Assign appropriate marks per question (2 marks for easy, 3 for medium, 4 for hard)
7. Ensure questions cover breadth of ${subject} curriculum for ${examType}

EXPLANATION REQUIREMENTS:
- Explain WHY the correct answer is right
- Briefly explain why other options are incorrect
- Include relevant concepts or formulas when applicable
- Add context or real-world applications where relevant
- Use educational language that helps students learn

RESPONSE FORMAT (JSON):
{
  "title": "${examType} ${subject} Mock Test: [Specific Topic/Chapter]",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Comprehensive explanation: The correct answer is A because [detailed reasoning]. Option B is incorrect because [reason]. Option C is wrong due to [reason]. Option D is incorrect as [reason]. This concept is important because [educational context or application].",
      "marks": 2,
      "difficulty": "${difficulty}"
    }
  ],
  "answerKey": ["A", "B", "C", ...],
  "totalMarks": 50
}

Generate high-quality, exam-standard questions with educational explanations that help students understand concepts deeply.`;

    try {
      const response = await getOpenAIClient().chat.completions.create({
        // Using GPT-4o for superior mock test generation with detailed explanations
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert exam question generator specializing in Indian competitive exams. Generate authentic, high-quality questions that match official exam standards with detailed explanations that help students understand concepts deeply."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 6000
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const mockTestData = JSON.parse(content) as MockTestData;
      
      // Validate the response structure
      if (!mockTestData.questions || !Array.isArray(mockTestData.questions)) {
        throw new Error('Invalid mock test format: missing questions array');
      }

      if (mockTestData.questions.length !== questionCount) {
        console.warn(`Expected ${questionCount} questions, got ${mockTestData.questions.length}`);
      }

      // Ensure each question has proper structure
      mockTestData.questions.forEach((q, index) => {
        if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Invalid question format at index ${index}`);
        }
        
        if (!q.correctAnswer || !q.explanation) {
          throw new Error(`Missing answer or explanation at question ${index + 1}`);
        }
        
        // Ensure question has an ID and marks
        q.id = index + 1;
        q.marks = q.marks || (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3);
        q.difficulty = difficulty;
      });

      // Calculate total marks if not provided
      if (!mockTestData.totalMarks) {
        mockTestData.totalMarks = mockTestData.questions.reduce((sum, q) => sum + q.marks, 0);
      }

      // Generate answer key if not provided
      if (!mockTestData.answerKey) {
        mockTestData.answerKey = mockTestData.questions.map(q => q.correctAnswer);
      }

      return mockTestData;
    } catch (error) {
      console.error('Error generating mock test:', error);
      throw new Error(`Failed to generate mock test: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateMockTestPDF(mockTest: any, questions: MockTestQuestion[]): Promise<string> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${mockTest.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #1e40af;
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: 700;
          }
          
          .header .details {
            font-size: 16px;
            color: #6b7280;
            margin: 5px 0;
          }
          
          .instructions {
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          
          .instructions h3 {
            color: #1e40af;
            margin: 0 0 10px 0;
            font-size: 18px;
          }
          
          .question {
            margin: 25px 0;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          
          .question-number {
            background: #3b82f6;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 10px;
            font-size: 14px;
          }
          
          .question-text {
            font-size: 16px;
            font-weight: 500;
            margin: 10px 0 15px 0;
            line-height: 1.5;
          }
          
          .options {
            margin: 15px 0;
          }
          
          .option {
            padding: 8px 15px;
            margin: 8px 0;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 15px;
          }
          
          .marks {
            text-align: right;
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
            margin-top: 10px;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          
          .answer-section {
            margin-top: 40px;
            padding: 20px;
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            text-align: center;
          }
          
          .answer-section h3 {
            color: #92400e;
            margin: 0;
            font-size: 18px;
          }
          
          .answer-section p {
            color: #92400e;
            margin: 10px 0 0 0;
            font-weight: 500;
          }
          
          @media print {
            body { margin: 0; padding: 15mm; }
            .question { page-break-inside: avoid; }
            .header { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${mockTest.title}</h1>
          <div class="details">
            <div><strong>Exam:</strong> ${mockTest.examType} | <strong>Subject:</strong> ${mockTest.subject}</div>
            <div><strong>Duration:</strong> ${mockTest.duration} minutes | <strong>Total Marks:</strong> ${mockTest.totalMarks}</div>
            <div><strong>Questions:</strong> ${mockTest.totalQuestions} | <strong>Difficulty:</strong> ${mockTest.difficulty}</div>
          </div>
        </div>
        
        <div class="instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Read all questions carefully before answering</li>
            <li>Each question has only one correct answer</li>
            <li>Mark your answers clearly on the answer sheet</li>
            <li>Time limit: ${mockTest.duration} minutes</li>
            <li>Total marks: ${mockTest.totalMarks}</li>
          </ul>
        </div>
        
        ${questions.map((question, index) => `
          <div class="question">
            <span class="question-number">Q${question.id}</span>
            <div class="question-text">${question.question}</div>
            <div class="options">
              ${question.options.map(option => `
                <div class="option">${option}</div>
              `).join('')}
            </div>
            <div class="marks">[${question.marks} ${question.marks === 1 ? 'mark' : 'marks'}]</div>
          </div>
        `).join('')}
        
        <div class="answer-section">
          <h3>🔒 Answer Key</h3>
          <p>Answer key will be provided after test completion and submission.</p>
        </div>
        
        <div class="footer">
          <p><strong>Learnyzer</strong> - AI-Powered Educational Platform</p>
          <p>Generated on ${new Date().toLocaleDateString()} | Mock Test System</p>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  }
}