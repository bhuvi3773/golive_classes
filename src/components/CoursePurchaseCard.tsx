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
        if (Array.isArray(data) && data.some(c => c._id === courseId)) {
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
      <div className="text-center mb-6 border-b border-slate-200 pb-6">
        <span className="text-4xl font-extrabold text-slate-900">${price}</span>
      </div>
      
      {isPurchased ? (
        <Link href={`/courses/${courseId}/play`}>
          <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-2">
            <PlayCircle size={20} /> Continue Learning
          </button>
        </Link>
      ) : (
        <div className="flex gap-2">
          <button onClick={handleBuy} className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-900/20">
            Buy Now
          </button>
          <button 
            onClick={toggleWishlist}
            className={`px-6 rounded-xl border flex items-center justify-center transition-colors ${inWishlist ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-slate-200 hover:bg-slate-100 text-slate-500'}`}
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={24} fill={inWishlist ? "currentColor" : "none"} />
          </button>
        </div>
      )}
    </>
  );
}
