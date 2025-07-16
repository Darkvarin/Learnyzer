import axios from 'axios';

interface OTPResponse {
  Status: string;
  Details: string;
  OTP?: string;
  SessionId?: string;
}

interface VerifyOTPResponse {
  Status: string;
  Details: string;
}

class OTPService {
  private apiKey: string;
  private baseUrl = 'https://2factor.in/API/V1';

  constructor() {
    this.apiKey = process.env.TWOFACTOR_API_KEY || '';
    if (!this.apiKey) {
      console.warn('2Factor API key not found. OTP service will not work.');
    }
  }

  async sendOTP(mobileNumber: string): Promise<{ success: boolean; sessionId?: string; message: string }> {
    try {
      // Clean mobile number (remove +91 if present, ensure 10 digits)
      const cleanMobile = mobileNumber.replace(/^\+91/, '').replace(/\D/g, '');
      
      if (cleanMobile.length !== 10) {
        return {
          success: false,
          message: 'Please enter a valid 10-digit mobile number'
        };
      }

      // Development mode fallback - always use for development
      if (process.env.NODE_ENV === 'development' || !this.apiKey) {
        console.log(`[DEV] OTP for ${cleanMobile}: 123456`);
        return {
          success: true,
          sessionId: 'dev-session-' + Date.now(),
          message: 'OTP sent successfully! Use 123456 for testing'
        };
      }

      if (!this.apiKey) {
        return {
          success: false,
          message: 'SMS service temporarily unavailable'
        };
      }

      const response = await axios.get<OTPResponse>(
        `${this.baseUrl}/${this.apiKey}/SMS/+91${cleanMobile}/AUTOGEN/Learnyzer`,
        {
          timeout: 10000
        }
      );

      if (response.data.Status === 'Success') {
        return {
          success: true,
          sessionId: response.data.SessionId,
          message: 'OTP sent successfully to your mobile number'
        };
      } else {
        return {
          success: false,
          message: response.data.Details || 'Failed to send OTP'
        };
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  async verifyOTP(sessionId: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      // Development mode verification
      if (sessionId.startsWith('dev-session-')) {
        if (otp === '123456') {
          return {
            success: true,
            message: 'OTP verified successfully'
          };
        } else {
          return {
            success: false,
            message: 'Invalid OTP. Please try again.'
          };
        }
      }

      if (!this.apiKey) {
        return {
          success: false,
          message: 'Verification service temporarily unavailable'
        };
      }

      const response = await axios.get<VerifyOTPResponse>(
        `${this.baseUrl}/${this.apiKey}/SMS/VERIFY/${sessionId}/${otp}`,
        {
          timeout: 10000
        }
      );

      if (response.data.Status === 'Success') {
        return {
          success: true,
          message: 'OTP verified successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.Details || 'Invalid OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }
}

export const otpService = new OTPService();