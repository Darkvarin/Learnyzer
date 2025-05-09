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
        name: "Performance Analytics",
        description: "AI-powered visualization and analysis of your learning progress",
        color: "green",
        features: JSON.stringify([
          "Interactive visualizations and graphs",
          "Time pattern analysis for optimal study times",
          "Skill distribution across learning domains",
          "Personalized action plan with targeted improvements",
          "Strength and weakness identification"
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
        name: "Central University Entrance",
        description: "Preparation material for CUET and other university entrance exams"
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
    
    // Entrance Exam Courses
    const entranceExamCourses = [
      // JEE Courses
      {
        title: "Calculus Fundamentals for JEE",
        description: "Master differentiation, integration, and applications of calculus for JEE and other engineering entrance exams.",
        subject: "Mathematics",
        examType: "JEE",
        coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "11-12",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Limits and Continuity", description: "Understanding limits, continuity, and discontinuities." },
          { title: "Chapter 2: Differentiation Basics", description: "Rules of differentiation and basic applications." },
          { title: "Chapter 3: Applications of Derivatives", description: "Rate of change, tangents, normals, and approximations." },
          { title: "Chapter 4: Maxima and Minima", description: "Extrema of functions and optimization problems." },
          { title: "Chapter 5: Integration Techniques", description: "Methods of integration and definite integrals." },
          { title: "Chapter 6: Applications of Integrals", description: "Area, volume, and physical applications." },
          { title: "Chapter 7: Differential Equations", description: "First-order differential equations and applications." },
          { title: "Chapter 8: Multivariable Calculus", description: "Partial derivatives and multiple integrals." },
          { title: "Chapter 9: Vector Calculus", description: "Vector functions, gradients, and line integrals." },
          { title: "Chapter 10: Problem Solving for JEE", description: "Advanced problems and exam strategies." }
        ])
      },
      {
        title: "Mechanics for JEE",
        description: "Comprehensive coverage of Newtonian mechanics, rotational dynamics, and mechanical properties for JEE preparation.",
        subject: "Physics",
        examType: "JEE",
        coverImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3",
        chapters: 12,
        targetGrade: "11-12",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Units, Dimensions and Vectors", description: "Physical quantities, SI units, and vector algebra." },
          { title: "Chapter 2: Kinematics", description: "Motion in one and two dimensions, relative motion." },
          { title: "Chapter 3: Newton's Laws of Motion", description: "Force, inertia, and applications of Newton's laws." },
          { title: "Chapter 4: Friction", description: "Static and kinetic friction, rolling friction, and applications." },
          { title: "Chapter 5: Work, Energy and Power", description: "Conservation of energy and work-energy theorem." },
          { title: "Chapter 6: Center of Mass and Collisions", description: "Elastic and inelastic collisions in one and two dimensions." },
          { title: "Chapter 7: Rotational Dynamics", description: "Torque, angular momentum, and moment of inertia." },
          { title: "Chapter 8: Gravitation", description: "Gravitational field, potential energy, and orbital motion." },
          { title: "Chapter 9: Elasticity", description: "Stress, strain, elastic moduli, and Poisson's ratio." },
          { title: "Chapter 10: Fluid Mechanics", description: "Pressure, buoyancy, viscosity, and flow dynamics." },
          { title: "Chapter 11: Oscillations", description: "Simple, damped, and forced harmonic motion." },
          { title: "Chapter 12: JEE Problem Solving", description: "Advanced problems from previous JEE papers." }
        ])
      },
      {
        title: "Organic Chemistry for JEE",
        description: "Master organic reactions, mechanisms, and problem-solving techniques essential for JEE Advanced.",
        subject: "Chemistry",
        examType: "JEE",
        coverImage: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "11-12",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Basic Concepts of Organic Chemistry", description: "Hybridization, isomerism, and nomenclature." },
          { title: "Chapter 2: Reaction Mechanisms", description: "Nucleophilic and electrophilic substitution, addition, and elimination." },
          { title: "Chapter 3: Hydrocarbons", description: "Alkanes, alkenes, alkynes, and aromatic compounds." },
          { title: "Chapter 4: Haloalkanes and Haloarenes", description: "Preparation, properties, and reactions." },
          { title: "Chapter 5: Alcohols, Phenols and Ethers", description: "Structure, properties, and chemical reactions." },
          { title: "Chapter 6: Carbonyl Compounds", description: "Aldehydes, ketones, and their reactions." },
          { title: "Chapter 7: Carboxylic Acids and Derivatives", description: "Preparation and properties of acids, esters, and amides." },
          { title: "Chapter 8: Nitrogen Compounds", description: "Amines, diazonium salts, and nitro compounds." },
          { title: "Chapter 9: Biomolecules", description: "Carbohydrates, proteins, nucleic acids, and lipids." },
          { title: "Chapter 10: JEE Practice Problems", description: "Advanced problems and previous years' questions." }
        ])
      },
      {
        title: "Chemical Bonding for NEET",
        description: "Learn about different types of chemical bonds, molecular geometry, and hybridization for NEET preparation.",
        subject: "Chemistry",
        examType: "NEET",
        coverImage: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3",
        chapters: 8,
        targetGrade: "11-12",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Ionic Bonding", description: "Formation, properties, and energetics of ionic bonds." },
          { title: "Chapter 2: Covalent Bonding", description: "Lewis structures, bond parameters, and polar covalent bonds." },
          { title: "Chapter 3: VSEPR Theory", description: "Molecular geometry predictions and examples." },
          { title: "Chapter 4: Valence Bond Theory", description: "Orbital concept and hybridization." },
          { title: "Chapter 5: Molecular Orbital Theory", description: "Linear combination of atomic orbitals and bonding/antibonding orbitals." },
          { title: "Chapter 6: Resonance", description: "Resonance structures and stability of molecules." },
          { title: "Chapter 7: Metallic Bonding", description: "Free electron theory and band theory." },
          { title: "Chapter 8: NEET Practice Problems", description: "Previous years' questions and problem-solving strategies." }
        ])
      },
      {
        title: "Science for Class 4",
        description: "Explore the natural world through topics like plants, animals, matter, energy, and the environment.",
        subject: "Science",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1532094349884-543019a69b2f?ixlib=rb-4.0.3",
        chapters: 9,
        targetGrade: "4",
        difficulty: "Beginner",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Plants", description: "Parts of plants, photosynthesis, and plant adaptations." },
          { title: "Chapter 2: Animals", description: "Animal habitats, adaptations, and life cycles." },
          { title: "Chapter 3: Human Body", description: "Body systems and their functions." },
          { title: "Chapter 4: Food and Nutrition", description: "Food groups, balanced diet, and digestion." },
          { title: "Chapter 5: Matter and Materials", description: "Properties of matter and common materials." },
          { title: "Chapter 6: Force and Energy", description: "Different types of forces and energy forms." },
          { title: "Chapter 7: Light and Sound", description: "Properties and behavior of light and sound." },
          { title: "Chapter 8: Earth and Space", description: "Earth's features, day and night, and seasons." },
          { title: "Chapter 9: Environment and Conservation", description: "Protecting our environment and natural resources." }
        ])
      },
      {
        title: "Social Studies for Class 5",
        description: "Learn about India's geography, history, and culture through engaging lessons and activities.",
        subject: "Social Studies",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1594394489098-acef21cbfb86?ixlib=rb-4.0.3",
        chapters: 8,
        targetGrade: "5",
        difficulty: "Beginner",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: India - Physical Features", description: "Mountains, rivers, plains, and plateaus of India." },
          { title: "Chapter 2: Climate of India", description: "Different climate zones and seasons in India." },
          { title: "Chapter 3: Natural Vegetation and Wildlife", description: "Forests, wildlife, and conservation efforts." },
          { title: "Chapter 4: Early Civilizations", description: "Indus Valley Civilization and early settlements." },
          { title: "Chapter 5: Ancient India", description: "Mauryan and Gupta Empires and their contributions." },
          { title: "Chapter 6: Medieval India", description: "Delhi Sultanate and Mughal Empire." },
          { title: "Chapter 7: British Rule in India", description: "Colonization and the freedom struggle." },
          { title: "Chapter 8: Independent India", description: "India after independence and major developments." }
        ])
      },
      
      // Middle School (6-8) Courses
      {
        title: "Mathematics for Class 6",
        description: "Advance your mathematical skills with integers, algebra, geometry, and data handling concepts.",
        subject: "Mathematics",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "6",
        difficulty: "Intermediate",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Knowing Our Numbers", description: "Large numbers, estimation, and number operations." },
          { title: "Chapter 2: Whole Numbers", description: "Properties of whole numbers and operations." },
          { title: "Chapter 3: Integers", description: "Introduction to negative numbers and operations with integers." },
          { title: "Chapter 4: Fractions and Decimals", description: "Advanced operations with fractions and decimals." },
          { title: "Chapter 5: Introduction to Algebra", description: "Variables, expressions, and simple equations." },
          { title: "Chapter 6: Ratio and Proportion", description: "Understanding ratios and solving proportion problems." },
          { title: "Chapter 7: Geometry", description: "Lines, angles, triangles, and quadrilaterals." },
          { title: "Chapter 8: Mensuration", description: "Perimeter and area of 2D shapes." },
          { title: "Chapter 9: Data Handling", description: "Collection, organization, and representation of data." },
          { title: "Chapter 10: Practical Geometry", description: "Constructing geometric figures using tools." }
        ])
      },
      {
        title: "Science for Class 7",
        description: "Deepen your understanding of scientific concepts through nutrition, motion, heat, acids, and more.",
        subject: "Science",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1532094349884-543019a69b2f?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "7",
        difficulty: "Intermediate",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Nutrition in Plants and Animals", description: "Photosynthesis, nutrients, and digestion." },
          { title: "Chapter 2: Fibre to Fabric", description: "Natural and synthetic fibres and fabric production." },
          { title: "Chapter 3: Heat and Temperature", description: "Heat transfer, expansion, and contraction." },
          { title: "Chapter 4: Acids, Bases, and Salts", description: "Properties and indicators of acids and bases." },
          { title: "Chapter 5: Physical and Chemical Changes", description: "Distinguishing between physical and chemical changes." },
          { title: "Chapter 6: Weather and Climate", description: "Factors affecting weather and climate patterns." },
          { title: "Chapter 7: Motion and Time", description: "Speed, distance, time, and graphical representations." },
          { title: "Chapter 8: Electric Current and Circuits", description: "Simple electric circuits and components." },
          { title: "Chapter 9: Light", description: "Reflection, mirrors, and lenses." },
          { title: "Chapter 10: Reproduction in Plants", description: "Sexual and asexual reproduction in plants." }
        ])
      },
      {
        title: "Social Science for Class 8",
        description: "Explore Indian history, geography, civics, and economics through comprehensive lessons.",
        subject: "Social Science",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1594394489098-acef21cbfb86?ixlib=rb-4.0.3",
        chapters: 12,
        targetGrade: "8",
        difficulty: "Intermediate",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: The Indian Constitution", description: "Key features and fundamental rights." },
          { title: "Chapter 2: Parliamentary Government", description: "Structure and functioning of Indian democracy." },
          { title: "Chapter 3: Judiciary", description: "Indian judicial system and its functions." },
          { title: "Chapter 4: Modern Period in Indian History", description: "British colonization and its impact." },
          { title: "Chapter 5: Freedom Struggle", description: "Key movements and leaders in India's independence struggle." },
          { title: "Chapter 6: Resources", description: "Types of resources and their conservation." },
          { title: "Chapter 7: Industries", description: "Types of industries and their importance in economy." },
          { title: "Chapter 8: Human Resources", description: "Population, migration, and human development." },
          { title: "Chapter 9: Rise of Nationalism", description: "Nationalism in Europe and its influence on India." },
          { title: "Chapter 10: Agriculture", description: "Farming practices, crops, and agricultural challenges." },
          { title: "Chapter 11: Urbanization", description: "Growth of cities and related issues." },
          { title: "Chapter 12: Public Facilities", description: "Water, sanitation, and public infrastructure." }
        ])
      },
      
      // High School (9-10) Courses
      {
        title: "Mathematics for Class 9",
        description: "Master algebraic equations, coordinate geometry, statistics, and more complex mathematical concepts.",
        subject: "Mathematics",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "9",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Number Systems", description: "Real numbers, irrational numbers, and operations." },
          { title: "Chapter 2: Polynomials", description: "Algebraic expressions, factorization, and identities." },
          { title: "Chapter 3: Coordinate Geometry", description: "Cartesian system and plotting points." },
          { title: "Chapter 4: Linear Equations", description: "Solving linear equations in two variables." },
          { title: "Chapter 5: Triangles", description: "Congruence, similarity, and properties of triangles." },
          { title: "Chapter 6: Quadrilaterals", description: "Properties of parallelograms and special quadrilaterals." },
          { title: "Chapter 7: Circles", description: "Properties of circles, chords, and arcs." },
          { title: "Chapter 8: Surface Areas and Volumes", description: "Formulas for 3D shapes and solving problems." },
          { title: "Chapter 9: Statistics", description: "Measures of central tendency and graphical representation." },
          { title: "Chapter 10: Probability", description: "Basic probability concepts and experimental probability." }
        ])
      },
      {
        title: "Physics for Class 10",
        description: "Study mechanics, electricity, magnetism, and optics through theory and practical experiments.",
        subject: "Physics",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1636466497217-26a42e75f996?ixlib=rb-4.0.3",
        chapters: 8,
        targetGrade: "10",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Motion", description: "Uniform and non-uniform motion, acceleration, and graphical analysis." },
          { title: "Chapter 2: Force and Laws of Motion", description: "Newton's laws and applications." },
          { title: "Chapter 3: Work, Energy, and Power", description: "Different forms of energy and energy conservation." },
          { title: "Chapter 4: Electricity", description: "Electric current, potential difference, and circuits." },
          { title: "Chapter 5: Magnetic Effects of Current", description: "Electromagnets, motors, and generators." },
          { title: "Chapter 6: Light - Reflection and Refraction", description: "Laws of reflection and refraction, lenses." },
          { title: "Chapter 7: The Human Eye", description: "Structure, functioning, and defects of the human eye." },
          { title: "Chapter 8: Sources of Energy", description: "Conventional and alternative energy sources." }
        ])
      },
      {
        title: "Chemistry for Class 10",
        description: "Learn about chemical reactions, acids, bases, metals, carbon compounds, and periodic properties.",
        subject: "Chemistry",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3",
        chapters: 7,
        targetGrade: "10",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Chemical Reactions", description: "Types of reactions and balanced chemical equations." },
          { title: "Chapter 2: Acids, Bases, and Salts", description: "Properties, reactions, and pH scale." },
          { title: "Chapter 3: Metals and Non-metals", description: "Physical and chemical properties and reactivity series." },
          { title: "Chapter 4: Carbon and its Compounds", description: "Organic chemistry basics and functional groups." },
          { title: "Chapter 5: Periodic Classification of Elements", description: "Development of periodic table and periodic trends." },
          { title: "Chapter 6: Life Processes", description: "Nutrition, respiration, and transport in living organisms." },
          { title: "Chapter 7: Control and Coordination", description: "Nervous system and hormones in animals and plants." }
        ])
      },
      
      // Higher Secondary (11-12) Science Stream
      {
        title: "Mathematics for Class 11 (Science)",
        description: "Advanced mathematical concepts including calculus, trigonometry, probability, and statistics.",
        subject: "Mathematics",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "11-science",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Sets and Functions", description: "Set theory, relations, and functions." },
          { title: "Chapter 2: Trigonometric Functions", description: "Angles, trigonometric ratios, and identities." },
          { title: "Chapter 3: Complex Numbers", description: "Algebraic properties, polar form, and applications." },
          { title: "Chapter 4: Linear Inequalities", description: "Solving and graphing linear inequalities." },
          { title: "Chapter 5: Permutations and Combinations", description: "Counting principles and applications." },
          { title: "Chapter 6: Binomial Theorem", description: "Binomial expansion and applications." },
          { title: "Chapter 7: Sequences and Series", description: "Arithmetic and geometric progressions." },
          { title: "Chapter 8: Straight Lines", description: "Different forms of equations of lines and applications." },
          { title: "Chapter 9: Conic Sections", description: "Circles, parabolas, ellipses, and hyperbolas." },
          { title: "Chapter 10: Limits and Derivatives", description: "Introduction to calculus concepts." }
        ])
      },
      {
        title: "Physics for Class 11 (Science)",
        description: "Comprehensive study of mechanics, thermodynamics, waves, and optics with problem-solving approach.",
        subject: "Physics",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1636466497217-26a42e75f996?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "11-science",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Physical World and Measurement", description: "Units, dimensions, and error analysis." },
          { title: "Chapter 2: Kinematics", description: "Motion in straight line and plane." },
          { title: "Chapter 3: Laws of Motion", description: "Newton's laws and applications." },
          { title: "Chapter 4: Work, Energy, and Power", description: "Energy conservation and transformations." },
          { title: "Chapter 5: Rotational Motion", description: "Torque, angular momentum, and equilibrium." },
          { title: "Chapter 6: Gravitation", description: "Kepler's laws and gravitational field." },
          { title: "Chapter 7: Properties of Solids and Liquids", description: "Elasticity, surface tension, and fluid mechanics." },
          { title: "Chapter 8: Thermodynamics", description: "Heat, work, and laws of thermodynamics." },
          { title: "Chapter 9: Oscillations", description: "Simple harmonic motion and applications." },
          { title: "Chapter 10: Waves", description: "Wave propagation, superposition, and standing waves." }
        ])
      },
      
      // Higher Secondary (11-12) Commerce Stream
      {
        title: "Economics for Class 11 (Commerce)",
        description: "Introduction to micro and macroeconomics concepts, markets, and Indian economic development.",
        subject: "Economics",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1607944024060-0450380ddd33?ixlib=rb-4.0.3",
        chapters: 8,
        targetGrade: "11-commerce",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Introduction to Economics", description: "Basic concepts and economic problems." },
          { title: "Chapter 2: Consumer Behavior and Demand", description: "Utility, demand theory, and elasticity." },
          { title: "Chapter 3: Production and Costs", description: "Production functions and cost analysis." },
          { title: "Chapter 4: Market Structures", description: "Perfect competition, monopoly, and oligopoly." },
          { title: "Chapter 5: Income and Employment", description: "National income accounting and determination." },
          { title: "Chapter 6: Money and Banking", description: "Money, banking system, and monetary policy." },
          { title: "Chapter 7: Indian Economy", description: "Pre and post-independence development." },
          { title: "Chapter 8: Development Strategies", description: "Economic planning and reforms in India." }
        ])
      },
      {
        title: "Business Studies for Class 12 (Commerce)",
        description: "Learn about business organization, management principles, financial markets, and marketing.",
        subject: "Business Studies",
        examType: "School",
        coverImage: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3",
        chapters: 9,
        targetGrade: "12-commerce",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Nature and Significance of Management", description: "Management concepts, importance, and functions." },
          { title: "Chapter 2: Principles of Management", description: "Management principles and scientific management." },
          { title: "Chapter 3: Business Environment", description: "Elements and dynamic nature of business environment." },
          { title: "Chapter 4: Planning", description: "Process and types of plans." },
          { title: "Chapter 5: Organizing", description: "Structure, delegation, and decentralization." },
          { title: "Chapter 6: Staffing", description: "Human resource management and staffing process." },
          { title: "Chapter 7: Directing", description: "Motivation, leadership, and communication." },
          { title: "Chapter 8: Financial Management", description: "Financial planning, capital structure, and fixed capital." },
          { title: "Chapter 9: Marketing Management", description: "Marketing concept, mix, and digital marketing." }
        ])
      },
      
      // Competitive Exam Courses
      {
        title: "Calculus Fundamentals for JEE",
        description: "Master differentiation, integration, and applications of calculus for JEE and other engineering entrance exams.",
        subject: "Mathematics",
        examType: "JEE",
        coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "11-12-science",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Functions and Limits", description: "Domain, range, continuity, and evaluation of limits." },
          { title: "Chapter 2: Differentiation", description: "Rules, techniques, and applications of derivatives." },
          { title: "Chapter 3: Applications of Derivatives", description: "Rate of change, tangents, normals, and optimization." },
          { title: "Chapter 4: Indefinite Integration", description: "Basic integrals and techniques of integration." },
          { title: "Chapter 5: Definite Integration", description: "Properties and evaluation of definite integrals." },
          { title: "Chapter 6: Areas Under Curves", description: "Finding areas using integration." },
          { title: "Chapter 7: Differential Equations", description: "First order differential equations and applications." },
          { title: "Chapter 8: Multivariable Calculus", description: "Partial derivatives and multiple integrals." },
          { title: "Chapter 9: Vector Calculus", description: "Vector functions, gradients, and line integrals." },
          { title: "Chapter 10: Problem Solving for JEE", description: "Advanced problems and exam strategies." }
        ])
      },
      {
        title: "Chemical Bonding for NEET",
        description: "Learn about different types of chemical bonds, molecular geometry, and hybridization for NEET preparation.",
        subject: "Chemistry",
        examType: "NEET",
        coverImage: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3",
        chapters: 8,
        targetGrade: "11-12-science",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Atomic Structure", description: "Quantum numbers, orbitals, and electronic configuration." },
          { title: "Chapter 2: Ionic Bonding", description: "Formation, properties, and lattice energy." },
          { title: "Chapter 3: Covalent Bonding", description: "Lewis structures, VSEPR theory, and properties." },
          { title: "Chapter 4: Hybridization", description: "sp, sp², sp³ hybridization and molecular shapes." },
          { title: "Chapter 5: Molecular Orbital Theory", description: "Bonding and antibonding orbitals and bond order." },
          { title: "Chapter 6: Hydrogen Bonding", description: "Intermolecular forces and their effects on properties." },
          { title: "Chapter 7: Metallic Bonding", description: "Free electron theory and band theory." },
          { title: "Chapter 8: NEET Practice Problems", description: "Previous years' questions and problem-solving strategies." }
        ])
      },
      {
        title: "Human Physiology for NEET",
        description: "Detailed study of human organ systems, their functions, and related disorders for NEET preparation.",
        subject: "Biology",
        examType: "NEET",
        coverImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "11-12-science",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Digestive System", description: "Organs, enzymes, and process of digestion." },
          { title: "Chapter 2: Respiratory System", description: "Breathing mechanism and gas exchange." },
          { title: "Chapter 3: Circulatory System", description: "Heart, blood vessels, and circulation." },
          { title: "Chapter 4: Excretory System", description: "Kidneys, nephrons, and urine formation." },
          { title: "Chapter 5: Nervous System", description: "Neurons, brain, spinal cord, and nerve impulses." },
          { title: "Chapter 6: Endocrine System", description: "Glands, hormones, and their functions." },
          { title: "Chapter 7: Reproductive System", description: "Male and female reproductive organs and processes." },
          { title: "Chapter 8: Muscular and Skeletal Systems", description: "Bones, joints, and muscle contraction." },
          { title: "Chapter 9: Immune System", description: "Immunity, antibodies, and immune responses." },
          { title: "Chapter 10: Common Disorders", description: "Diseases related to various organ systems." }
        ])
      }
    ];
    
    // Check if we have any detailed courses already (courses with targetGrade field)
    const existingDetailedCourse = await db.query.courses.findFirst({
      where: (courses, { isNotNull }) => isNotNull(courses.targetGrade)
    });
    
    if (!existingDetailedCourse) {
      // Insert detailed courses with grade targeting
      for (const course of entranceExamCourses) {
        await db.insert(schema.courses).values(course);
      }
      console.log(`✅ Added ${entranceExamCourses.length} courses with detailed chapter information`);
    } else {
      console.log("⏩ Detailed courses already exist, skipping...");
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
