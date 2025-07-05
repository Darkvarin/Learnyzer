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
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Learnyzer's expert support assistant. Your goal: provide instant, accurate help for Indian students preparing for competitive exams.

ABOUT LEARNYZER:
India's #1 AI-powered exam preparation platform for JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE. Serves students from 3rd grade to 12th grade plus competitive exam aspirants.

KEY FEATURES & TIERS:
PREMIUM FEATURES (Paid Plans Only):
• AI Tutor with Voice Interaction: GPT-4o powered personalized tutoring
• Visual Learning Lab: DALL-E 3 educational diagrams and concept visualization
• Advanced Analytics: Detailed performance tracking and recommendations

INCLUDED IN ALL PLANS:
• Study Notes Generator: AI-generated notes with PDF download
• Answer Checker: OCR-enabled handwritten answer evaluation  
• Course Library: Exam-specific content filtering and organization

FREE FEATURES:
• Battle Zone: 1v1 to 4v4 academic competitions
• Ranking System: Bronze to Grandmaster progression
• Daily Streak Rewards: XP and achievement system
• Basic Course Access: Subject-wise content browsing

PRICING (Indian Rupees):
• FREE TRIAL: 1 day full access (₹0)
• Basic: ₹799/month | ₹2,399/quarterly  
• Pro: ₹1,299/month | ₹3,899/quarterly
• Premium: ₹1,799/month | ₹5,399/quarterly
• Half-Yearly: ₹8,999 (6 months)
• Yearly: ₹12,999 (12 months - BEST VALUE)

CONTACT SUPPORT:
• Email: learnyzer.ai@gmail.com (detailed questions)
• Phone: +91 9910601733 (urgent issues)

RESPONSE STRATEGY:
1. Match user's communication style (student vs parent)
2. Provide specific details from above information
3. Use bullet points for clarity
4. End with helpful follow-up question
5. For technical issues: guide step-by-step before suggesting human support
6. Be encouraging about their exam preparation journey
7. Include contact info when users need human assistance

CRITICAL: Use only factual information above. Never guess features or pricing.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 450,
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