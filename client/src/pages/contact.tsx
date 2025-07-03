import { SEOHead } from "@/components/seo/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact Us - Learnyzer"
        description="Get in touch with Learnyzer Edtech for support, inquiries, and assistance with your educational journey."
      />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            We're here to help with your educational journey. Reach out to us anytime.
          </p>
          <div className="text-sm text-muted-foreground mt-2">
            Last updated on Jul 3rd 2025
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Email Contact */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Email Support</h3>
                  <p className="text-muted-foreground mb-3">
                    Send us your questions and we'll respond within 24-48 hours
                  </p>
                  <a 
                    href="mailto:learnyzer.ai@gmail.com"
                    className="text-primary hover:underline font-medium"
                  >
                    learnyzer.ai@gmail.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phone Contact */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
                  <p className="text-muted-foreground mb-3">
                    Call us for urgent support and technical assistance
                  </p>
                  <a 
                    href="tel:+919910601733"
                    className="text-primary hover:underline font-medium"
                  >
                    +91 9910601733
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Information */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Company Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Legal Entity</h3>
                <p className="text-muted-foreground">Learnyzer Edtech</p>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Registered Address</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    0, 1492, LEARNYZER EDTECH<br />
                    Unnamed Road, Pragyansh Properties<br />
                    Sector 56-56 A, Faridabad<br />
                    Haryana, 121004<br />
                    Seekri BO<br />
                    INDIA
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Operational Address</h3>
                <p className="text-muted-foreground leading-relaxed">
                  0, 1492, LEARNYZER EDTECH<br />
                  Unnamed Road, Pragyansh Properties<br />
                  Sector 56-56 A, Faridabad<br />
                  Haryana, 121004<br />
                  Seekri BO<br />
                  INDIA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Hours */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Support Hours</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email Support:</strong> 24/7 (Response within 24-48 hours)</p>
                  <p><strong>Phone Support:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST</p>
                  <p><strong>Emergency Technical Issues:</strong> Same-day response guaranteed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Topics */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">What We Can Help With</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• Account setup and login issues</li>
                <li>• Subscription and billing questions</li>
                <li>• AI tutor technical problems</li>
                <li>• Course content and access</li>
              </ul>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Payment and refund inquiries</li>
                <li>• Platform navigation help</li>
                <li>• Feature requests and feedback</li>
                <li>• General educational guidance</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quick Support Tips */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">For Faster Support</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>• Include your account email when contacting us</p>
              <p>• Describe your issue in detail with steps to reproduce</p>
              <p>• Mention your subscription plan and exam type</p>
              <p>• Attach screenshots for technical issues if possible</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 p-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Disclaimer:</strong> The above content is created at Learnyzer Edtech's sole discretion. 
            Razorpay shall not be liable for any content provided here and shall not be responsible for any 
            claims and liability that may arise due to merchant's non-adherence to it.
          </p>
        </div>
      </div>
    </div>
  );
}