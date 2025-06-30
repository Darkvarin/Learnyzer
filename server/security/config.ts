// Enterprise-grade security configuration
export const securityConfig = {
  // Session Security
  session: {
    name: "learnyzer_session",
    secret: process.env.SESSION_SECRET || (() => {
      throw new Error("SESSION_SECRET environment variable is required");
    })(),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.NODE_ENV === "production" ? ".replit.app" : undefined
    },
    resave: false,
    saveUninitialized: false,
    rolling: true // Refresh session on activity
  },

  // Rate Limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 5 // 5 login attempts per 15 minutes
    },
    api: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60 // 60 API calls per minute
    }
  },

  // Password Security
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    saltRounds: 12
  },

  // Data Encryption
  encryption: {
    algorithm: "aes-256-gcm",
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  },

  // CORS Settings
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? ["https://*.replit.app", "https://*.replit.com"]
      : ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    optionsSuccessStatus: 200
  },

  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.openai.com", "wss:", "ws:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  },

  // Input Validation
  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    maxUsernameLength: 30,
    maxNameLength: 100,
    maxEmailLength: 254
  },

  // Audit Logging
  audit: {
    enabled: true,
    sensitiveActions: [
      "login", "logout", "password_change", "email_change",
      "profile_update", "data_export", "account_deletion"
    ]
  }
};