import { SEOHead } from "@/components/seo/seo-head";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Cancellation & Refund Policy - Learnyzer"
        description="Learnyzer Edtech's cancellation and refund policy for educational subscription services."
        path="/refund"
      />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Cancellation & Refund Policy</h1>
          
          <div className="mb-8 text-sm text-muted-foreground text-center">
            Last updated on Jul 3rd 2025
          </div>

          <p className="mb-6 text-lg">
            Learnyzer Edtech believes in helping its customers as far as possible, 
            and has therefore a liberal cancellation policy. Under this policy:
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Free Trial First Approach</h2>
            <p className="mb-4">
              At Learnyzer, we believe in earning your trust before asking for payment. That's why:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-3">
              <li>
                <strong>Every user gets a free 1-day trial</strong> to experience our AI tutoring 
                and educational content before making any payment decision
              </li>
              <li>
                Users typically purchase subscriptions only after being satisfied with 
                the trial experience
              </li>
              <li>
                Since you've already tested our platform during the free trial, 
                subscription purchases are generally final
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">No Refund Policy</h2>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-semibold mb-3 text-red-800 dark:text-red-200">
                All Sales Are Final - No Refunds
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-3">
                Since every user receives a free trial to evaluate our platform before purchasing, 
                <strong> all subscription payments are final and non-refundable</strong>.
              </p>
            </div>
            
            <h3 className="text-xl font-semibold mb-3">Exceptions - Service Credits Only</h3>
            <p className="mb-3">
              The only exceptions where service credits (not refunds) may be provided:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Duplicate charges due to payment processing errors</li>
              <li>Platform completely unavailable for more than 72 consecutive hours</li>
              <li>Unauthorized charges on your account due to security breaches</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              * Service credits extend your subscription period rather than providing monetary refunds
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cancellation Policy</h2>
            <p className="mb-4">
              You can cancel your subscription at any time with the following terms:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-3">
              <li>
                <strong>Monthly subscriptions:</strong> Cancel anytime, effective at end of billing cycle. 
                No refund for remaining days.
              </li>
              <li>
                <strong>Annual subscriptions:</strong> Cancel anytime, no refund provided. 
                Access continues until subscription expiration date.
              </li>
              <li>
                All subscription benefits remain active until the end of your paid period
              </li>
              <li>
                Cancellation only stops future billing - no money will be returned for current period
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Credit Processing (No Monetary Refunds)</h2>
            <ul className="list-disc pl-6 mb-6 space-y-3">
              <li>
                In case of technical issues affecting your service, please report the same to our 
                Customer Service team within <strong>48 hours</strong> of experiencing the issue
              </li>
              <li>
                If you feel that the service received is not as described, you must bring it to 
                the notice of our customer service within <strong>7 days</strong> of subscription 
                purchase for service credit consideration
              </li>
              <li>
                In case of any service credits approved by Learnyzer Edtech, they will be applied 
                to your account within <strong>2-3 business days</strong> as subscription extensions
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Non-Refundable Items</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Subscriptions purchased after successful free trial completion</li>
              <li>AI-generated educational content and tutoring sessions once accessed</li>
              <li>Promotional credits or bonus features</li>
              <li>Subscription renewals (automatic or manual)</li>
              <li>Partial months of annual subscriptions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How to Request Cancellation</h2>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>Contact our Customer Service team at <strong>support@learnyzer.com</strong></li>
              <li>Include your account email and subscription details</li>
              <li>Clearly state your reason for cancellation</li>
              <li>Provide order ID or payment reference if available</li>
              <li>Our team will process cancellations within 24-48 hours</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Special Circumstances</h2>
            <p className="mb-4">
              We understand that exceptional situations may arise:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Medical emergencies or financial hardship will be considered on a case-by-case basis</li>
              <li>Students facing unexpected life changes may contact support for assistance</li>
              <li>Educational institution closures may qualify for special consideration</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-2"><strong>Customer Support:</strong> support@learnyzer.com</p>
              <p className="mb-2"><strong>Business Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST</p>
              <p className="mb-2"><strong>Response Time:</strong> Within 24-48 hours</p>
              <p><strong>Emergency Technical Issues:</strong> Same-day response guaranteed</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Remember</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Our free trial is designed to help you make an informed decision. 
              Take advantage of the trial period to fully explore our platform before subscribing.
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