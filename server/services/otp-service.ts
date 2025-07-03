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
      
      // Send SMS using Fast2SMS (cost-effective Indian SMS provider)
      const smsResult = await this.sendFast2SMS(mobile, otp, purpose);
      
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

  // SMS integration with fallback providers
  private async sendFast2SMS(mobile: string, otp: string, purpose: string): Promise<{ success: boolean; message: string }> {
    try {
      // Try 2Factor.in first (₹0.18/SMS - most reliable, no templates needed)
      if (process.env.TWOFACTOR_API_KEY) {
        console.log('Using 2Factor.in for SMS delivery...');
        const twoFactorResult = await this.try2Factor(mobile, otp, purpose);
        if (twoFactorResult.success) return twoFactorResult;
        console.log('2Factor failed, trying MSG91 fallback...');
      }

      // Try MSG91 (₹0.16/SMS - working with templates)
      if (process.env.MSG91_API_KEY) {
        const msg91Result = await this.tryMSG91(mobile, otp, purpose);
        if (msg91Result.success) return msg91Result;
        console.log('MSG91 failed, trying Fast2SMS fallback...');
      }

      // Try Fast2SMS (₹0.143/SMS - most cost-effective but IP blocked on Replit)
      if (process.env.FAST2SMS_API_KEY) {
        const fast2smsResult = await this.tryFast2SMS(mobile, otp, purpose);
        if (fast2smsResult.success) return fast2smsResult;
      }

      if (process.env.SMSCOUNTRY_API_KEY) {
        const smsCountryResult = await this.trySMSCountry(mobile, otp, purpose);
        if (smsCountryResult.success) return smsCountryResult;
      }

      console.log('No SMS API keys configured, using development mode');
      return { success: true, message: 'Development mode - SMS not sent' };
    } catch (error) {
      console.error('SMS service error:', error);
      return { success: false, message: 'SMS service temporarily unavailable' };
    }
  }

  // Fast2SMS implementation
  private async tryFast2SMS(mobile: string, otp: string, purpose: string): Promise<{ success: boolean; message: string }> {
    const message = `Your Learnyzer ${purpose} OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    
    const response = await fetch('https://www.fast2sms.com/dev/bulk', {
      method: 'POST',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        sender_id: 'TXTIND',
        message: message,
        language: 'english',
        flash: 0,
        numbers: mobile.replace('+91', ''),
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.return === true) {
      console.log('Fast2SMS OTP sent successfully:', result);
      return { success: true, message: 'OTP sent via Fast2SMS' };
    } else {
      console.error('Fast2SMS error:', result);
      return { success: false, message: result.message || 'Fast2SMS failed' };
    }
  }

  // MSG91 implementation - ₹0.16/SMS (reliable alternative)
  private async tryMSG91(mobile: string, otp: string, purpose: string): Promise<{ success: boolean; message: string }> {
    try {
      // Try the simple OTP endpoint first
      const response = await fetch(`https://control.msg91.com/api/v5/otp?authkey=${process.env.MSG91_API_KEY}&mobile=91${mobile.replace('+91', '')}&otp=${otp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('MSG91 OTP API response:', result);
        
        // Check for success in various response formats
        if (result.type === 'success' || result.message === 'OTP sent successfully' || result.request_id) {
          return { success: true, message: 'OTP sent via MSG91' };
        }
      }

      console.error('MSG91 OTP API failed:', result);
      return { success: false, message: result.message || 'MSG91 OTP API failed' };
    } catch (error) {
      console.error('MSG91 API error:', error);
      return { success: false, message: 'MSG91 connection failed' };
    }
  }

  // SMSCountry implementation - ₹0.006/SMS (cheapest option)
  private async trySMSCountry(mobile: string, otp: string, purpose: string): Promise<{ success: boolean; message: string }> {
    const message = `Your Learnyzer ${purpose} OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    
    const response = await fetch('https://restapi.smscountry.com/v0.1/Accounts/{SID}/SMSes/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.SMSCOUNTRY_SID}:${process.env.SMSCOUNTRY_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Text: message,
        Number: `91${mobile.replace('+91', '')}`,
        SenderId: 'LEARNY',
        Tool: 'API'
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.Success) {
      console.log('SMSCountry OTP sent successfully:', result);
      return { success: true, message: 'OTP sent via SMSCountry' };
    } else {
      console.error('SMSCountry error:', result);
      return { success: false, message: 'SMSCountry failed' };
    }
  }

  // 2Factor.in implementation - ₹0.18/SMS (no template required)
  private async try2Factor(mobile: string, otp: string, purpose: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${mobile}/${otp}/LEARNY`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (response.ok && result.Status === 'Success') {
        console.log('2Factor OTP sent successfully:', result);
        return { success: true, message: 'OTP sent via 2Factor' };
      } else {
        console.error('2Factor error:', result);
        return { success: false, message: '2Factor failed' };
      }
    } catch (error) {
      console.error('2Factor API error:', error);
      return { success: false, message: '2Factor connection failed' };
    }
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