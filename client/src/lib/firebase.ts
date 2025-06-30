import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export class FirebasePhoneAuth {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;
  private mockOTP: string = '';

  // Check if Firebase is properly configured
  private isFirebaseConfigured(): boolean {
    return !!(import.meta.env.VITE_FIREBASE_API_KEY && 
              import.meta.env.VITE_FIREBASE_PROJECT_ID && 
              import.meta.env.VITE_FIREBASE_APP_ID);
  }

  // Initialize reCAPTCHA
  initializeRecaptcha(containerId: string) {
    if (!this.recaptchaVerifier && this.isFirebaseConfigured()) {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
    }
    return this.recaptchaVerifier;
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string, recaptchaContainer: string): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
      // If Firebase is not configured, use mock OTP system
      if (!this.isFirebaseConfigured()) {
        this.mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Mock OTP for ${phoneNumber}: ${this.mockOTP}`);
        return {
          success: true,
          message: `OTP sent to +91${phoneNumber}`,
          otp: this.mockOTP // Return OTP for development
        };
      }

      // Ensure phone number is in international format
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      
      // Initialize reCAPTCHA if not done
      if (!this.recaptchaVerifier) {
        this.initializeRecaptcha(recaptchaContainer);
      }

      // Send verification code
      this.confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, this.recaptchaVerifier!);
      
      return {
        success: true,
        message: `OTP sent to ${formattedPhone}`
      };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP'
      };
    }
  }

  // Verify OTP
  async verifyOTP(otp: string): Promise<{ success: boolean; message: string; uid?: string }> {
    try {
      if (!this.confirmationResult) {
        return {
          success: false,
          message: 'No OTP request found. Please request OTP first.'
        };
      }

      const result = await this.confirmationResult.confirm(otp);
      const uid = result.user.uid;

      return {
        success: true,
        message: 'Phone number verified successfully',
        uid
      };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Invalid OTP. Please try again.'
      };
    }
  }

  // Reset the verification process
  reset() {
    this.confirmationResult = null;
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }
}

export const firebasePhoneAuth = new FirebasePhoneAuth();