import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import RazorpayModal from './razorpay-modal';

// Plan IDs corresponding to the plans in the server
export enum SubscriptionPlan {
  MONTHLY_BASIC = 'MONTHLY_BASIC',
  MONTHLY_PRO = 'MONTHLY_PRO',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY'
}

// Plan names for display
export const PlanNames = {
  [SubscriptionPlan.MONTHLY_BASIC]: 'Monthly Basic',
  [SubscriptionPlan.MONTHLY_PRO]: 'Monthly Pro',
  [SubscriptionPlan.QUARTERLY]: 'Quarterly',
  [SubscriptionPlan.HALF_YEARLY]: 'Half-Yearly',
  [SubscriptionPlan.YEARLY]: 'Yearly'
};

interface SubscriptionServiceProps {
  children: (props: {
    subscribe: (planId: SubscriptionPlan) => void;
    isLoading: boolean;
  }) => React.ReactNode;
}

export default function SubscriptionService({ children }: SubscriptionServiceProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const subscribe = (planId: SubscriptionPlan) => {
    // Check if user is authenticated
    fetch('/api/auth/me')
      .then(response => {
        if (!response.ok) {
          throw new Error('Please sign in to subscribe');
        }
        return response.json();
      })
      .then(() => {
        // User is authenticated, open payment modal
        setSelectedPlan(planId);
        setIsPaymentModalOpen(true);
      })
      .catch(error => {
        console.error('Authentication check failed:', error);
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to subscribe to a plan',
          variant: 'destructive'
        });
        
        // Redirect to auth page
        navigate('/auth');
      });
  };
  
  return (
    <>
      {children({
        subscribe,
        isLoading
      })}
      
      {selectedPlan && (
        <RazorpayModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPlan(null);
          }}
          planId={selectedPlan}
          planName={selectedPlan ? PlanNames[selectedPlan] : undefined}
        />
      )}
    </>
  );
}