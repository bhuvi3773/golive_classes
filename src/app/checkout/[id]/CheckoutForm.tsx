"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';

export default function CheckoutForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create order
      const res = await fetch('/api/checkout/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      
      const order = await res.json();
      
      if (!res.ok) {
        alert(order.error || "Failed to create order");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Usually fetched from env
        amount: order.amount,
        currency: order.currency,
        name: "GoLive LMS",
        description: "Course Enrollment",
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch('/api/checkout/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: courseId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              router.push(`/courses/${courseId}/play`);
            } else {
              alert(verifyData.error || "Verification failed");
              setLoading(false);
            }
          } catch (err) {
            alert("Verification failed");
            setLoading(false);
          }
        },
        theme: {
          color: "#10b981", // emerald-500
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Error initiating payment");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button 
        onClick={handlePayment} 
        disabled={loading}
        className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Pay Now & Enroll"}
      </button>
    </>
  );
}
