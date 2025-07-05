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
      const { message, query } = req.body;
      const userMessage = message || query;
      
      if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get FAQ data for natural conversation context
      const { faqData } = await import("@shared/faq-data");
      const faqContext = faqData.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a helpful support assistant for Learnyzer. Answer questions naturally like talking to a human.

LEARNYZER FAQ DATABASE:
${faqContext}

Use this information to answer user questions. Be conversational, helpful, and direct. Answer like a human would.`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 300,
        temperature: 0.4
      });

      const responseText = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
      return res.status(200).json({ response: responseText });
    } catch (error) {
      console.error("Error in support chat:", error);
      return res.status(500).json({ error: "Failed to get support response" });
    }
  }
};