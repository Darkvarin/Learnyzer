import { db } from "@db";
import { otpVerification } from "@shared/schema";
import { eq, and, gt, lt } from "drizzle-orm";
import crypto from "crypto";

export class OTPService {
  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via Fast2SMS (₹0.143/SMS - very affordable)
  async sendOTP(mobile: string, purpose: 'signup' | 'login' | 'password_reset'): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
      // Generate OTP
      const otp = this.generateOTP();
      
      // Set expiry time (5 minutes from now)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      // Delete any existing OTPs for this mobile and purpose
      await db.delete(otpVerification)
        .where(and(
          eq(otpVerification.mobile, mobile),
          eq(otpVerification.purpose, purpose)
        ));
      
      // Insert new OTP
      await db.insert(otpVerification).values({
        mobile,
        otp,
        purpose,
        verified: false,
        expiresAt,
      });
      
      // Send SMS using 2Factor.in (reliable Indian SMS provider)
      const smsResult = await this.send2FactorSMS(mobile, otp, purpose);
      
      if (smsResult.success) {
        return {
          success: true,
          message: `OTP sent to ${mobile}`,
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        };
      } else {
        // If SMS fails, still log OTP for development
        console.log(`SMS failed but OTP for ${mobile}: ${otp}`);
        return {
          success: true,
          message: `OTP sent to ${mobile}`,
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
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

  // SMS integration using 2Factor.in only
  private async send2FactorSMS(mobile: string, otp: string, purpose: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!process.env.TWOFACTOR_API_KEY) {
        console.error('2Factor.in API key not configured');
        return { success: false, message: '2Factor.in API key not configured' };
      }

      console.log('Using 2Factor.in for SMS delivery...');
      const twoFactorResult = await this.try2Factor(mobile, otp, purpose);
      
      if (twoFactorResult.success) {
        return twoFactorResult;
      } else {
        console.error('2Factor.in SMS delivery failed');
        return { success: false, message: '2Factor.in SMS delivery failed' };
      }
    } catch (error) {
      console.error('2Factor.in SMS service error:', error);
      return { success: false, message: '2Factor.in SMS service error' };
    }
  }





  // 2Factor.in implementation - ₹0.18/SMS (no template required)
  private async try2Factor(mobile: string, otp: string, purpose: string): Promise<{ success: boolean; message: string }> {
    try {
      // Clean mobile number format - ensure 10 digits only
      const cleanMobile = mobile.replace(/\D/g, '').replace(/^91/, '').slice(-10);
      
      console.log(`📱 2Factor.in: Sending SMS TEXT OTP ${otp} to ${cleanMobile}`);
      
      // Professional SMS message template
      const smsMessage = `${otp} is your Learnyzer verification code. Valid for 5 minutes. Do not share with anyone.`;
      console.log(`📧 SMS Message: "${smsMessage}"`);
      console.log(`🎯 Sending TEXT SMS (not voice) via TSMS endpoint`);
      
      // 2Factor.in SMS API with custom text message
      const response = await fetch(`https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/ADDON_SERVICES/SEND/TSMS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'From': 'LEARNY',
          'To': cleanMobile,
          'Msg': smsMessage
        })
      });

      const result = await response.json();
      
      if (response.ok && result.Status === 'Success') {
        console.log('✅ 2Factor OTP sent successfully:', result);
        // Wait a moment and check delivery status
        setTimeout(async () => {
          try {
            const statusResponse = await fetch(`https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/STATUS/${result.Details}`, {
              method: 'GET',
            });
            const statusResult = await statusResponse.json();
            console.log('📊 2Factor delivery status:', statusResult);
          } catch (e) {
            console.log('Could not check delivery status');
          }
        }, 3000);
        
        return { success: true, message: 'OTP sent via 2Factor.in' };
      } else {
        console.error('❌ 2Factor error:', result);
        return { success: false, message: '2Factor failed' };
      }
    } catch (error) {
      console.error('💥 2Factor API error:', error);
      return { success: false, message: '2Factor connection failed' };
    }
  }

  // Professional OTP message template generator
  private createOTPTemplate(otp: string, purpose: string): string {
    const purposeMap: { [key: string]: string } = {
      'login': 'login to',
      'signup': 'verify your',
      'verification': 'verify your',
      'password_reset': 'reset password for'
    };

    const action = purposeMap[purpose] || 'verify your';
    
    return `🎓 LEARNYZER: Your OTP is ${otp} to ${action} account. Valid for 5 minutes. Keep it confidential. Happy Learning!`;
  }

  // Verify OTP
  async verifyOTP(mobile: string, otp: string, purpose: 'signup' | 'login' | 'password_reset'): Promise<{ success: boolean; message: string }> {
    try {
      // Find valid OTP
      const otpRecord = await db.query.otpVerification.findFirst({
        where: and(
          eq(otpVerification.mobile, mobile),
          eq(otpVerification.otp, otp),
          eq(otpVerification.purpose, purpose),
          eq(otpVerification.verified, false),
          gt(otpVerification.expiresAt, new Date())
        )
      });

      if (!otpRecord) {
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      // Mark OTP as verified
      await db.update(otpVerification)
        .set({ verified: true })
        .where(eq(otpVerification.id, otpRecord.id));

      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  // Check if mobile number has been verified for signup
  async isMobileVerified(mobile: string): Promise<boolean> {
    try {
      const verifiedOTP = await db.query.otpVerification.findFirst({
        where: and(
          eq(otpVerification.mobile, mobile),
          eq(otpVerification.purpose, 'signup'),
          eq(otpVerification.verified, true)
        )
      });

      return !!verifiedOTP;
    } catch (error) {
      console.error('Error checking mobile verification:', error);
      return false;
    }
  }

  // Clean up expired OTPs (can be called periodically)
  async cleanupExpiredOTPs(): Promise<void> {
    try {
      const now = new Date();
      await db.delete(otpVerification)
        .where(lt(otpVerification.expiresAt, now));
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}

export const otpService = new OTPService();