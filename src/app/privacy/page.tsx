import React from 'react';

export const metadata = {
  title: 'Privacy Policy | GoLive Classes',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 sm:px-8 my-12 relative">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div className="glass-card shadow-2xl rounded-3xl p-8 sm:p-12 relative z-10">
        <h1 className="text-4xl font-extrabold text-white mb-6 drop-shadow-sm">Privacy Policy</h1>
        <p className="text-teal-400 font-medium mb-10 pb-8 border-b border-white/10">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
          <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create or modify your account, 
            purchase a course, request customer support, or otherwise communicate with us. 
            This information may include: name, email address, phone number, and payment information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide, maintain, and improve our services (including tracking course progress).</li>
            <li>To process your transactions and send related information, including confirmations and invoices.</li>
            <li>To send you technical notices, updates, security alerts, and support messages.</li>
            <li>To respond to your comments, questions, and requests.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Storage & Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse, 
            and unauthorized access. User passwords are encrypted. Payment information is never stored on our servers 
            and is processed securely by our certified payment partners (Razorpay).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Cookies</h2>
          <p>
            We use cookies to keep you logged in and to analyze site traffic. You can set your browser to refuse all or some browser cookies, 
            but if you do, some parts of this site may become inaccessible or not function properly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Third-Party Services</h2>
          <p>
            We may share your information with third-party vendors, consultants, and other service providers who need access 
            to such information to carry out work on our behalf (e.g., payment processors, email delivery services).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@goliveclasses.com.
          </p>
        </section>
        </div>
      </div>
    </div>
  );
}
