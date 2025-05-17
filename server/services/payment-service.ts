import Razorpay from 'razorpay';
import { Request, Response } from 'express';
import { db } from '../../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

let razorpayInstance: Razorpay;

// Initialize Razorpay instance
try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
  });
} catch (error) {
  console.error('Failed to initialize Razorpay:', error);
}

// Subscription plans - these would typically come from your database
const SUBSCRIPTION_PLANS = {
  MONTHLY_BASIC: {
    id: 'monthly_basic',
    name: 'Monthly Basic Plan',
    amount: 79900, // ₹799 in paise
    currency: 'INR',
    interval: 'monthly',
    description: 'Access to all AI tools'
  },
  MONTHLY_PRO: {
    id: 'monthly_pro',
    name: 'Monthly Pro Plan',
    amount: 150000, // ₹1,500 in paise
    currency: 'INR',
    interval: 'monthly',
    description: '2 AI tutor lessons daily'
  },
  QUARTERLY: {
    id: 'quarterly',
    name: 'Quarterly Plan',
    amount: 419900, // ₹4,199 in paise
    currency: 'INR',
    interval: 'quarterly',
    description: '3 AI tutor lessons daily'
  },
  HALF_YEARLY: {
    id: 'half_yearly',
    name: 'Half-Yearly Plan',
    amount: 759900, // ₹7,599 in paise
    currency: 'INR',
    interval: 'half_yearly',
    description: '3 AI tutor lessons daily'
  },
  YEARLY: {
    id: 'yearly',
    name: 'Yearly Plan',
    amount: 1299900, // ₹12,999 in paise
    currency: 'INR',
    interval: 'yearly',
    description: '3 AI tutor lessons daily with priority support'
  }
};

export const paymentService = {
  /**
   * Create a Razorpay order
   */
  async createOrder(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { planId } = req.body;
      
      // Validate plan ID
      const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
      if (!plan) {
        return res.status(400).json({ error: 'Invalid plan ID' });
      }

      const user = req.user as { id: number; name: string; email: string };

      // Create Razorpay order
      const orderOptions = {
        amount: plan.amount,
        currency: plan.currency,
        receipt: `subscription_${user.id}_${Date.now()}`,
        notes: {
          planId: plan.id,
          userId: user.id,
          planName: plan.name,
          userEmail: user.email
        }
      };

      razorpayInstance.orders.create(orderOptions, async (err, order) => {
        if (err) {
          console.error('Razorpay order creation error:', err);
          return res.status(500).json({ error: 'Failed to create order' });
        }

        return res.status(200).json({
          order_id: order.id,
          currency: order.currency,
          amount: order.amount,
          key_id: process.env.RAZORPAY_KEY_ID,
          plan_name: plan.name,
          description: plan.description,
          user_name: user.name,
          user_email: user.email
        });
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },

  /**
   * Verify and process payment
   */
  async verifyPayment(req: Request, res: Response) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id } = req.body;

      // Verify the payment signature (this should be implemented with cryptographic signature verification)
      // const isValid = validateRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      
      // For demo purposes, assuming the signature is valid
      const isValid = true;

      if (!isValid) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }

      // Get the user ID from the session
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = req.user as { id: number };

      // Update user's subscription in database
      // This is a simplified example - in a real application, you would have a more
      // complex data model for subscriptions with expiration dates, etc.
      const plan = SUBSCRIPTION_PLANS[plan_id as keyof typeof SUBSCRIPTION_PLANS];
      
      if (!plan) {
        return res.status(400).json({ error: 'Invalid plan ID' });
      }

      // Update user subscription details
      await db.update(users).set({
        // These fields would need to be added to your schema
        // subscriptionPlanId: plan.id,
        // subscriptionEndDate: calculateEndDate(plan.interval),
        // paymentId: razorpay_payment_id,
        // Consider adding these fields to the users table
      }).where(eq(users.id, user.id));

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        plan_name: plan.name
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      return res.status(500).json({ error: 'An unexpected error occurred during payment verification' });
    }
  }
};

// Helper function to calculate subscription end date based on plan interval
function calculateEndDate(interval: string): Date {
  const now = new Date();
  switch (interval) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'half_yearly':
      return new Date(now.setMonth(now.getMonth() + 6));
    case 'yearly':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
}