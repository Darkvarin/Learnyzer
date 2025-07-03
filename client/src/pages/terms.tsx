import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Learnyzer, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                <p>
                  Learnyzer is an AI-powered educational platform designed for Indian students preparing for competitive entrance exams including JEE, NEET, UPSC, CLAT, CUET, and CSE.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Use the platform for educational purposes only</li>
                  <li>Respect intellectual property rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Subscription and Payment</h2>
                <p>
                  Subscription fees are charged in advance and are non-refundable except as expressly stated in our Refund Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Privacy</h2>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us at: support@learnyzer.com
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