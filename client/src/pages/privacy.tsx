import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us, such as when you create an account, use our AI tutoring services, or contact us for support.
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Account information (username, email, mobile number)</li>
                  <li>Educational preferences and progress data</li>
                  <li>AI interaction history for personalized learning</li>
                  <li>Payment information for subscription services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide personalized AI tutoring and educational content</li>
                  <li>Track learning progress and generate performance analytics</li>
                  <li>Process payments for subscription services</li>
                  <li>Send important updates about your account and services</li>
                  <li>Improve our platform and develop new features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share information only in limited circumstances:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>With trusted service providers who assist in our operations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                <p>
                  We implement industry-standard security measures to protect your personal information, including encryption, secure authentication, and regular security audits.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
                <p>
                  You have the right to access, update, or delete your personal information. You can manage your account settings or contact us for assistance.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at: privacy@learnyzer.com
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