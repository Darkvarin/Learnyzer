import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';
import { LoaderCircle } from 'lucide-react';

// Define the Razorpay window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  amount?: number;
  planId: string;
  planName?: string;
}

export default function RazorpayModal({ 
  isOpen, 
  onClose, 
  planId 
}: RazorpayModalProps) {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Load Razorpay script
  useEffect(() => {
    if (isOpen) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen]);

  // Create order when modal opens
  useEffect(() => {
    if (isOpen && planId) {
      createOrder();
    }
  }, [isOpen, planId]);

  const createOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      setOrderData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription order. Please try again later.",
        variant: "destructive"
      });
      setLoading(false);
      onClose();
    }
  };

  const handlePayment = () => {
    if (!orderData) return;

    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Learnyzer",
      description: `Subscription: ${orderData.plan_name}`,
      order_id: orderData.order_id,
      prefill: {
        name: orderData.user_name || '',
        email: orderData.user_email || '',
      },
      theme: {
        color: "#47c1d6",
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal closed');
          onClose();
        },
      },
      handler: function (response: any) {
        verifyPayment(response);
      },
    };

    try {
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      toast({
        title: "Error",
        description: "Payment initialization failed. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const verifyPayment = async (response: any) => {
    try {
      setLoading(true);
      
      const verifyResponse = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          plan_id: planId
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        toast({
          title: "Success!",
          description: `Your ${verifyData.plan_name} subscription is now active.`,
        });
        
        // Navigate to dashboard or subscription success page
        navigate('/dashboard');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: "We couldn't verify your payment. Please contact support if your account was charged.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center mb-2">
            {orderData ? `Subscribe to ${orderData.plan_name}` : 'Processing...'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {orderData && `₹${(orderData.amount / 100).toFixed(2)} ${orderData.currency}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {loading ? (
            <div className="flex flex-col items-center space-y-3">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Preparing your subscription...</p>
            </div>
          ) : orderData ? (
            <div className="space-y-4 w-full">
              <div className="bg-secondary/10 p-4 rounded-md">
                <h4 className="font-medium mb-2">Subscription Details</h4>
                <p className="text-sm text-muted-foreground">{orderData.description}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  You will be redirected to Razorpay to complete your payment securely.
                </p>
              </div>
              
              <Button 
                onClick={handlePayment} 
                className="w-full bg-[#4af3c0] hover:bg-[#4af3c0]/90 text-[#0a2a42] font-medium"
              >
                Proceed to Payment
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Connecting to payment gateway...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}