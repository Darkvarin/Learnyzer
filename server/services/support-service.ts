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
            content: `You are Learnyzer's support assistant. Provide SHORT, DIRECT answers to user questions.

KEY RULES:
- Answer ONLY what the user asks
- Be concise and clear
- NO phone numbers in responses
- Email support: learnyzer.ai@gmail.com

PLATFORM BASICS:
• AI-powered exam prep for JEE, NEET, UPSC, CLAT, CUET, CSE, CGLE
• Free trial: 1 day access
• Basic: ₹299/month, Pro: ₹799/month, Premium: ₹1,299/month

FEATURES:
• AI Tutor with voice chat
• Study notes with PDF download
• Answer checker with OCR
• Battle competitions
• Visual diagrams

RESPONSE STYLE: Direct, helpful, no extra information unless asked.`
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