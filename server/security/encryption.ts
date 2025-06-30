import crypto from "crypto";
import bcrypt from "bcrypt";
import { securityConfig } from "./config.js";

// Data encryption utilities for protecting sensitive information
class DataEncryption {
  private readonly algorithm = securityConfig.encryption.algorithm;
  private readonly keyLength = securityConfig.encryption.keyLength;
  private readonly ivLength = securityConfig.encryption.ivLength;
  private readonly tagLength = securityConfig.encryption.tagLength;

  // Generate a secure encryption key
  generateKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  // Encrypt sensitive data (PII, payment info, etc.)
  encrypt(text: string, key: Buffer): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // For AES-GCM, get the authentication tag
    const tag = (cipher as any).getAuthTag ? (cipher as any).getAuthTag() : Buffer.alloc(0);
    
    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex")
    };
  }

  // Decrypt sensitive data
  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key: Buffer): string {
    const decipher = crypto.createDecipher(this.algorithm, key);
    
    // For AES-GCM, set the authentication tag
    if ((decipher as any).setAuthTag) {
      (decipher as any).setAuthTag(Buffer.from(encryptedData.tag, "hex"));
    }
    
    let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  }

  // Hash passwords securely
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, securityConfig.password.saltRounds);
  }

  // Verify password against hash
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate secure random tokens
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  // Generate API keys
  generateApiKey(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(16).toString("hex");
    return `lrn_${timestamp}_${random}`;
  }

  // Hash sensitive data for storage (one-way)
  hashData(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  // Create HMAC for data integrity verification
  createHMAC(data: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(data).digest("hex");
  }

  // Verify HMAC
  verifyHMAC(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  }

  // Encrypt user PII for database storage
  encryptPII(data: any, userKey: Buffer): any {
    if (!data || typeof data !== "object") return data;

    const encrypted: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.isPIIField(key) && typeof value === "string") {
        encrypted[key] = this.encrypt(value, userKey);
      } else {
        encrypted[key] = value;
      }
    }
    return encrypted;
  }

  // Decrypt user PII from database
  decryptPII(data: any, userKey: Buffer): any {
    if (!data || typeof data !== "object") return data;

    const decrypted: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.isPIIField(key) && value && typeof value === "object") {
        try {
          decrypted[key] = this.decrypt(value as any, userKey);
        } catch (error) {
          console.error(`Failed to decrypt field ${key}:`, error);
          decrypted[key] = null;
        }
      } else {
        decrypted[key] = value;
      }
    }
    return decrypted;
  }

  // Check if field contains PII
  private isPIIField(fieldName: string): boolean {
    const piiFields = [
      "email", "phone", "mobile", "address", "fullName",
      "firstName", "lastName", "dateOfBirth", "ssn",
      "bankAccount", "cardNumber", "emergencyContact"
    ];
    return piiFields.includes(fieldName);
  }

  // Generate encryption key from user data
  deriveUserKey(userId: number, userSecret: string): Buffer {
    const salt = crypto.createHash("sha256").update(userId.toString()).digest();
    return crypto.pbkdf2Sync(userSecret, salt, 100000, this.keyLength, "sha256");
  }

  // Secure random password generation
  generateSecurePassword(length: number = 12): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = "";
    
    // Ensure at least one character from each category
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += symbols[crypto.randomInt(0, symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[crypto.randomInt(0, allChars.length)];
    }
    
    // Shuffle the password
    return password.split("").sort(() => crypto.randomInt(-1, 2)).join("");
  }

  // Validate password strength
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = securityConfig.password;
    
    if (password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`);
    }
    
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    
    if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    
    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      errors.push("Password cannot contain repeated characters");
    }
    
    if (/123456|abcdef|qwerty|password/i.test(password)) {
      errors.push("Password cannot contain common patterns");
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const dataEncryption = new DataEncryption();