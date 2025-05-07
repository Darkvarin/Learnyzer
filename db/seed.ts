import { db } from "./index";
import * as schema from "@shared/schema";
import { nanoid } from "nanoid";

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Seed AI Tutors
    console.log("Seeding AI tutors...");
    const aiTutors = [
      {
        name: "Akira",
        specialty: "Your Physics & Math AI Tutor",
        image: "https://cdn.jsdelivr.net/gh/lyqht/fake-api-images/avataaars/avatar1.svg",
        description: "Specialized in physics and mathematics, Akira helps you understand complex concepts with practical examples.",
        personalityTraits: JSON.stringify(["patient", "analytical", "encouraging"])
      },
      {
        name: "Meera",
        specialty: "Your Chemistry & Biology AI Tutor",
        image: "https://cdn.jsdelivr.net/gh/lyqht/fake-api-images/avataaars/avatar2.svg",
        description: "Meera specializes in chemistry and biology, making difficult concepts easy to understand with visual explanations.",
        personalityTraits: JSON.stringify(["enthusiastic", "detail-oriented", "creative"])
      },
      {
        name: "Rahul",
        specialty: "Your Humanities & Languages AI Tutor",
        image: "https://cdn.jsdelivr.net/gh/lyqht/fake-api-images/avataaars/avatar3.svg",
        description: "Rahul excels in history, geography, literature, and languages, helping you with essay writing and critical analysis.",
        personalityTraits: JSON.stringify(["eloquent", "thoughtful", "supportive"])
      }
    ];
    
    // Check if tutors already exist
    const existingTutor = await db.query.aiTutors.findFirst();
    
    if (!existingTutor) {
      for (const tutor of aiTutors) {
        await db.insert(schema.aiTutors).values(tutor);
      }
      console.log(`✅ Added ${aiTutors.length} AI tutors`);
    } else {
      console.log("⏩ AI tutors already exist, skipping...");
    }

    // Seed AI Tools
    console.log("Seeding AI tools...");
    const aiTools = [
      {
        name: "Study Notes Generator",
        description: "Create personalized notes from any study material",
        color: "primary",
        features: JSON.stringify([
          "Custom formatting options",
          "Export to PDF or Word",
          "Include diagrams and visual aids",
          "Simplified explanations for complex topics"
        ])
      },
      {
        name: "Answer Checker",
        description: "Get feedback on your answers to practice questions",
        color: "success",
        features: JSON.stringify([
          "Detailed explanations of mistakes",
          "Alternative solution methods",
          "Scoring based on accuracy and approach",
          "Improvement suggestions"
        ])
      },
      {
        name: "Flashcard Creator",
        description: "Generate study flashcards for quick revision",
        color: "warning",
        features: JSON.stringify([
          "Automated card creation from your notes",
          "Spaced repetition scheduling",
          "Quiz mode for self-testing",
          "Visual and mnemonic aids"
        ])
      },
      {
        name: "Performance Insights",
        description: "AI analysis of your progress and learning patterns",
        color: "info",
        features: JSON.stringify([
          "Identify knowledge gaps",
          "Personalized study recommendations",
          "Time management suggestions",
          "Comparative analysis with peers"
        ])
      }
    ];
    
    // Check if tools already exist
    const existingTool = await db.query.aiTools.findFirst();
    
    if (!existingTool) {
      for (const tool of aiTools) {
        await db.insert(schema.aiTools).values(tool);
      }
      console.log(`✅ Added ${aiTools.length} AI tools`);
    } else {
      console.log("⏩ AI tools already exist, skipping...");
    }

    // Seed Course Categories
    console.log("Seeding course categories...");
    const courseCategories = [
      {
        name: "School (Classes 3-12)",
        description: "Curriculum for elementary to high school students following CBSE, ICSE, and state boards"
      },
      {
        name: "Engineering Entrance",
        description: "Preparation material for JEE Main, JEE Advanced, and other engineering entrance exams"
      },
      {
        name: "Medical Entrance",
        description: "Preparation material for NEET and other medical entrance exams"
      },
      {
        name: "Civil Services",
        description: "Preparation material for UPSC Civil Services and other administrative exams"
      },
      {
        name: "Law Entrance",
        description: "Preparation material for CLAT and other law entrance exams"
      },
      {
        name: "Higher Education",
        description: "University-level courses for various degree programs"
      }
    ];
    
    // Check if categories already exist
    const existingCategory = await db.query.courseCategories.findFirst();
    
    if (!existingCategory) {
      for (const category of courseCategories) {
        await db.insert(schema.courseCategories).values(category);
      }
      console.log(`✅ Added ${courseCategories.length} course categories`);
    } else {
      console.log("⏩ Course categories already exist, skipping...");
    }

    // Seed Courses
    console.log("Seeding courses...");
    const courses = [
      {
        title: "Calculus Fundamentals",
        description: "Master differentiation, integration, and applications of calculus for JEE and other engineering entrance exams.",
        subject: "Mathematics",
        examType: "JEE",
        coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3",
        chapters: 10,
        difficulty: "Advanced"
      },
      {
        title: "Chemical Bonding",
        description: "Learn about different types of chemical bonds, molecular geometry, and hybridization for NEET preparation.",
        subject: "Chemistry",
        examType: "NEET",
        coverImage: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3",
        chapters: 8,
        difficulty: "Intermediate"
      },
      {
        title: "Mechanics & Thermodynamics",
        description: "Comprehensive coverage of mechanics, fluid dynamics, and thermodynamics with problem-solving techniques.",
        subject: "Physics",
        examType: "JEE",
        coverImage: "https://images.unsplash.com/photo-1636466497217-26a42e75f996?ixlib=rb-4.0.3",
        chapters: 12,
        difficulty: "Advanced"
      },
      {
        title: "Human Physiology",
        description: "Detailed study of human organ systems, their functions, and related disorders for NEET preparation.",
        subject: "Biology",
        examType: "NEET",
        coverImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3",
        chapters: 9,
        difficulty: "Intermediate"
      },
      {
        title: "Indian Constitution",
        description: "Comprehensive analysis of the Indian Constitution for UPSC Civil Services preparation.",
        subject: "Polity",
        examType: "UPSC",
        coverImage: "https://images.unsplash.com/photo-1594394489098-acef21cbfb86?ixlib=rb-4.0.3",
        chapters: 15,
        difficulty: "Advanced"
      },
      {
        title: "Data Structures & Algorithms",
        description: "Learn essential data structures and algorithms with practical implementation in competitive programming.",
        subject: "Computer Science",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3",
        chapters: 14,
        difficulty: "Intermediate"
      }
    ];
    
    // Check if courses already exist
    const existingCourse = await db.query.courses.findFirst();
    
    if (!existingCourse) {
      for (const course of courses) {
        await db.insert(schema.courses).values(course);
      }
      console.log(`✅ Added ${courses.length} courses`);
    } else {
      console.log("⏩ Courses already exist, skipping...");
    }

    // Seed Streak Goals
    console.log("Seeding streak goals...");
    const streakGoals = [
      {
        description: "Complete 1 lesson",
        target: 1
      },
      {
        description: "Solve 5 practice problems",
        target: 5
      },
      {
        description: "Complete 1 AI tutor session",
        target: 1
      },
      {
        description: "Take 1 quiz",
        target: 1
      },
      {
        description: "Study for 30 minutes",
        target: 30
      }
    ];
    
    // Check if streak goals already exist
    const existingStreakGoal = await db.query.streakGoals.findFirst();
    
    if (!existingStreakGoal) {
      for (const goal of streakGoals) {
        await db.insert(schema.streakGoals).values(goal);
      }
      console.log(`✅ Added ${streakGoals.length} streak goals`);
    } else {
      console.log("⏩ Streak goals already exist, skipping...");
    }

    // Seed Achievements
    console.log("Seeding achievements...");
    const achievements = [
      {
        name: "First Step",
        description: "Complete your first lesson",
        category: "Learning",
        icon: "ri-footprint-line",
        target: 1,
        xpReward: 100
      },
      {
        name: "Streak Master",
        description: "Maintain a 7-day learning streak",
        category: "Consistency",
        icon: "ri-calendar-check-line",
        target: 7,
        xpReward: 200
      },
      {
        name: "Battle Veteran",
        description: "Win 5 battles against other students",
        category: "Competition",
        icon: "ri-sword-line",
        target: 5,
        xpReward: 300
      },
      {
        name: "Knowledge Seeker",
        description: "Complete 10 different lessons",
        category: "Learning",
        icon: "ri-book-open-line",
        target: 10,
        xpReward: 250
      },
      {
        name: "Problem Solver",
        description: "Solve 100 practice problems correctly",
        category: "Practice",
        icon: "ri-question-answer-line",
        target: 100,
        xpReward: 500
      },
      {
        name: "AI Companion",
        description: "Have 20 conversations with AI tutors",
        category: "AI",
        icon: "ri-robot-line",
        target: 20,
        xpReward: 300
      }
    ];
    
    // Check if achievements already exist
    const existingAchievement = await db.query.achievements.findFirst();
    
    if (!existingAchievement) {
      for (const achievement of achievements) {
        await db.insert(schema.achievements).values(achievement);
      }
      console.log(`✅ Added ${achievements.length} achievements`);
    } else {
      console.log("⏩ Achievements already exist, skipping...");
    }

    // Seed Rewards
    console.log("Seeding rewards...");
    const rewards = [
      {
        name: "Golden Frame",
        description: "A premium golden profile frame to showcase your elite status",
        type: "Profile Frame",
        image: "https://cdn.jsdelivr.net/gh/lyqht/fake-api-images/backgrounds/gold-frame.svg",
        cost: 1000,
        featured: true
      },
      {
        name: "Diamond Badge",
        description: "Display a sparkling diamond badge on your profile",
        type: "Badge",
        image: "https://cdn.jsdelivr.net/gh/lyqht/fake-api-images/backgrounds/diamond-badge.svg",
        cost: 1500,
        featured: false
      },
      {
        name: "JEE Champion",
        description: "Special badge for top JEE performers",
        type: "Badge",
        image: "https://cdn.jsdelivr.net/gh/lyqht/fake-api-images/backgrounds/jee-badge.svg",
        cost: 2000,
        featured: false
      },
      {
        name: "Royal Purple Theme",
        description: "Customize your interface with a royal purple color scheme",
        type: "Theme",
        image: "https://cdn.jsdelivr.net/gh/lyqht/fake-api-images/backgrounds/purple-theme.svg",
        cost: 800,
        featured: true
      }
    ];
    
    // Check if rewards already exist
    const existingReward = await db.query.rewards.findFirst();
    
    if (!existingReward) {
      for (const reward of rewards) {
        await db.insert(schema.rewards).values(reward);
      }
      console.log(`✅ Added ${rewards.length} rewards`);
    } else {
      console.log("⏩ Rewards already exist, skipping...");
    }

    // Create a demo user if one doesn't exist
    console.log("Creating demo user if doesn't exist...");
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "demo")
    });
    
    if (!existingUser) {
      const demoUser = {
        username: "demo",
        password: "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm", // password is 'password'
        name: "Aryan Sharma",
        email: "aryan@example.com",
        profileImage: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?ixlib=rb-4.0.3",
        track: "JEE Advanced Track",
        level: 27,
        currentXp: 4350,
        nextLevelXp: 6000,
        rank: "Gold II",
        rankPoints: 750,
        streakDays: 24,
        lastStreakDate: new Date(),
        referralCode: nanoid(10)
      };
      
      await db.insert(schema.users).values(demoUser);
      console.log("✅ Created demo user");
      
      // Get the created user
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, "demo")
      });
      
      if (user) {
        // Add some course progress for the demo user
        const allCourses = await db.query.courses.findMany();
        
        if (allCourses.length > 0) {
          await db.insert(schema.userCourses).values([
            {
              userId: user.id,
              courseId: allCourses[0].id,
              currentChapter: "Chapter 3: Integration Methods",
              progress: 68,
              lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
              userId: user.id,
              courseId: allCourses[1].id,
              currentChapter: "Chapter 2: Covalent Bonds",
              progress: 34,
              lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
            }
          ]);
          console.log("✅ Added course progress for demo user");
        }
        
        // Add some AI conversation history
        const aiTutor = await db.query.aiTutors.findFirst();
        
        if (aiTutor) {
          const messages = [
            {
              role: "assistant",
              content: "Hello Aryan! I see you've been working on calculus problems lately. You're making good progress, but I've noticed you're struggling with integration by parts. Would you like me to create a personalized practice session for that?",
              timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
            },
            {
              role: "user",
              content: "Yes, that would be great! Could you also include some examples related to physics applications?",
              timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
            }
          ];
          
          await db.insert(schema.conversations).values({
            userId: user.id,
            aiTutorId: aiTutor.id,
            messages: JSON.stringify(messages),
            updatedAt: new Date()
          });
          console.log("✅ Added AI conversation history for demo user");
        }
        
        // Create some active battles
        await db.insert(schema.battles).values([
          {
            title: "Physics Challenge",
            type: "1v1",
            duration: 20,
            topics: JSON.stringify(["Mechanics", "Electromagnetism"]),
            rewardPoints: 250,
            status: "waiting",
            createdBy: user.id
          },
          {
            title: "Math Team Battle",
            type: "2v2",
            duration: 30,
            topics: JSON.stringify(["Calculus", "Algebra", "Probability"]),
            rewardPoints: 400,
            status: "waiting",
            createdBy: user.id
          }
        ]);
        console.log("✅ Created active battles");
      }
    } else {
      console.log("⏩ Demo user already exists, skipping...");
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
