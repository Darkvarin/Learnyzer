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
    console.log('2Factor API Key status:', this.apiKey ? 'Found' : 'Not found');
    if (!this.apiKey) {
      console.warn('2Factor API key not found. OTP service will use development mode.');
    } else {
      console.log('2Factor API key configured successfully');
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

      // Development mode for testing with specific numbers
      if (!this.apiKey || cleanMobile === '9999999999') {
        console.log(`[DEV] OTP for ${cleanMobile}: 123456 (Development mode)`);
        return {
          success: true,
          sessionId: 'dev-session-' + Date.now(),
          message: 'Development mode: Use OTP 123456 for testing'
        };
      }

      console.log(`Sending real SMS OTP to +91${cleanMobile} via 2Factor.in`);
      const response = await axios.get<OTPResponse>(
        `${this.baseUrl}/${this.apiKey}/SMS/+91${cleanMobile}/AUTOGEN/Learnyzer`,
        {
          timeout: 10000
        }
      );

      console.log('2Factor.in response:', {
        status: response.data.Status,
        sessionId: response.data.Details
      });

      if (response.data.Status === 'Success') {
        console.log(`✅ SMS OTP sent successfully to +91${cleanMobile}`);
        return {
          success: true,
          sessionId: response.data.Details,
          message: `OTP sent via SMS to +91${cleanMobile}. Check your messages and enter the 6-digit code below.`
        };
      } else {
        console.error('2Factor.in error:', response.data.Details);
        return {
          success: false,
          message: response.data.Details || 'Failed to send OTP'
        };
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error Details:', error.response?.data);
      }
      return {
        success: false,
        message: 'Failed to send OTP. Please check your network connection and try again.'
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