import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | GoLive Classes',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 sm:px-8 my-12 relative">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div className="glass-card shadow-2xl rounded-3xl p-8 sm:p-12 relative z-10">
        <h1 className="text-4xl font-extrabold text-white mb-6 drop-shadow-sm">Terms & Conditions</h1>
        <p className="text-teal-400 font-medium mb-10 pb-8 border-b border-white/10">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
          <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using GoLive Classes, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by these terms, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Description of Service</h2>
          <p>
            GoLive Classes is an online e-learning platform that provides recorded and live technical courses. 
            We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. User Accounts & Registration</h2>
          <p>
            To purchase courses, you must create an account. You are responsible for maintaining the confidentiality of your account and password. 
            You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Payment & Refunds</h2>
          <p>
            All payments are processed securely through our payment provider (Razorpay). 
            We offer a 7-day money-back guarantee for all courses if you have watched less than 30% of the content. 
            To request a refund, please contact our support team.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Intellectual Property</h2>
          <p>
            All content included on the platform, such as text, graphics, logos, images, video clips, and software, 
            is the property of GoLive Classes or its content suppliers (instructors) and protected by international copyright laws.
            Unauthorized distribution or sharing of course materials is strictly prohibited and will result in immediate account termination.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@goliveclasses.com.
          </p>
        </section>
        </div>
      </div>
    </div>
  );
}
