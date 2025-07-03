import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Free Trial</h2>
                <p>
                  All new users receive a 1-day free trial to explore our AI tutoring platform. No payment is required during the trial period.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Subscription Refunds</h2>
                <p>
                  We offer a satisfaction guarantee with the following refund policy:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>7-Day Money-Back Guarantee:</strong> Full refund available within 7 days of subscription purchase</li>
                  <li><strong>Partial Refunds:</strong> Pro-rated refunds for unused subscription periods (calculated monthly)</li>
                  <li><strong>Technical Issues:</strong> Full refund if service is unavailable for more than 24 hours</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Refund Exclusions</h2>
                <p>
                  Refunds are not available in the following cases:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Subscription cancellation after 30 days</li>
                  <li>Violation of Terms of Service</li>
                  <li>Fraudulent payment methods</li>
                  <li>Excessive usage beyond fair use policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. How to Request a Refund</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Contact our support team at refunds@learnyzer.com</li>
                  <li>Provide your subscription details and reason for refund</li>
                  <li>Allow 3-5 business days for processing</li>
                  <li>Refunds will be credited to your original payment method</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Subscription Cancellation</h2>
                <p>
                  You can cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing cycle.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Contact Support</h2>
                <p>
                  For refund requests or questions about this policy, contact us at: refunds@learnyzer.com
                </p>
              </section>

              <div className="text-sm text-muted-foreground mt-8">
                Last updated: January 3, 2025
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}