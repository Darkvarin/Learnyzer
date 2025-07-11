import { db } from "./index";
import * as schema from "@shared/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

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
      },
      {
        name: "Priya",
        specialty: "Your CGLE & Government Exams AI Tutor",
        image: "https://cdn.jsdelivr.net/gh/lyqht/fake-api-images/avataaars/avatar4.svg",
        description: "Priya specializes in government job preparation, focusing on general awareness, quantitative aptitude, and current affairs for CGLE.",
        personalityTraits: JSON.stringify(["methodical", "updated", "motivating"])
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
        name: "Mock Test Generator",
        description: "Generate AI-powered practice tests for your exam preparation",
        color: "warning",
        features: JSON.stringify([
          "Exam-specific question generation",
          "Multiple choice and descriptive questions",
          "Timed test environment",
          "PDF download for offline practice",
          "Answer key provided after completion",
          "Performance analytics and insights"
        ])
      },
      {
        name: "Flashcard Creator",
        description: "Generate study flashcards for quick revision",
        color: "info",
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
      },
      {
        name: "Government Job Preparation",
        description: "Preparation material for CGLE and other government recruitment exams"
      }
    ];
    
    // Check if categories already exist
    const existingCourseCategory = await db.query.courseCategories.findFirst();
    
    if (!existingCourseCategory) {
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
        title: "Human Physiology for NEET",
        description: "Detailed study of human organ systems, their functions, and related disorders for NEET preparation.",
        subject: "Biology",
        examType: "NEET",
        coverImage: "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "11-12",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Digestive System", description: "Organs, digestive processes, and associated disorders." },
          { title: "Chapter 2: Respiratory System", description: "Mechanism of breathing, gas exchange, and respiratory disorders." },
          { title: "Chapter 3: Circulatory System", description: "Heart structure, blood vessels, and cardiac cycle." },
          { title: "Chapter 4: Blood and Immunity", description: "Blood components, blood groups, and immune responses." },
          { title: "Chapter 5: Excretory System", description: "Kidney structure, urine formation, and renal disorders." },
          { title: "Chapter 6: Nervous System", description: "Neurons, central and peripheral nervous systems." },
          { title: "Chapter 7: Endocrine System", description: "Hormones, their functions, and endocrine disorders." },
          { title: "Chapter 8: Reproductive System", description: "Male and female reproductive organs, gametogenesis, and fertilization." },
          { title: "Chapter 9: Musculoskeletal System", description: "Muscles, bones, joints, and movement mechanisms." },
          { title: "Chapter 10: Common Human Diseases", description: "Pathophysiology of common diseases for NEET preparation." }
        ])
      },
      {
        title: "Cell Biology for NEET",
        description: "In-depth study of cell structure, function, and molecular processes essential for NEET biology.",
        subject: "Biology",
        examType: "NEET",
        coverImage: "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3",
        chapters: 8,
        targetGrade: "11-12",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Cell Theory and Cell Types", description: "Prokaryotic and eukaryotic cell differences." },
          { title: "Chapter 2: Cell Membrane and Transport", description: "Membrane structure and transport mechanisms." },
          { title: "Chapter 3: Cell Organelles", description: "Structure and functions of mitochondria, ER, Golgi, etc." },
          { title: "Chapter 4: Cell Cycle", description: "Phases of cell cycle, mitosis, and meiosis." },
          { title: "Chapter 5: DNA Replication", description: "Mechanism and enzymes involved in DNA replication." },
          { title: "Chapter 6: Protein Synthesis", description: "Transcription, translation, and genetic code." },
          { title: "Chapter 7: Cell Signaling", description: "Signal transduction pathways and cellular communication." },
          { title: "Chapter 8: Practice Questions", description: "Previous years' NEET questions and problem-solving approaches." }
        ])
      },
      
      // UPSC Courses
      {
        title: "Indian Polity for UPSC",
        description: "Comprehensive coverage of Indian Constitution, governance systems, and political dynamics for UPSC CSE.",
        subject: "Polity",
        examType: "UPSC",
        coverImage: "https://images.unsplash.com/photo-1574546105514-ab1118741ba2?ixlib=rb-4.0.3",
        chapters: 12,
        targetGrade: "Undergraduate",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Making of the Indian Constitution", description: "Constituent Assembly and constitutional development." },
          { title: "Chapter 2: Fundamental Rights", description: "Articles 12-35, restrictions, and landmark judgments." },
          { title: "Chapter 3: Directive Principles and Fundamental Duties", description: "Articles 36-51, implementation, and relevance." },
          { title: "Chapter 4: Executive Branch", description: "President, Prime Minister, Council of Ministers, and their powers." },
          { title: "Chapter 5: Legislature", description: "Parliament, Lok Sabha, Rajya Sabha, and legislative procedures." },
          { title: "Chapter 6: Judiciary", description: "Supreme Court, High Courts, and judicial review." },
          { title: "Chapter 7: Federal Structure", description: "Centre-state relations, Article 370, and special provisions." },
          { title: "Chapter 8: Local Governance", description: "Panchayati Raj, municipalities, and 73rd/74th amendments." },
          { title: "Chapter 9: Constitutional Bodies", description: "CAG, Election Commission, UPSC, and other bodies." },
          { title: "Chapter 10: Emergency Provisions", description: "National, state, and financial emergencies." },
          { title: "Chapter 11: Constitutional Amendments", description: "Amendment procedure and major amendments." },
          { title: "Chapter 12: Previous Year Questions", description: "UPSC CSE question analysis and answer strategies." }
        ])
      },
      {
        title: "Modern Indian History for UPSC",
        description: "Detailed analysis of Indian freedom struggle, socio-religious movements, and post-independence developments.",
        subject: "History",
        examType: "UPSC",
        coverImage: "https://images.unsplash.com/photo-1585152002465-43c1f0e14505?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "Undergraduate",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: European Colonization", description: "Arrival of European powers and establishment of British rule." },
          { title: "Chapter 2: Socio-Religious Reform Movements", description: "Brahmo Samaj, Arya Samaj, Ramakrishna Mission, etc." },
          { title: "Chapter 3: Early Indian Nationalism", description: "Formation of Congress, moderates, and extremists." },
          { title: "Chapter 4: Gandhian Era", description: "Non-cooperation, Civil Disobedience, and Quit India movements." },
          { title: "Chapter 5: Revolutionary Movements", description: "Bhagat Singh, Subhas Chandra Bose, and other revolutionaries." },
          { title: "Chapter 6: Partition and Independence", description: "Events leading to partition and challenges after independence." },
          { title: "Chapter 7: Integration of Princely States", description: "Accession and reorganization of states." },
          { title: "Chapter 8: Major Post-Independence Events", description: "Indo-Pak wars, Emergency, economic liberalization." },
          { title: "Chapter 9: Cultural and Literary Movements", description: "Arts, literature, and cultural developments in modern India." },
          { title: "Chapter 10: Previous Year Questions", description: "UPSC CSE question analysis and answer frameworks." }
        ])
      },
      {
        title: "Legal Reasoning for CLAT",
        description: "Master legal aptitude, reasoning, and case law analysis for the Common Law Admission Test.",
        subject: "Law",
        examType: "CLAT",
        coverImage: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?ixlib=rb-4.0.3",
        chapters: 12,
        targetGrade: "Undergraduate",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Introduction to Legal Reasoning", description: "Logical reasoning in the legal context." },
          { title: "Chapter 2: Legal Maxims and Principles", description: "Essential Latin maxims and fundamental principles." },
          { title: "Chapter 3: Constitutional Law Principles", description: "Key provisions and landmark judgments." },
          { title: "Chapter 4: Contract Law", description: "Essential elements and case analysis." },
          { title: "Chapter 5: Tort Law", description: "Liability, negligence, and relevant cases." },
          { title: "Chapter 6: Criminal Law Principles", description: "IPC essentials, actus reus, and mens rea concepts." },
          { title: "Chapter 7: Family Law", description: "Marriage, divorce, inheritance, and succession." },
          { title: "Chapter 8: Property Law", description: "Ownership, possession, and transfer principles." },
          { title: "Chapter 9: Case Analysis and Facts", description: "Interpretation of scenarios and fact patterns." },
          { title: "Chapter 10: Legal Problem Solving", description: "Applying legal principles to complex situations." },
          { title: "Chapter 11: Mock Tests", description: "Practice tests with detailed explanations." },
          { title: "Chapter 12: Previous Year Papers", description: "Analysis of CLAT patterns and common topics." }
        ])
      },
      
      // CUET Courses
      {
        title: "CUET General Test Preparation",
        description: "Comprehensive preparation for Common University Entrance Test covering language, general awareness, and reasoning.",
        subject: "General Test",
        examType: "CUET",
        coverImage: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "12",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Verbal Ability", description: "Reading comprehension, grammar, and vocabulary building." },
          { title: "Chapter 2: Logical and Analytical Reasoning", description: "Syllogisms, coding-decoding, and analytical puzzles." },
          { title: "Chapter 3: Quantitative Aptitude", description: "Number system, algebra, and data interpretation." },
          { title: "Chapter 4: General Knowledge", description: "Current affairs, history, geography, and economics." },
          { title: "Chapter 5: General Science", description: "Basic concepts from physics, chemistry, and biology." },
          { title: "Chapter 6: Mental Ability", description: "Series completion, analogies, and pattern recognition." },
          { title: "Chapter 7: Current Affairs and General Awareness", description: "Latest events, awards, and national developments." },
          { title: "Chapter 8: Critical Thinking", description: "Assumptions, arguments, and evaluating statements." },
          { title: "Chapter 9: Decision Making", description: "Situation analysis and optimal solutions." },
          { title: "Chapter 10: Mock Tests and Previous Papers", description: "Practice with actual CUET patterns and time management." }
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
      },
      
      // CSE Courses
      {
        title: "Data Structures and Algorithms for CSE",
        description: "Comprehensive coverage of fundamental data structures and algorithmic techniques for Computer Science Engineering.",
        subject: "Computer Science",
        examType: "CSE",
        coverImage: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?ixlib=rb-4.0.3",
        chapters: 12,
        targetGrade: "Engineering",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Arrays and Strings", description: "Array operations, string manipulation, and basic algorithms." },
          { title: "Chapter 2: Linked Lists", description: "Singly, doubly, and circular linked lists with operations." },
          { title: "Chapter 3: Stacks and Queues", description: "Implementation and applications of stacks and queues." },
          { title: "Chapter 4: Trees and Binary Search Trees", description: "Tree traversals, BST operations, and balanced trees." },
          { title: "Chapter 5: Heaps and Priority Queues", description: "Heap data structure and priority queue implementations." },
          { title: "Chapter 6: Hash Tables", description: "Hashing techniques, collision resolution, and applications." },
          { title: "Chapter 7: Graphs", description: "Graph representation, traversals, and basic algorithms." },
          { title: "Chapter 8: Sorting Algorithms", description: "Comparison and non-comparison based sorting techniques." },
          { title: "Chapter 9: Searching Algorithms", description: "Linear search, binary search, and advanced searching." },
          { title: "Chapter 10: Dynamic Programming", description: "DP concepts, memoization, and classic problems." },
          { title: "Chapter 11: Greedy Algorithms", description: "Greedy strategy and optimization problems." },
          { title: "Chapter 12: Advanced Topics", description: "Segment trees, tries, and competitive programming techniques." }
        ])
      },
      {
        title: "Database Systems for CSE",
        description: "Complete guide to database design, SQL, normalization, and database management systems.",
        subject: "Computer Science",
        examType: "CSE",
        coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "Engineering",
        difficulty: "Intermediate",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Database Fundamentals", description: "Introduction to databases, DBMS, and data models." },
          { title: "Chapter 2: Relational Model", description: "Relations, keys, constraints, and relational algebra." },
          { title: "Chapter 3: SQL Basics", description: "Data definition, data manipulation, and basic queries." },
          { title: "Chapter 4: Advanced SQL", description: "Joins, subqueries, views, and stored procedures." },
          { title: "Chapter 5: Database Design", description: "ER model, ER diagrams, and logical design." },
          { title: "Chapter 6: Normalization", description: "Functional dependencies, normal forms, and decomposition." },
          { title: "Chapter 7: Transaction Processing", description: "ACID properties, concurrency, and recovery." },
          { title: "Chapter 8: Indexing and Optimization", description: "B-trees, hashing, and query optimization." },
          { title: "Chapter 9: NoSQL Databases", description: "Document stores, key-value pairs, and graph databases." },
          { title: "Chapter 10: Database Security", description: "Access control, encryption, and data privacy." }
        ])
      },
      {
        title: "Operating Systems for CSE",
        description: "Study of operating system concepts, processes, memory management, and system programming.",
        subject: "Computer Science",
        examType: "CSE",
        coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3",
        chapters: 11,
        targetGrade: "Engineering",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: OS Introduction", description: "Operating system concepts, types, and functions." },
          { title: "Chapter 2: Processes and Threads", description: "Process creation, scheduling, and thread management." },
          { title: "Chapter 3: CPU Scheduling", description: "Scheduling algorithms and performance metrics." },
          { title: "Chapter 4: Process Synchronization", description: "Mutual exclusion, semaphores, and monitors." },
          { title: "Chapter 5: Deadlocks", description: "Deadlock detection, prevention, and avoidance." },
          { title: "Chapter 6: Memory Management", description: "Memory allocation, paging, and segmentation." },
          { title: "Chapter 7: Virtual Memory", description: "Demand paging, page replacement, and thrashing." },
          { title: "Chapter 8: File Systems", description: "File organization, directory structure, and allocation." },
          { title: "Chapter 9: I/O Management", description: "Device drivers, I/O scheduling, and performance." },
          { title: "Chapter 10: Security and Protection", description: "Access control, authentication, and security threats." },
          { title: "Chapter 11: Distributed Systems", description: "Network operating systems and distributed algorithms." }
        ])
      },
      {
        title: "Computer Networks for CSE",
        description: "Comprehensive study of networking protocols, architecture, and network programming.",
        subject: "Computer Science",
        examType: "CSE",
        coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "Engineering",
        difficulty: "Advanced",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Network Fundamentals", description: "Network topologies, protocols, and OSI model." },
          { title: "Chapter 2: Physical Layer", description: "Transmission media, encoding, and multiplexing." },
          { title: "Chapter 3: Data Link Layer", description: "Framing, error detection, and flow control." },
          { title: "Chapter 4: Network Layer", description: "IP addressing, routing algorithms, and IPv4/IPv6." },
          { title: "Chapter 5: Transport Layer", description: "TCP, UDP, congestion control, and reliability." },
          { title: "Chapter 6: Application Layer", description: "HTTP, FTP, SMTP, DNS, and web protocols." },
          { title: "Chapter 7: Network Security", description: "Cryptography, SSL/TLS, and security protocols." },
          { title: "Chapter 8: Wireless Networks", description: "WiFi, cellular networks, and mobile computing." },
          { title: "Chapter 9: Network Performance", description: "QoS, traffic analysis, and optimization." },
          { title: "Chapter 10: Network Programming", description: "Socket programming and distributed applications." }
        ])
      },
      
      // CGLE Courses
      {
        title: "General Awareness for CGLE",
        description: "Comprehensive current affairs, general knowledge, and awareness preparation for Combined Graduate Level Examination.",
        subject: "General Awareness",
        examType: "CGLE",
        coverImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3",
        chapters: 10,
        targetGrade: "Graduate",
        difficulty: "Intermediate",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Current Affairs", description: "Recent developments in politics, economics, and international relations." },
          { title: "Chapter 2: Indian History", description: "Ancient, medieval, and modern Indian history highlights." },
          { title: "Chapter 3: Indian Geography", description: "Physical features, climate, natural resources, and economic geography." },
          { title: "Chapter 4: Indian Polity", description: "Constitution, governance, fundamental rights, and political system." },
          { title: "Chapter 5: Economics", description: "Basic economic concepts, Indian economy, and government schemes." },
          { title: "Chapter 6: Science and Technology", description: "Recent developments, innovations, and scientific discoveries." },
          { title: "Chapter 7: Environmental Studies", description: "Environmental issues, conservation, and sustainable development." },
          { title: "Chapter 8: Sports and Culture", description: "Sports achievements, cultural heritage, and arts." },
          { title: "Chapter 9: Awards and Honors", description: "National and international awards, recognition, and achievements." },
          { title: "Chapter 10: Mock Tests", description: "Practice tests based on previous CGLE patterns." }
        ])
      },
      {
        title: "Quantitative Aptitude for CGLE",
        description: "Mathematical reasoning, numerical ability, and problem-solving skills for government job examinations.",
        subject: "Mathematics",
        examType: "CGLE",
        coverImage: "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?ixlib=rb-4.0.3",
        chapters: 12,
        targetGrade: "Graduate",
        difficulty: "Intermediate",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Number Systems", description: "Natural numbers, integers, rational numbers, and number properties." },
          { title: "Chapter 2: Percentages and Ratios", description: "Percentage calculations, profit-loss, and ratio-proportion." },
          { title: "Chapter 3: Simple and Compound Interest", description: "Interest calculations and financial mathematics." },
          { title: "Chapter 4: Time and Work", description: "Work efficiency, time calculations, and partnership problems." },
          { title: "Chapter 5: Speed, Time, and Distance", description: "Motion problems, relative speed, and distance calculations." },
          { title: "Chapter 6: Algebra", description: "Linear equations, quadratic equations, and algebraic identities." },
          { title: "Chapter 7: Geometry", description: "Areas, perimeters, volumes, and geometric properties." },
          { title: "Chapter 8: Trigonometry", description: "Basic trigonometric ratios and identities." },
          { title: "Chapter 9: Statistics and Probability", description: "Data interpretation, averages, and probability concepts." },
          { title: "Chapter 10: Data Interpretation", description: "Charts, graphs, tables, and data analysis." },
          { title: "Chapter 11: Logical Reasoning", description: "Sequence, coding-decoding, and logical puzzles." },
          { title: "Chapter 12: Practice Sets", description: "Previous year questions and mock tests." }
        ])
      },
      {
        title: "English Language for CGLE",
        description: "English comprehension, grammar, vocabulary, and communication skills for competitive examinations.",
        subject: "English",
        examType: "CGLE",
        coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3",
        chapters: 8,
        targetGrade: "Graduate",
        difficulty: "Intermediate",
        chapterDetails: JSON.stringify([
          { title: "Chapter 1: Reading Comprehension", description: "Passage reading, comprehension, and question solving." },
          { title: "Chapter 2: Grammar Fundamentals", description: "Parts of speech, tenses, and sentence structure." },
          { title: "Chapter 3: Vocabulary Building", description: "Synonyms, antonyms, word meanings, and usage." },
          { title: "Chapter 4: Error Detection", description: "Identifying grammatical errors and sentence correction." },
          { title: "Chapter 5: Cloze Test", description: "Fill in the blanks and context-based questions." },
          { title: "Chapter 6: Para Jumbles", description: "Sentence rearrangement and paragraph formation." },
          { title: "Chapter 7: Idioms and Phrases", description: "Common idioms, phrases, and their meanings." },
          { title: "Chapter 8: Writing Skills", description: "Essay writing, letter writing, and precis writing." }
        ])
      }
    ];
    
    // First, clean up any duplicate courses or school-type courses
    console.log("Cleaning up existing courses...");
    const allCourses = await db.query.courses.findMany();
    
    // Delete school-type courses and track other courses to avoid duplicates
    const existingTitles = new Set();
    let deletedCount = 0;
    
    for (const course of allCourses) {
      if (course.examType === "School") {
        await db.delete(schema.courses).where(eq(schema.courses.id, course.id));
        deletedCount++;
      } else if (existingTitles.has(course.title)) {
        // Remove duplicates - keep the first occurrence only
        await db.delete(schema.courses).where(eq(schema.courses.id, course.id));
        deletedCount++;
      } else {
        existingTitles.add(course.title);
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} courses (removed duplicates and School courses)`);
    }
    
    // Now insert any entrance exam courses that don't already exist
    let addedCount = 0;
    for (const course of entranceExamCourses) {
      if (!existingTitles.has(course.title)) {
        await db.insert(schema.courses).values(course);
        addedCount++;
        existingTitles.add(course.title);
      }
    }
    
    if (addedCount > 0) {
      console.log(`✅ Added ${addedCount} new entrance exam courses`);
    } else {
      console.log("⏩ All entrance exam courses already exist, no additions needed");
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

    // Note: Fake demo user removed - using only real user accounts

    // Seed feedback categories
    console.log("🏷️ Seeding feedback categories...");
    const feedbackCategories = [
      {
        name: "General Feedback",
        description: "General feedback about the platform",
        icon: "MessageSquare",
        isActive: true
      },
      {
        name: "Feature Request",
        description: "Suggestions for new features",
        icon: "Lightbulb", 
        isActive: true
      },
      {
        name: "Bug Report",
        description: "Report bugs and technical issues",
        icon: "Bug",
        isActive: true
      },
      {
        name: "AI Tutor",
        description: "Feedback about AI tutoring experience",
        icon: "Brain",
        isActive: true
      },
      {
        name: "Course Content",
        description: "Feedback about course materials and content",
        icon: "BookOpen",
        isActive: true
      },
      {
        name: "User Experience",
        description: "Feedback about website usability and design",
        icon: "Palette",
        isActive: true
      },
      {
        name: "Performance",
        description: "Website speed and performance issues",
        icon: "Zap",
        isActive: true
      }
    ];

    const existingFeedbackCategory = await db.query.feedbackCategories.findFirst();
    if (!existingFeedbackCategory) {
      for (const category of feedbackCategories) {
        await db.insert(schema.feedbackCategories).values(category);
      }
      console.log(`✅ Added ${feedbackCategories.length} feedback categories`);
    } else {
      console.log("⏩ Feedback categories already exist, skipping...");
    }

    // Seed Power-ups for Enhanced Battle Zone
    console.log("Seeding power-ups for Battle Zone 2.0...");
    const powerUps = [
      {
        name: "Extra Time",
        description: "Adds 60 seconds to your current question timer",
        effect: "extra_time",
        cost: 50,
        duration: 60,
        examTypes: JSON.stringify(["all"])
      },
      {
        name: "Hint Master",
        description: "Get an AI-powered hint for the current question",
        effect: "hint",
        cost: 75,
        duration: 0,
        examTypes: JSON.stringify(["all"])
      },
      {
        name: "Option Eliminator",
        description: "Remove 2 wrong options from MCQ questions",
        effect: "eliminate_option",
        cost: 100,
        duration: 0,
        examTypes: JSON.stringify(["JEE", "NEET", "CUET", "CSE"])
      },
      {
        name: "Double Points",
        description: "Double your score for the next correct answer",
        effect: "double_points",
        cost: 125,
        duration: 0,
        examTypes: JSON.stringify(["all"])
      },
      {
        name: "Shield Protection",
        description: "Protect yourself from next wrong answer penalty",
        effect: "shield",
        cost: 150,
        duration: 0,
        examTypes: JSON.stringify(["all"])
      },
      {
        name: "Speed Boost",
        description: "Increases your thinking time by 50% for 3 questions",
        effect: "speed_boost",
        cost: 200,
        duration: 900,
        examTypes: JSON.stringify(["all"])
      }
    ];
    
    // Check if power-ups already exist
    const existingPowerUp = await db.query.powerUps.findFirst();
    
    if (!existingPowerUp) {
      for (const powerUp of powerUps) {
        await db.insert(schema.powerUps).values(powerUp);
      }
      console.log(`✅ Added ${powerUps.length} power-ups for Battle Zone 2.0`);
    } else {
      console.log("⏩ Power-ups already exist, skipping...");
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
