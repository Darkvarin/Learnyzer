import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "../db";
import crypto from "crypto";

// Type declaration for Express session
declare global {
  namespace Express {
    // Define User properties without circular reference
    interface User {
      id: number;
      username: string;
      name: string;
      email: string;
      profileImage: string | null;
      grade: string | null;
      track: string | null;
      level: number;
      currentXp: number;
      nextLevelXp: number;
      rank: string;
      rankPoints: number;
      streakDays: number;
      lastStreakDate: Date | null;
      referralCode: string;
      createdAt: Date;
    }
  }
}

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt);

// Set up PostgreSQL session store
const PostgresSessionStore = connectPg(session);
const sessionStore = new PostgresSessionStore({ 
  pool, 
  createTableIfMissing: true,
  tableName: 'user_sessions'
});

// Function to hash a password
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Function to compare a password with a stored hash
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Set up authentication for the Express app
export function setupAuth(app: Express) {
  // Session configuration with proper security
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "learnity-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: 'learnyzer.session', // Custom session name
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours (reduced from 30 days for security)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      sameSite: process.env.NODE_ENV === "production" ? 'strict' : 'lax', // CSRF protection
    },
    genid: () => {
      // Generate unique session IDs to prevent conflicts
      return crypto.randomBytes(32).toString('hex');
    }
  };

  // Set up session middleware with proper proxy trust
  app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Add session cleanup middleware
  app.use((req: any, res: any, next: any) => {
    // Regenerate session ID on login to prevent session fixation
    if (req.path === '/api/auth/login' && req.method === 'POST') {
      req.session.regenerate((err: any) => {
        if (err) {
          console.error('Session regeneration failed:', err);
        }
        next();
      });
    } else {
      next();
    }
  });

  // Set up local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      if (!user) {
        // User was deleted, clear the session
        done(null, false);
        return;
      }
      done(null, user);
    } catch (error) {
      // If user not found, clear the session instead of throwing error
      done(null, false);
    }
  });

  // Authentication routes
  // Register a new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Generate a random referral code
      const referralCode = randomBytes(4).toString("hex");

      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);

      // Create the user
      const user = await storage.insertUser({
        ...req.body,
        password: hashedPassword,
        referralCode
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        // Return user data without password
        const { password, ...userData } = user;
        return res.status(201).json(userData);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        // Return user data without password
        const { password, ...userData } = user;
        return res.json(userData);
      });
    })(req, res, next);
  });

  // Logout endpoint with proper session cleanup
  app.post("/api/auth/logout", (req, res) => {
    if (req.isAuthenticated()) {
      const sessionId = req.sessionID;
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        req.session.destroy((err) => {
          if (err) {
            console.error("Session destruction error:", err);
            return res.status(500).json({ message: "Session destruction failed" });
          }
          // Clear the session cookie properly
          res.clearCookie("learnyzer.session");
          res.clearCookie("connect.sid"); // Fallback for default cookie name
          console.log(`Session ${sessionId} destroyed for user logout`);
          return res.status(200).json({ message: "Logged out successfully" });
        });
      });
    } else {
      return res.status(200).json({ message: "Already logged out" });
    }
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Return user data without password
    const { password, ...userData } = req.user;
    return res.json(userData);
  });

  // Update user profile
  app.post("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      // Update user profile in the database
      const userId = req.user.id;
      const profileData = req.body;
      
      const updatedUser = await db.update(users)
        .set({
          name: profileData.name,
          email: profileData.email,
          profileImage: profileData.profileImage || null,
          grade: profileData.class,          // Store class/grade
          track: profileData.stream || null  // Store educational track/stream
        })
        .where(eq(users.id, userId))
        .returning();
        
      if (updatedUser.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the session user data
      req.user = updatedUser[0];
      
      return res.status(200).json(updatedUser[0]);
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // PATCH endpoint for profile settings page
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      // Update user profile in the database
      const userId = req.user.id;
      const profileData = req.body;
      
      const updatedUser = await db.update(users)
        .set({
          name: profileData.name,
          mobile: profileData.mobile || null,
          profileImage: profileData.profileImage || null,
          grade: profileData.class || profileData.grade, // Support both field names
          track: profileData.stream || profileData.track  // Support both field names
          // Note: email is not updatable as it was used for registration
        })
        .where(eq(users.id, userId))
        .returning();
        
      if (updatedUser.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the session user data
      req.user = updatedUser[0];
      
      return res.status(200).json(updatedUser[0]);
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Middleware for protected routes
  app.use("/api/user", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  });
}