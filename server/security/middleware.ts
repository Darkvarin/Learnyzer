import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { securityConfig } from "./config.js";
import type { Express, Request, Response, NextFunction } from "express";
import { auditLogger } from "./audit";

// Rate limiting middleware
export const createRateLimiter = (options = securityConfig.rateLimiting) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil(options.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      auditLogger.logSecurityEvent({
        event: "rate_limit_exceeded",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        timestamp: new Date()
      });
      
      res.status(429).json({
        error: "Too many requests from this IP, please try again later.",
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  });
};

// Authentication rate limiter (stricter for login attempts)
export const authRateLimiter = createRateLimiter(securityConfig.rateLimiting.auth);

// API rate limiter
export const apiRateLimiter = createRateLimiter(securityConfig.rateLimiting.api);

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: securityConfig.csp.directives,
    reportOnly: false
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: "deny" },
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// CORS middleware
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = securityConfig.cors.origin;
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes("*")) {
        const regex = new RegExp(allowedOrigin.replace("*", ".*"));
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      auditLogger.logSecurityEvent({
        event: "cors_violation",
        origin,
        timestamp: new Date()
      });
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: securityConfig.cors.credentials,
  optionsSuccessStatus: securityConfig.cors.optionsSuccessStatus
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === "string") {
      // Remove potential XSS payloads
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "")
        .trim();
    }
    if (typeof value === "object" && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log sensitive operations
  const sensitiveRoutes = ["/api/auth/", "/api/user/", "/api/payment/"];
  const isSensitive = sensitiveRoutes.some(route => req.path.startsWith(route));
  
  if (isSensitive) {
    auditLogger.logRequest({
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: req.user?.id,
      timestamp: new Date()
    });
  }

  // Override res.json to log response status
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    
    if (isSensitive) {
      auditLogger.logResponse({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userId: req.user?.id,
        timestamp: new Date()
      });
    }
    
    return originalJson.call(this, body);
  };

  next();
};

// File upload security middleware
export const secureFileUpload = (req: Request, res: Response, next: NextFunction) => {
  // Check if request contains file upload
  if (!req.file && !req.files) {
    return next();
  }

  const file = req.file || (Array.isArray(req.files) ? req.files[0] : req.files);
  if (!file) return next();

  // Validate file size
  if (file.size > securityConfig.validation.maxFileSize) {
    return res.status(413).json({
      error: "File size too large",
      maxSize: securityConfig.validation.maxFileSize
    });
  }

  // Validate file type for images
  if (file.mimetype && !securityConfig.validation.allowedImageTypes.includes(file.mimetype)) {
    return res.status(415).json({
      error: "File type not allowed",
      allowedTypes: securityConfig.validation.allowedImageTypes
    });
  }

  // Scan file content for malicious patterns
  const buffer = file.buffer;
  if (buffer) {
    const content = buffer.toString("utf-8", 0, Math.min(1024, buffer.length));
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i
    ];

    const isMalicious = maliciousPatterns.some(pattern => pattern.test(content));
    if (isMalicious) {
      auditLogger.logSecurityEvent({
        event: "malicious_file_upload",
        ip: req.ip,
        userId: req.user?.id,
        filename: file.originalname,
        timestamp: new Date()
      });
      
      return res.status(400).json({
        error: "File contains potentially malicious content"
      });
    }
  }

  next();
};

// Session security middleware
export const sessionSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Regenerate session ID on login to prevent session fixation
  if (req.path === "/api/auth/login" && req.method === "POST") {
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration failed:", err);
      }
      next();
    });
  } else {
    next();
  }
};

// Apply all security middleware to Express app
export const applySecurity = (app: Express) => {
  // Basic security headers
  app.use(securityHeaders);
  
  // CORS protection
  app.use(corsMiddleware);
  
  // Rate limiting
  app.use("/api/auth/", authRateLimiter);
  app.use("/api/", apiRateLimiter);
  app.use(createRateLimiter());
  
  // Input sanitization
  app.use(sanitizeInput);
  
  // Request logging
  app.use(requestLogger);
  
  // Session security
  app.use(sessionSecurity);
  
  // File upload security
  app.use(secureFileUpload);
  
  // Disable server information disclosure
  app.disable("x-powered-by");
  
  console.log("🔒 Security middleware applied successfully");
};