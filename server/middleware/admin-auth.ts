import bcrypt from 'bcrypt';

// Simple in-memory session store for admin sessions
const adminSessions = new Map<string, { email: string; timestamp: number }>();

// Session timeout: 24 hours
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

// Admin credentials (environment-based for security)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@learnyzer.ai';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$eWqQxzx4bWOjQJ1aJQqJm.8qXJUyL5Y9h6qHK5CtZf2S1t6nH7w8a'; // Default: admin123

export async function authenticateAdmin(email: string, password: string): Promise<boolean> {
  try {
    // Check if email matches admin email
    if (email !== ADMIN_EMAIL) {
      return false;
    }

    // Verify password against hash
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    return isValid;
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return false;
  }
}

export function createAdminSession(email: string): string {
  // Generate unique session ID
  const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store session with timestamp
  adminSessions.set(sessionId, {
    email,
    timestamp: Date.now()
  });

  return sessionId;
}

export function validateAdminSession(sessionId: string): boolean {
  const session = adminSessions.get(sessionId);
  
  if (!session) {
    return false;
  }

  // Check if session has expired
  const now = Date.now();
  if (now - session.timestamp > SESSION_TIMEOUT) {
    adminSessions.delete(sessionId);
    return false;
  }

  return true;
}

export function removeAdminSession(sessionId: string): void {
  adminSessions.delete(sessionId);
}

// Cleanup expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of adminSessions.entries()) {
    if (now - session.timestamp > SESSION_TIMEOUT) {
      adminSessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Cleanup every hour