import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | GoLive Classes',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 sm:px-8 my-6">
      <div className="editorial-card rounded-2xl p-8 sm:p-12 bg-[#FFFFFF]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#24483C]">Legal Agreement</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B2E26] mt-1 mb-3">Terms & Conditions</h1>
        <p className="text-xs uppercase tracking-wider text-[#C96F4A] font-semibold mb-8 pb-4 border-b border-[#E9DFCC]">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
        
        <div className="space-y-6 text-[#4A5E54] text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using GoLive Classes, you accept and agree to be bound by the terms and provisions of this agreement. 
              If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">2. Description of Service</h2>
            <p>
              GoLive Classes is an academic e-learning platform that provides recorded modules and live interactive technical cohorts. 
              We reserve the right to modify or discontinue courses with appropriate prior notification to enrolled scholars.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">3. User Accounts & Registration</h2>
            <p>
              To enroll in courses and obtain certificates, you must create a verified account. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">4. Tuition & Refunds</h2>
            <p>
              All payments are processed securely through certified payment gateways. 
              We offer a 7-day money-back guarantee for all courses if you have completed less than 30% of the content. 
              To request a refund, please contact support@goliveclasses.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">5. Intellectual Property</h2>
            <p>
              All curriculum material, including syllabus guides, lecture videos, source code exercises, and assessments, 
              remains the intellectual property of GoLive Classes or its verified instructors. 
              Redistribution is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1B2E26] mb-2">6. Contact Information</h2>
            <p>
              If you have any questions regarding these Terms, contact our administration office at support@goliveclasses.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
