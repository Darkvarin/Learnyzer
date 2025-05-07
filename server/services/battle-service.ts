import type { Request, Response } from "express";
import { storage } from "../storage";
import { insertBattleSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: () => void) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export const battleService = {
  /**
   * Get all battles
   */
  async getAllBattles(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      
      const active = await storage.getActiveBattles();
      const upcoming = await storage.getUpcomingBattles();
      const past = await storage.getPastBattles(userId);
      
      return res.status(200).json({ active, upcoming, past });
    } catch (error) {
      console.error("Get all battles error:", error);
      return res.status(500).json({ message: "Error retrieving battles" });
    }
  },
  
  /**
   * Get active battles
   */
  async getActiveBattles(req: Request, res: Response) {
    try {
      const battles = await storage.getActiveBattles();
      return res.status(200).json(battles);
    } catch (error) {
      console.error("Get active battles error:", error);
      return res.status(500).json({ message: "Error retrieving active battles" });
    }
  },
  
  /**
   * Get battle by ID
   */
  async getBattleById(req: Request, res: Response) {
    try {
      const battleId = parseInt(req.params.id);
      
      if (isNaN(battleId)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }
      
      const battle = await storage.getBattleById(battleId);
      
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      return res.status(200).json(battle);
    } catch (error) {
      console.error("Get battle by ID error:", error);
      return res.status(500).json({ message: "Error retrieving battle" });
    }
  },
  
  /**
   * Create a new battle
   */
  async createBattle(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const battleSchema = z.object({
      title: z.string().min(3, "Title must be at least 3 characters"),
      type: z.string().min(1, "Type is required"),
      duration: z.number().min(5, "Duration must be at least 5 minutes").max(120, "Duration cannot exceed 120 minutes"),
      topics: z.array(z.string()).min(1, "At least one topic is required")
    });
    
    try {
      const battleData = battleSchema.parse(req.body);
      const userId = (req.user as any).id;
      
      // Calculate reward points based on battle type and duration
      let rewardPoints = 100;
      
      if (battleData.type === "2v2") rewardPoints = 200;
      if (battleData.type === "3v3") rewardPoints = 300;
      if (battleData.type === "4v4") rewardPoints = 400;
      
      // Adjust for duration
      rewardPoints += Math.floor(battleData.duration / 10) * 50;
      
      // Create the battle
      const battle = await storage.createBattle({
        title: battleData.title,
        type: battleData.type,
        duration: battleData.duration,
        topics: battleData.topics,
        rewardPoints,
        createdBy: userId,
      });
      
      // Automatically join the creator to the battle
      await storage.joinBattle(battle.id, userId);
      
      return res.status(201).json(battle);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create battle error:", error);
      return res.status(500).json({ message: "Error creating battle" });
    }
  },
  
  /**
   * Join a battle
   */
  async joinBattle(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const battleId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      if (isNaN(battleId)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }
      
      // Check if the battle exists and is open for joining
      const battle = await storage.getBattleById(battleId);
      
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      if (battle.status !== "waiting") {
        return res.status(400).json({ message: "This battle is no longer accepting participants" });
      }
      
      // Check if the user is already in the battle
      const isParticipant = await storage.isBattleParticipant(battleId, userId);
      
      if (isParticipant) {
        return res.status(400).json({ message: "You are already participating in this battle" });
      }
      
      // Check if the battle has reached its participant limit
      const participants = await storage.getBattleParticipants(battleId);
      
      const maxParticipants = parseInt(battle.type.split('v')[0]) * 2;
      
      if (participants.length >= maxParticipants) {
        return res.status(400).json({ message: "This battle has reached its participant limit" });
      }
      
      // Join the battle
      const team = battle.type.includes('v') 
        ? Math.floor(participants.length / parseInt(battle.type.split('v')[0]))
        : 0;
      
      await storage.joinBattle(battleId, userId, team);
      
      // Broadcast the join event via WebSocket if available
      if ((global as any).broadcastToBattle) {
        const user = await storage.getUserById(userId);
        (global as any).broadcastToBattle(battleId.toString(), {
          type: 'participant_joined',
          battleId: battleId,
          userId: userId,
          username: user.username,
          user: {
            id: user.id,
            username: user.username,
            profileImage: user.profileImage || ''
          },
          team: team,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check if the battle is now full and should start
      const updatedParticipants = await storage.getBattleParticipants(battleId);
      
      if (updatedParticipants.length === maxParticipants) {
        // Start the battle
        await storage.startBattle(battleId);
      }
      
      return res.status(200).json({ message: "Successfully joined the battle" });
    } catch (error) {
      console.error("Join battle error:", error);
      return res.status(500).json({ message: "Error joining battle" });
    }
  },
  
  /**
   * Submit an answer for a battle
   */
  async submitBattleAnswer(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const schema = z.object({
      answer: z.string().min(1, "Answer cannot be empty")
    });
    
    try {
      const { answer } = schema.parse(req.body);
      const battleId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      if (isNaN(battleId)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }
      
      // Check if the battle exists and is in progress
      const battle = await storage.getBattleById(battleId);
      
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      if (battle.status !== "in_progress") {
        return res.status(400).json({ message: "This battle is not in progress" });
      }
      
      // Check if the user is a participant
      const isParticipant = await storage.isBattleParticipant(battleId, userId);
      
      if (!isParticipant) {
        return res.status(403).json({ message: "You are not a participant in this battle" });
      }
      
      // Submit the answer
      await storage.submitBattleAnswer(battleId, userId, answer);
      
      // Broadcast the submission event via WebSocket if available
      if ((global as any).broadcastToBattle) {
        const user = await storage.getUserById(userId);
        (global as any).broadcastToBattle(battleId.toString(), {
          type: 'answer_submitted',
          battleId: battleId,
          userId: userId,
          username: user.username,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check if all participants have submitted
      const participants = await storage.getBattleParticipants(battleId);
      const allSubmitted = participants.every(p => p.submission);
      
      if (allSubmitted) {
        // Mark the battle as completed
        await storage.completeBattle(battleId);
        
        // Broadcast the battle completion event
        if ((global as any).broadcastToBattle) {
          (global as any).broadcastToBattle(battleId.toString(), {
            type: 'battle_completed',
            battleId: battleId,
            message: "All participants have submitted their answers. The battle is complete and will be judged by AI.",
            timestamp: new Date().toISOString()
          });
        }
      }
      
      return res.status(200).json({ message: "Answer submitted successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Submit battle answer error:", error);
      return res.status(500).json({ message: "Error submitting answer" });
    }
  }
};
