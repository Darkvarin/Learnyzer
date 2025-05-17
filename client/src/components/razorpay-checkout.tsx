import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Define window type for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  currency?: string;
}

export default function RazorpayCheckout({
  isOpen,
  onClose,
  planName,
  amount,
  currency = 'INR'
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { toast } = useToast();

  // Load Razorpay script
  useEffect(() => {
    if (isOpen && !scriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
      };
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen, scriptLoaded]);

  const handlePayment = () => {
    setLoading(true);
    
    // Simulate order creation
    setTimeout(() => {
      // Since we don't have actual API keys, we'll simulate a payment window
      // In a real implementation, this would come from the server after creating an order
      const orderId = 'order_' + Math.random().toString(36).substring(2, 15);
      
      // Display a mock Razorpay payment window
      const options = {
        key: 'rzp_test_XXXXXXXXXXXXXXX', // This would be your API key
        amount: amount * 100, // Amount in smallest currency unit (paise for INR)
        currency: currency,
        name: 'Learnyzer',
        description: `${planName} Subscription`,
        image: '/favicon.ico', // Add your logo here
        order_id: orderId,
        handler: function() {
          // On successful payment
          setLoading(false);
          onClose();
          toast({
            title: 'Payment Successful!',
            description: `Your ${planName} subscription is now active.`,
          });
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#47c1d6'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            onClose();
          }
        }
      };

      // In a real implementation, this would open the Razorpay payment window
      // Since we don't have actual API keys, we'll just simulate the success
      
      // Mock the Razorpay payment flow with our own dialog
      // In reality, this would be: new window.Razorpay(options).open();
      setLoading(false);
      
      // Simulate a successful payment after 2 seconds
      setTimeout(() => {
        options.handler();
      }, 2000);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl mb-2 text-[#47c1d6]">Complete Your Payment</DialogTitle>
          <DialogDescription>
            You're subscribing to the {planName} plan for {currency} {amount}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="rounded-lg bg-[#0a0f18]/50 p-4 border border-[#47c1d6]/20">
            <h3 className="font-medium text-[#47c1d6] mb-3">Plan Details</h3>
            <p className="text-sm opacity-80 mb-2">{planName} Subscription</p>
            <div className="flex justify-between items-center text-sm">
              <span>Amount</span>
              <span className="font-semibold">{currency} {amount}</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm opacity-70">
            <p>You will be redirected to Razorpay to complete your payment securely.</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handlePayment}
            className="w-full bg-[#4af3c0] hover:bg-[#4af3c0]/90 text-[#0a2a42] font-medium"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-[#0a2a42]" />
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}