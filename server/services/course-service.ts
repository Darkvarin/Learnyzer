import type { Request, Response } from "express";
import { storage } from "../storage";
import { insertCourseSchema } from "@shared/schema";
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

export const courseService = {
  /**
   * Get all courses with optional filters
   */
  // Helper function to determine if a course is appropriate for the student's grade
  // Defined outside of the route handler to avoid ES5 strict mode issues
  isGradeAppropriate(course: any, grade: string, ignoreLevelFilter: boolean): boolean {
    if (!grade || ignoreLevelFilter) return true; // If no grade or filtering disabled, show all courses
    
    // First, check if the course has the targetGrade field
    if (course.targetGrade) {
      // Direct match for specific grade
      if (course.targetGrade === grade) {
        return true;
      }
      
      // Handle range-based cases like "11-12-science"
      if (typeof course.targetGrade === 'string' && course.targetGrade.includes("-")) {
        const parts = course.targetGrade.split("-");
        
        // Stream-specific courses for 11th and 12th grades
        if (parts.length === 3 && parts[0] === "11" && parts[1] === "12") {
          // Check if student's grade matches stream requirement
          if ((grade === "11" || grade === "12") && 
              typeof grade === 'string' && grade.includes(parts[2])) {
            return true;
          }
          
          // If student is in 11 or 12 but no stream specified, show courses 
          // from all streams to avoid hiding content
          if (grade === "11" || grade === "12") {
            return true;
          }
        }
        
        // Simple grade range like "3-5"
        if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
          const minGrade = parseInt(parts[0]);
          const maxGrade = parseInt(parts[1]);
          
          if (/^\d+$/.test(grade)) {
            const studentGrade = parseInt(grade);
            return studentGrade >= minGrade && studentGrade <= maxGrade;
          }
        }
      }
      
      // Handle numeric grades
      if (typeof course.targetGrade === 'string' && typeof grade === 'string' && 
          /^\d+$/.test(course.targetGrade) && /^\d+$/.test(grade)) {
        // For specific numeric grades, only exact matches or lower grades
        const courseGrade = parseInt(course.targetGrade);
        const studentGrade = parseInt(grade);
        
        // Only show courses for the student's current grade or lower grades
        // This ensures students don't see advanced content for grades they haven't reached
        return studentGrade >= courseGrade;
      }
      
      // Grade doesn't match, but we have targetGrade information
      return false;
    }
    
    // Fallback to older logic if targetGrade is not available
    
    // Convert grade to number if it's a regular class
    let gradeLevel = 0;
    if (/^\d+$/.test(grade)) {
      gradeLevel = parseInt(grade);
    } else if (grade === 'undergraduate') {
      gradeLevel = 13; // Higher than 12th grade
    } else if (grade === 'postgraduate') {
      gradeLevel = 15; // Higher than undergraduate
    }
    
    // If no grade level in course, use exam type as a proxy
    if (course.examType === 'JEE' || course.examType === 'NEET' || 
        course.examType === 'UPSC' || course.examType === 'CLAT') {
      return gradeLevel >= 11; // These are for 11th and above
    }
    
    // For regular courses, we can infer from the course title or subject
    const courseTitle = course.title.toLowerCase();
    
    // Check for grade-specific information in title
    const gradeMatch = courseTitle.match(/class (\d+)/i);
    if (gradeMatch) {
      const courseGradeLevel = parseInt(gradeMatch[1]);
      return gradeLevel >= courseGradeLevel;
    }
    
    return true; // If we can't determine, show the course
  },
  
  async getAllCourses(req: Request, res: Response) {
    try {
      const examType = req.query.exam as string;
      const subject = req.query.subject as string;
      const userGrade = req.query.grade as string || (req.user as any)?.grade;
      const ignoreLevelFilter = req.query.ignoreLevelFilter === 'true';
      
      // Get the courses with optional filters
      const courses = await storage.getAllCourses({
        examType: examType !== 'all' ? examType : undefined,
        subject: subject !== 'all' ? subject : undefined
      });
      
      // Filter courses by grade level if user is logged in and has a grade
      const filteredCourses = userGrade 
        ? courses.filter(course => courseService.isGradeAppropriate(course, userGrade, ignoreLevelFilter))
        : courses;
      
      // If the user is authenticated, add their progress to each course
      if (req.isAuthenticated() && req.user) {
        const userId = (req.user as any).id;
        const userProgress = await storage.getUserCourseProgress(userId);
        
        // Map user progress to filtered courses
        const coursesWithProgress = filteredCourses.map(course => {
          const progress = userProgress.find(p => p.courseId === course.id);
          return {
            ...course,
            currentChapter: progress?.currentChapter || null,
            progress: progress?.progress || 0,
            lastActivity: progress?.lastActivity || null,
            completedAt: progress?.completedAt || null
          };
        });
        
        return res.status(200).json(coursesWithProgress);
      }
      
      // Return filtered courses without progress for non-authenticated users
      return res.status(200).json(filteredCourses);
    } catch (error) {
      console.error("Get all courses error:", error);
      return res.status(500).json({ message: "Error retrieving courses" });
    }
  },
  
  /**
   * Get the user's recent courses
   */
  async getRecentCourses(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = (req.user as any).id;
      const recentCourses = await storage.getUserRecentCourses(userId);
      
      return res.status(200).json(recentCourses);
    } catch (error) {
      console.error("Get recent courses error:", error);
      return res.status(500).json({ message: "Error retrieving recent courses" });
    }
  },
  
  /**
   * Get all course categories
   */
  async getCourseCategories(req: Request, res: Response) {
    try {
      const categories = await storage.getCourseCategories();
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Get course categories error:", error);
      return res.status(500).json({ message: "Error retrieving course categories" });
    }
  },
  
  /**
   * Get a course by ID
   */
  async getCourseById(req: Request, res: Response) {
    try {
      const courseId = parseInt(req.params.id);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      const course = await storage.getCourseById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // If the user is authenticated, add their progress to the course
      if (req.isAuthenticated() && req.user) {
        const userId = (req.user as any).id;
        const progress = await storage.getUserCourseSingleProgress(userId, courseId);
        
        if (progress) {
          return res.status(200).json({
            ...course,
            currentChapter: progress.currentChapter,
            progress: progress.progress,
            lastActivity: progress.lastActivity,
            completedAt: progress.completedAt
          });
        }
      }
      
      return res.status(200).json({
        ...course,
        currentChapter: null,
        progress: 0,
        lastActivity: null,
        completedAt: null
      });
    } catch (error) {
      console.error("Get course by ID error:", error);
      return res.status(500).json({ message: "Error retrieving course" });
    }
  },
  
  /**
   * Enroll a user in a course
   */
  async enrollCourse(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const courseId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      // Check if the course exists
      const course = await storage.getCourseById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if the user is already enrolled
      const isEnrolled = await storage.isUserEnrolledInCourse(userId, courseId);
      
      if (isEnrolled) {
        return res.status(400).json({ message: "You are already enrolled in this course" });
      }
      
      // Enroll the user
      const enrollment = await storage.enrollUserInCourse(userId, courseId);
      
      // Update user's XP for enrolling in a course
      await storage.addUserXP(userId, 50); // 50 XP for enrolling in a course
      
      return res.status(201).json(enrollment);
    } catch (error) {
      console.error("Enroll course error:", error);
      return res.status(500).json({ message: "Error enrolling in course" });
    }
  },
  
  /**
   * Update a user's progress in a course
   */
  async updateCourseProgress(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const schema = z.object({
      currentChapter: z.string().optional(),
      progress: z.number().min(0).max(100),
      completed: z.boolean().optional()
    });
    
    try {
      const courseId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      const progressData = schema.parse(req.body);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      // Check if the user is enrolled in the course
      const isEnrolled = await storage.isUserEnrolledInCourse(userId, courseId);
      
      if (!isEnrolled) {
        return res.status(404).json({ message: "You are not enrolled in this course" });
      }
      
      // Get the current progress
      const currentProgress = await storage.getUserCourseSingleProgress(userId, courseId);
      
      // Calculate XP to award based on progress increase
      let xpToAward = 0;
      if (currentProgress && progressData.progress > currentProgress.progress) {
        const progressIncrease = progressData.progress - currentProgress.progress;
        xpToAward = Math.floor(progressIncrease * 10); // 10 XP per 1% progress
      }
      
      // If the course is being completed for the first time, award bonus XP
      if (progressData.completed && currentProgress && !currentProgress.completed) {
        xpToAward += 500; // 500 XP bonus for completing a course
      }
      
      // Update the progress
      const updatedProgress = await storage.updateUserCourseProgress(userId, courseId, {
        currentChapter: progressData.currentChapter,
        progress: progressData.progress,
        completed: progressData.completed,
        completedAt: progressData.completed ? new Date() : undefined
      });
      
      // Award XP if needed
      if (xpToAward > 0) {
        await storage.addUserXP(userId, xpToAward);
        
        // Update streak goals if applicable
        await storage.updateStreakGoalProgress(userId, 'Complete 1 lesson', 1);
      }
      
      return res.status(200).json(updatedProgress);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Update course progress error:", error);
      return res.status(500).json({ message: "Error updating course progress" });
    }
  }
};
