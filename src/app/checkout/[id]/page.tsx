import { redirect } from 'next/navigation';
import { getUserFromCookie } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import { ShieldCheck, CreditCard, Lock } from 'lucide-react';
import CheckoutForm from './CheckoutForm';

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const user = await getUserFromCookie();

  if (!user) {
    redirect('/login');
  }

  await connectToDatabase();
  const course = await Course.findById(id);

  if (!course) {
    redirect('/courses');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        {/* Mock Payment Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <Lock className="text-emerald-600 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Secure Checkout</h1>
          <p className="text-slate-500">Complete your purchase to unlock full lifetime access.</p>
        </div>

        {/* Order Summary & Mock Form */}
        <div className="glass-card-light overflow-hidden border border-slate-200">
          <div className="p-6 bg-slate-900 border-b border-slate-200 flex items-center gap-4">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-20 h-14 object-cover rounded shadow" />
            ) : (
              <div className="w-20 h-14 bg-blue-900/30 rounded flex items-center justify-center">
                <ShieldCheck className="text-emerald-600" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-slate-900 font-semibold line-clamp-1">{course.title}</h3>
              <p className="text-slate-500 text-sm">{course.category}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-900">${course.price}</div>
            </div>
          </div>

          <div className="p-8">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
              <CreditCard className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-emerald-700 font-semibold mb-1">Razorpay Secure Checkout</h4>
                <p className="text-sm text-emerald-700/80">
                  You will be securely redirected to Razorpay to complete your purchase via UPI, Card, or NetBanking.
                </p>
              </div>
            </div>

            <CheckoutForm courseId={id} />
          </div>
        </div>

      </div>
    </div>
  );
}
