import { redirect } from 'next/navigation';
import { getUserFromCookie } from '@/lib/auth';
import prisma from "@/lib/prisma";
import { ShieldCheck, CreditCard, Lock, BookOpen } from 'lucide-react';
import CheckoutForm from './CheckoutForm';

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const user = await getUserFromCookie();

  if (!user) {
    redirect('/login');
  }

  const course = await prisma.course.findUnique({ where: { id } });

  if (!course) {
    redirect('/courses');
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full">
        
        {/* Payment Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#EEF3EC] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#DCE6D8]">
            <Lock className="text-[#24483C] w-7 h-7" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C96F4A]">Encounter Desk</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B2E26] mt-0.5 mb-1.5">Academic Enrollment & Checkout</h1>
          <p className="text-[#4A5E54] text-sm">Complete your tuition payment to unlock immediate lifetime access.</p>
        </div>

        {/* Order Summary Card */}
        <div className="editorial-card rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E9DFCC] shadow-sm">
          <div className="p-4 sm:p-6 bg-[#FDFCF9] border-b border-[#E9DFCC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-lg border border-[#E9DFCC] shadow-xs shrink-0" />
              ) : (
                <div className="w-16 h-12 sm:w-20 sm:h-14 bg-[#EEF3EC] rounded-lg border border-[#DCE6D8] flex items-center justify-center shrink-0">
                  <BookOpen className="text-[#24483C]" size={22} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-[#C96F4A] uppercase tracking-wider">{course.category}</span>
                <h3 className="text-[#1B2E26] font-bold text-sm sm:text-base truncate">{course.title}</h3>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E9DFCC]">
              <span className="text-xs text-[#72857C] block font-medium">Tuition</span>
              <div className="text-xl font-extrabold text-[#24483C]">${course.price}</div>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            <div className="bg-[#EEF3EC] border border-[#DCE6D8] rounded-xl p-3.5 sm:p-4 mb-6 sm:mb-8 flex items-start gap-3">
              <CreditCard className="text-[#24483C] shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-[#24483C] font-bold text-sm mb-1">Encrypted Gateway Processing</h4>
                <p className="text-xs text-[#4A5E54] leading-relaxed">
                  You will complete payment through Razorpay via UPI, NetBanking, or Debit/Credit Card with 256-bit SSL encryption.
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
