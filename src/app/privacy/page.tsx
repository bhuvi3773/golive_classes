import React from 'react';

export const metadata = {
  title: 'Privacy Policy | GoLive Classes',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-8 my-4 sm:my-6">
      <div className="editorial-card rounded-2xl p-5 sm:p-12 bg-[#FFFFFF]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#24483C]">Privacy & Data Policy</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B2E26] mt-1 mb-3">Privacy Policy</h1>
        <p className="text-xs uppercase tracking-wider text-[#C96F4A] font-semibold mb-8 pb-4 border-b border-[#E9DFCC]">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
        
        <div className="space-y-6 text-[#4A5E54] text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">1. Information We Collect</h2>
            <p>
              We collect information you provide directly during registration, enrollment, or platform communication, 
              including name, email address, phone number, and learning metrics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">2. How We Use Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide, track, and certificate your course progress.</li>
              <li>To issue receipts, invoices, and transaction confirmations.</li>
              <li>To deliver academic notifications, course updates, and mentor replies.</li>
              <li>To secure platform integrity and prevent unauthorized distribution.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">3. Data Storage & Encryption</h2>
            <p>
              All passwords are cryptographically hashed using standard security protocols. Payment credentials 
              are processed directly by certified payment gateways and are never stored on our application servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">4. Cookie & Session Policy</h2>
            <p>
              We utilize encrypted session cookies strictly to authenticate your account and ensure secure access 
              to enrolled course videos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">5. Inquiries & Requests</h2>
            <p>
              For inquiries regarding personal data, account deletion, or policy questions, email us at privacy@goliveclasses.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
