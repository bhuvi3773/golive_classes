"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlayCircle, Heart } from "lucide-react";

export default function CoursePurchaseCard({ courseId, price, isPurchasedInitial }: { courseId: string, price: number, isPurchasedInitial: boolean }) {
  const [isPurchased, setIsPurchased] = useState(isPurchasedInitial);
  const [inWishlist, setInWishlist] = useState(false);
  
  useEffect(() => {
    fetch('/api/user/wishlist')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.some(c => c.id === courseId)) {
          setInWishlist(true);
        }
      });
  }, [courseId]);

  const toggleWishlist = async () => {
    try {
      const res = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      const data = await res.json();
      if (data.success) {
        setInWishlist(data.isAdded);
      } else {
        alert("Please log in to add to wishlist.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const router = useRouter();
  
  const handleBuy = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (data.user) {
        // Direct free enrollment flow when price is exactly 0
        if (price === 0) {
          const enrollRes = await fetch(`/api/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const enrollData = await enrollRes.json();
          if (enrollRes.ok) {
            setIsPurchased(true);
            router.push(`/courses/${courseId}/play`);
            return;
          } else {
            alert(enrollData.error || "Enrollment failed. Please try again.");
            return;
          }
        }
        router.push(`/checkout/${courseId}`);
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    }
  };

  return (
    <>
      <div className="text-center mb-6 border-b border-[#E9DFCC] pb-6">
        <span className="text-4xl font-extrabold text-[#24483C]">
          {price === 0 ? "Free" : `$${price}`}
        </span>
      </div>
      
      {isPurchased ? (
        <Link href={`/courses/${courseId}/play`}>
          <button className="w-full bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
            <PlayCircle size={20} /> Continue Learning
          </button>
        </Link>
      ) : (
        <div className="flex gap-2.5">
          <button onClick={handleBuy} className="flex-1 bg-[#C96F4A] hover:bg-[#B25D39] text-[#FFFFFF] font-bold py-3.5 rounded-xl transition-all shadow-sm hover:-translate-y-0.5">
            {price === 0 ? "Enroll Free" : "Enroll Now"}
          </button>
          <button 
            onClick={toggleWishlist}
            className={`px-5 rounded-xl border flex items-center justify-center transition-colors ${inWishlist ? 'border-[#C96F4A] text-[#C96F4A] bg-[#C96F4A]/10' : 'border-[#E9DFCC] hover:bg-[#F4EFE6] text-[#72857C]'}`}
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
          </button>
        </div>
      )}
    </>
  );
}
