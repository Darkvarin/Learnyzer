import { SEOHead } from "@/components/seo/seo-head";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Terms & Conditions - Learnyzer"
        description="Read the Terms and Conditions for using Learnyzer Edtech's educational platform and services."
      />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Terms & Conditions</h1>
          
          <div className="mb-8 text-sm text-muted-foreground text-center">
            Last updated on Jul 3rd 2025
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Definitions</h2>
            <p className="mb-4">
              For the purpose of these Terms and Conditions, the term "we", "us", "our" used anywhere on this page 
              shall mean Learnyzer Edtech, whose registered/operational office is:
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm">
                0, 1492, LEARNYZER EDTECH<br />
                Unnamed Road, Pragyansh Properties<br />
                Sector 56-56 A, Faridabad<br />
                Haryana, 121004<br />
                Seekri BO<br />
                INDIA
              </p>
            </div>
            <p className="mb-6">
              "You", "your", "user", "visitor" shall mean any natural or legal person who is visiting our website 
              and/or agreed to purchase from us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">General Terms</h2>
            <p className="mb-4">
              <strong>Your use of the website and/or purchase from us are governed by following Terms and Conditions:</strong>
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-3">
              <li>The content of the pages of this website is subject to change without notice</li>
              <li>
                Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, 
                performance, completeness or suitability of the information and materials found or offered on this 
                website for any particular purpose. You acknowledge that such information and materials may contain 
                inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the 
                fullest extent permitted by law
              </li>
              <li>
                Your use of any information or materials on our website and/or product pages is entirely at your own 
                risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, 
                services or information available through our website and/or product pages meet your specific requirements
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Educational Services Terms</h2>
            <h3 className="text-xl font-semibold mb-3">AI Tutoring and Educational Content</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Our AI tutoring services are designed to supplement, not replace, traditional educational methods</li>
              <li>Educational content is provided for study purposes and may not guarantee specific exam results</li>
              <li>AI-generated content should be verified with official study materials and qualified teachers</li>
              <li>We do not guarantee admission to any educational institution based on platform usage</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Subscription Services</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Subscription fees are charged in advance and are non-refundable after the free trial period</li>
              <li>Users must complete the free trial before making informed purchase decisions</li>
              <li>Subscription benefits are personal and cannot be shared with other users</li>
              <li>We reserve the right to modify subscription plans and pricing with prior notice</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">User Conduct</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Users must provide accurate information during registration and profile creation</li>
              <li>Sharing login credentials or subscription access is strictly prohibited</li>
              <li>Users must not attempt to reverse engineer or extract proprietary AI algorithms</li>
              <li>Harassment, inappropriate content, or misuse of platform features may result in account termination</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
            <ul className="list-disc pl-6 mb-6 space-y-3">
              <li>
                Our website contains material which is owned by or licensed to us. This material includes, but is not 
                limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in 
                accordance with the copyright notice, which forms part of these terms and conditions
              </li>
              <li>
                All trademarks reproduced in our website which are not the property of, or licensed to, the operator 
                are acknowledged on the website
              </li>
              <li>
                Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a 
                criminal offense
              </li>
              <li>AI-generated educational content remains the intellectual property of Learnyzer Edtech</li>
              <li>Users retain ownership of their personal study data and progress information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Payment and Billing Terms</h2>
            <ul className="list-disc pl-6 mb-6 space-y-3">
              <li>All subscription fees are charged in Indian Rupees (INR) unless otherwise specified</li>
              <li>Payment processing is handled through secure, PCI-compliant payment gateways</li>
              <li>
                We shall be under no liability whatsoever in respect of any loss or damage arising directly or 
                indirectly out of the decline of authorization for any Transaction, on account of the Cardholder 
                having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time
              </li>
              <li>Failed payments may result in temporary suspension of premium features</li>
              <li>Users are responsible for keeping payment information current and valid</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data and Privacy</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>User data is collected and processed according to our Privacy Policy</li>
              <li>Educational progress data is used to personalize learning experiences</li>
              <li>We implement industry-standard security measures to protect user information</li>
              <li>Users have the right to access, modify, or delete their personal data</li>
              <li>Data retention policies are designed to balance educational continuity with privacy rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">External Links and Third-Party Services</h2>
            <ul className="list-disc pl-6 mb-6 space-y-3">
              <li>
                From time to time our website may also include links to other websites. These links are provided for 
                your convenience to provide further information
              </li>
              <li>
                You may not create a link to our website from another website or document without Learnyzer Edtech's 
                prior written consent
              </li>
              <li>We are not responsible for the content or practices of external websites</li>
              <li>Third-party educational resources are provided for reference only</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Educational outcomes depend on individual effort and are not guaranteed by platform usage</li>
              <li>We are not liable for technical interruptions or temporary service unavailability</li>
              <li>Maximum liability for any claim is limited to the amount paid for subscription services</li>
              <li>We disclaim liability for decisions made based solely on AI-generated content</li>
              <li>Users should consult qualified teachers and official resources for important educational decisions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Account Termination</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Users may terminate their accounts at any time through profile settings</li>
              <li>We reserve the right to terminate accounts for violation of terms or misuse</li>
              <li>Upon termination, access to premium features ceases immediately</li>
              <li>Educational progress data may be retained for a reasonable period as per privacy policy</li>
              <li>No refunds are provided for early termination after the trial period</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Updates and Modifications</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>We reserve the right to modify these terms at any time with reasonable notice</li>
              <li>Continued use of the platform after changes constitutes acceptance of new terms</li>
              <li>Material changes will be communicated via email or platform notifications</li>
              <li>Users who disagree with changes may terminate their accounts</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Governing Law and Disputes</h2>
            <p className="mb-4">
              Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is 
              subject to the laws of India.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>All legal disputes will be resolved in courts of competent jurisdiction in Haryana, India</li>
              <li>We encourage resolution of disputes through direct communication before legal action</li>
              <li>Users agree to attempt mediation before pursuing litigation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-2"><strong>Email:</strong> learnyzer.ai@gmail.com</p>

              <p className="mb-2"><strong>Business Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
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