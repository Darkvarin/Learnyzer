import { SEOHead } from "@/components/seo/seo-head";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy - Learnyzer"
        description="Learn how Learnyzer Edtech protects your privacy and personal information on our educational platform."
      />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
          
          <div className="mb-8 text-sm text-muted-foreground text-center">
            Last updated on Jul 3rd 2025
          </div>

          <p className="mb-6 text-lg">
            This privacy policy sets out how Learnyzer Edtech uses and protects any information 
            that you give Learnyzer Edtech when you visit their website and/or agree to purchase from them.
          </p>

          <p className="mb-6">
            Learnyzer Edtech is committed to ensuring that your privacy is protected. Should we ask you to 
            provide certain information by which you can be identified when using this website, and then you 
            can be assured that it will only be used in accordance with this privacy statement.
          </p>

          <p className="mb-8">
            Learnyzer Edtech may change this policy from time to time by updating this page. You should check 
            this page from time to time to ensure that you adhere to these changes.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We May Collect</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Name and user credentials</li>
              <li>Contact information including email address and mobile number</li>
              <li>Educational information such as grade level, exam preferences, and study progress</li>
              <li>Demographic information such as postcode, preferences and interests, if required</li>
              <li>AI interaction data and learning analytics for personalized tutoring</li>
              <li>Payment information for subscription services</li>
              <li>Other information relevant to customer surveys and/or offers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What We Do With the Information We Gather</h2>
            <p className="mb-4">
              We require this information to understand your needs and provide you with a better service, 
              and in particular for the following reasons:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Internal record keeping and account management</li>
              <li>We may use the information to improve our products and services</li>
              <li>Personalizing AI tutoring experiences based on your learning progress and exam goals</li>
              <li>
                We may periodically send promotional emails about new products, special offers or other 
                information which we think you may find interesting using the email address which you have provided
              </li>
              <li>
                From time to time, we may also use your information to contact you for market research purposes. 
                We may contact you by email, phone, fax or mail. We may use the information to customise the 
                website according to your interests
              </li>
              <li>Providing customer support and technical assistance</li>
              <li>Processing subscription payments and managing billing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="mb-4">
              We are committed to ensuring that your information is secure. In order to prevent unauthorised 
              access or disclosure we have put in suitable security measures including:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Encrypted data transmission using HTTPS</li>
              <li>Secure password hashing and authentication systems</li>
              <li>Regular security audits and monitoring</li>
              <li>Restricted access to personal data on a need-to-know basis</li>
              <li>Secure payment processing through trusted payment gateways</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p className="mb-4">
              A cookie is a small file which asks permission to be placed on your computer's hard drive. 
              Once you agree, the file is added and the cookie helps analyze web traffic or lets you know 
              when you visit a particular site. Cookies allow web applications to respond to you as an 
              individual. The web application can tailor its operations to your needs, likes and dislikes 
              by gathering and remembering information about your preferences.
            </p>
            
            <p className="mb-4">
              We use traffic log cookies to identify which pages are being used. This helps us analyze data 
              about webpage traffic and improve our website in order to tailor it to customer needs. We only 
              use this information for statistical analysis purposes and then the data is removed from the system.
            </p>

            <p className="mb-4">
              Overall, cookies help us provide you with a better website, by enabling us to monitor which pages 
              you find useful and which you do not. A cookie in no way gives us access to your computer or any 
              information about you, other than the data you choose to share with us.
            </p>

            <p className="mb-6">
              You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but 
              you can usually modify your browser setting to decline cookies if you prefer. This may prevent 
              you from taking full advantage of the website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Educational Data Protection</h2>
            <p className="mb-4">
              As an educational platform, we take special care with student data:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Learning progress and AI interaction data is used solely for educational improvement</li>
              <li>Student performance data is never shared with third parties without explicit consent</li>
              <li>We comply with applicable educational privacy laws and regulations</li>
              <li>Parents and students have the right to access and request deletion of educational records</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Controlling Your Personal Information</h2>
            <p className="mb-4">
              You may choose to restrict the collection or use of your personal information in the following ways:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                Whenever you are asked to fill in a form on the website, look for the box that you can click 
                to indicate that you do not want the information to be used by anybody for direct marketing purposes
              </li>
              <li>
                If you have previously agreed to us using your personal information for direct marketing purposes, 
                you may change your mind at any time by writing to or emailing us at <strong>learnyzer.ai@gmail.com</strong>
              </li>
              <li>You can update your privacy preferences in your account settings</li>
              <li>You can request to download or delete your personal data at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing and Third Parties</h2>
            <p className="mb-4">
              We will not sell, distribute or lease your personal information to third parties unless we have 
              your permission or are required by law to do so. We may use your personal information to send you 
              promotional information about third parties which we think you may find interesting if you tell us 
              that you wish this to happen.
            </p>
            
            <p className="mb-6">
              We may share aggregated, non-personally identifiable information with educational researchers and 
              partners to improve educational outcomes, but individual student data remains confidential.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Correction and Contact</h2>
            <p className="mb-4">
              If you believe that any information we are holding on you is incorrect or incomplete, please contact us at:
            </p>
            
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="mb-2"><strong>Email:</strong> learnyzer.ai@gmail.com</p>

              <p className="mb-2"><strong>Address:</strong></p>
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
              We will promptly correct any information found to be incorrect and respond to your inquiry 
              within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Access your personal data that we hold</li>
              <li>Request correction of inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing your personal data</li>
              <li>Request transfer of your personal data</li>
              <li>Withdraw consent at any time where we rely on consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="mb-4">
              We may update this privacy policy from time to time to reflect changes in our practices or for 
              other operational, legal, or regulatory reasons. We will notify you of any material changes by 
              posting the new privacy policy on this page and updating the "Last updated" date above.
            </p>
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