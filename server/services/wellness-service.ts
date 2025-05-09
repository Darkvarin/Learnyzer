import { Request, Response } from "express";
import { storage } from "../storage";

const requireAuth = (req: Request, res: Response, next: () => void) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

export const wellnessService = {
  /**
   * Get user wellness preferences
   */
  async getWellnessPreferences(req: Request, res: Response) {
    requireAuth(req, res, async () => {
      try {
        // Default preferences if none are set
        const preferences = await storage.getUserWellnessPreferences(req.user!.id);
        res.status(200).json(preferences);
      } catch (error) {
        console.error("Error getting wellness preferences:", error);
        res.status(500).json({ message: "Error getting wellness preferences" });
      }
    });
  },
  
  /**
   * Save user wellness preferences
   */
  async saveWellnessPreferences(req: Request, res: Response) {
    requireAuth(req, res, async () => {
      try {
        const { eyeStrain, posture, hydration, movement, breathing } = req.body;
        
        // Validate preferences
        if (typeof eyeStrain !== 'boolean' ||
            typeof posture !== 'boolean' ||
            typeof hydration !== 'boolean' ||
            typeof movement !== 'boolean' ||
            typeof breathing !== 'boolean') {
          return res.status(400).json({ message: "Invalid preferences format" });
        }
        
        await storage.saveUserWellnessPreferences(req.user!.id, {
          eyeStrain,
          posture,
          hydration,
          movement,
          breathing
        });
        
        res.status(200).json({ message: "Preferences saved successfully" });
      } catch (error) {
        console.error("Error saving wellness preferences:", error);
        res.status(500).json({ message: "Error saving wellness preferences" });
      }
    });
  },
  
  /**
   * Log a completed wellness break
   */
  async logWellnessBreak(req: Request, res: Response) {
    requireAuth(req, res, async () => {
      try {
        const { breakId, breakType, duration } = req.body;
        
        // Validate input
        if (!breakId || !breakType || !duration) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        
        // Log the break
        await storage.logWellnessBreak(req.user!.id, {
          breakId,
          breakType,
          duration,
          completedAt: new Date()
        });
        
        // Add a small XP reward for taking a wellness break
        await storage.addUserXP(req.user!.id, 5);
        
        // Update achievement progress for wellness
        await storage.updateAchievementProgress(req.user!.id, "wellness_breaks", 1);
        
        res.status(200).json({ message: "Break logged successfully", xpEarned: 5 });
      } catch (error) {
        console.error("Error logging wellness break:", error);
        res.status(500).json({ message: "Error logging wellness break" });
      }
    });
  },
  
  /**
   * Get user's wellness break history
   */
  async getWellnessBreakHistory(req: Request, res: Response) {
    requireAuth(req, res, async () => {
      try {
        const history = await storage.getWellnessBreakHistory(req.user!.id);
        res.status(200).json(history);
      } catch (error) {
        console.error("Error getting wellness break history:", error);
        res.status(500).json({ message: "Error getting wellness break history" });
      }
    });
  },
  
  /**
   * Get wellness stats
   */
  async getWellnessStats(req: Request, res: Response) {
    requireAuth(req, res, async () => {
      try {
        const stats = await storage.getUserWellnessStats(req.user!.id);
        res.status(200).json(stats);
      } catch (error) {
        console.error("Error getting wellness stats:", error);
        res.status(500).json({ message: "Error getting wellness stats" });
      }
    });
  }
};