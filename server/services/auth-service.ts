import type { Request, Response } from "express";
import { storage } from "../storage";
import bcrypt from "bcrypt";
import passport from "passport";
import { insertUserSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export const authService = {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      // Validate request body against the schema
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Generate a unique referral code
      const referralCode = nanoid(10);
      
      // Create the user
      const user = await storage.insertUser({
        ...validatedData,
        password: hashedPassword,
        referralCode,
      });
      
      // Log in the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error after registration" });
        }
        
        // Return the user without the password
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Error registering user" });
    }
  },
  
  /**
   * Log in a user
   */
  async login(req: Request, res: Response) {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        
        // Return the user without the password
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res);
  },
  
  /**
   * Log out the current user
   */
  async logout(req: Request, res: Response) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Session destruction error" });
        }
        return res.status(200).json({ message: "Logged out successfully" });
      });
    });
  },
  
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUserById((req.user as any).id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving user" });
    }
  }
};
