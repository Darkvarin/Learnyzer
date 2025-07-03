import { SEOHead } from "@/components/seo/seo-head";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Shipping & Delivery Policy - Learnyzer"
        description="Learn about Learnyzer Edtech's service delivery policy for digital educational content and subscriptions."
      />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Shipping & Delivery Policy</h1>
          
          <div className="mb-8 text-sm text-muted-foreground text-center">
            Last updated on Jul 3rd 2025
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-3 text-blue-800 dark:text-blue-200">Digital Service Platform</h2>
            <p className="text-blue-700 dark:text-blue-300">
              Learnyzer is a completely digital educational platform. We provide AI-powered tutoring, educational content, 
              and subscription services through our online platform. No physical products are shipped.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Delivery</h2>
            
            <h3 className="text-xl font-semibold mb-3">Immediate Access</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Free Trial:</strong> Instant activation upon account creation</li>
              <li><strong>Subscription Services:</strong> Immediate access after successful payment</li>
              <li><strong>AI Tutoring:</strong> Available 24/7 once subscription is active</li>
              <li><strong>Educational Content:</strong> Instant access to all course materials</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Account Activation</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Account creation is processed within seconds</li>
              <li>Email verification links are sent immediately</li>
              <li>OTP verification for mobile numbers is instant</li>
              <li>Profile setup can be completed immediately after registration</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Subscription Delivery Timeline</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Free Trial</h4>
                <p className="text-sm text-muted-foreground">Activated immediately upon registration</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Paid Subscriptions</h4>
                <p className="text-sm text-muted-foreground">Access granted within 2-5 minutes of payment confirmation</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Payment Processing</h4>
                <p className="text-sm text-muted-foreground">Razorpay processes payments in real-time</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Feature Activation</h4>
                <p className="text-sm text-muted-foreground">All premium features unlock automatically</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Delivery Confirmation</h2>
            <p className="mb-4">
              Delivery of our digital services will be confirmed through multiple channels:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Email Confirmation:</strong> Sent to your registered email address</li>
              <li><strong>SMS Notification:</strong> Subscription activation alerts via SMS</li>
              <li><strong>In-Platform Notifications:</strong> Real-time updates within the platform</li>
              <li><strong>Dashboard Updates:</strong> Subscription status visible in user dashboard</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Access and Availability</h2>
            
            <h3 className="text-xl font-semibold mb-3">Platform Availability</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>24/7 Access:</strong> Services available round the clock</li>
              <li><strong>Global Accessibility:</strong> Platform accessible from anywhere with internet</li>
              <li><strong>Multi-Device Support:</strong> Works on desktop, tablet, and mobile devices</li>
              <li><strong>Instant Sync:</strong> Progress synced across all devices in real-time</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Service Reliability</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>99.9% uptime guarantee for core platform services</li>
              <li>Redundant systems ensure minimal service interruption</li>
              <li>Automatic backup systems protect user data and progress</li>
              <li>Real-time monitoring ensures optimal performance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Technical Requirements</h2>
            <p className="mb-4">
              To ensure smooth delivery of our services, users need:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Internet Connection:</strong> Stable broadband connection recommended</li>
              <li><strong>Modern Browser:</strong> Chrome, Firefox, Safari, or Edge (latest versions)</li>
              <li><strong>Device Compatibility:</strong> Windows, Mac, iOS, Android devices supported</li>
              <li><strong>Account Requirements:</strong> Valid email address and mobile number</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Delivery Issues and Support</h2>
            <p className="mb-4">
              Learnyzer Edtech is not liable for any delay in service delivery due to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Internet service provider issues or connectivity problems</li>
              <li>Device compatibility issues not meeting minimum requirements</li>
              <li>Payment gateway delays or processing issues</li>
              <li>Force majeure events affecting our service infrastructure</li>
            </ul>

            <p className="mb-4">
              We guarantee service activation within <strong>24 hours</strong> from the date of successful payment 
              and provide technical support to resolve any access issues.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">International Access</h2>
            <p className="mb-4">
              For international users, our digital services are delivered through:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Global CDN:</strong> Content delivery network ensures fast loading worldwide</li>
              <li><strong>Multi-Currency Support:</strong> Payment processing in major currencies</li>
              <li><strong>24/7 Support:</strong> Customer service available across time zones</li>
              <li><strong>Language Support:</strong> Platform available in English with regional adaptations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Interruptions</h2>
            <p className="mb-4">
              In case of service interruptions:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Users will be notified via email and platform notifications</li>
              <li>Estimated resolution times will be communicated promptly</li>
              <li>Service credits may be provided for extended outages</li>
              <li>Alternative access methods will be provided when possible</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Customer Support</h2>
            <p className="mb-4">
              For any issues with service delivery or access, contact our support team:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-2"><strong>Email:</strong> learnyzer.ai@gmail.com</p>
              <p className="mb-2"><strong>Phone:</strong> +91 9910601733</p>
              <p className="mb-2"><strong>Support Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST</p>
              <p className="mb-2"><strong>Emergency Technical Support:</strong> Available 24/7 for critical issues</p>
              <p><strong>Response Time:</strong> Within 2-4 hours for technical delivery issues</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">Instant Digital Delivery</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Unlike physical products, our educational services are delivered instantly upon payment confirmation. 
              Start learning immediately with no shipping delays or delivery concerns.
            </p>
          </div>

          <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Disclaimer:</strong> The above content is created at Learnyzer Edtech's sole discretion. 
              Razorpay shall not be liable for any content provided here and shall not be responsible for any 
              claims and liability that may arise due to merchant's non-adherence to it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}