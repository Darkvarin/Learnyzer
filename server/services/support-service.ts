import { Request, Response } from "express";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const supportService = {
  /**
   * Get response from support chatbot
   */
  async getChatResponse(req: Request, res: Response) {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful support assistant for LearnityX, an AI-powered educational platform for Indian students.
            
LearnityX features:
- Voice-interactive AI tutors that can explain concepts via whiteboard visualizations
- Battle Zone for academic competitions (1v1, 2v2, 3v3, or 4v4)
- Complete ranking system from Bronze to Grandmaster
- Comprehensive curriculum from 3rd grade to 12th grade
- Covers competitive exams (JEE, NEET, UPSC, CLAT)
- Daily streak rewards for consistent learning
- Performance Analytics powered by AI
- Referral system for inviting friends

Keep responses concise, helpful, and friendly. If asked about pricing, explain that LearnityX offers both free and premium tiers.
For technical issues, suggest basic troubleshooting like refreshing the page or checking internet connection.
If you don't know an answer, don't make up information - instead suggest contacting support@learnityx.com.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 300
      });

      const responseText = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
      return res.status(200).json({ response: responseText });
    } catch (error) {
      console.error("Error in support chat:", error);
      return res.status(500).json({ error: "Failed to get support response" });
    }
  }
};