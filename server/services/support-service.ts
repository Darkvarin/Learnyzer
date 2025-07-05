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
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are Learnyzer's support assistant. Answer user questions directly and clearly.

KEY RULES:
- Answer exactly what the user asks
- Be concise but helpful
- NO phone numbers ever
- Email: learnyzer.ai@gmail.com for detailed support

HOW LEARNYZER HELPS STUDENTS:
• AI Tutor: Personal teacher available 24/7 with voice interaction
• Study Notes: AI generates comprehensive notes with PDF download
• Answer Checker: Upload handwritten answers for instant feedback
• Visual Learning: Canvas diagrams and educational content
• Practice: Battle competitions and gamified learning
• Tracking: Progress monitoring and performance analytics
• Exam Focus: Content locked to your specific entrance exam

PRICING: Free trial (1 day), Basic ₹299/month, Pro ₹799/month, Premium ₹1,299/month

EXAMS: JEE, NEET, UPSC, CLAT, CUET, CSE, CGLE

Answer the user's specific question directly.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.2
      });

      const responseText = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
      return res.status(200).json({ response: responseText });
    } catch (error) {
      console.error("Error in support chat:", error);
      return res.status(500).json({ error: "Failed to get support response" });
    }
  }
};