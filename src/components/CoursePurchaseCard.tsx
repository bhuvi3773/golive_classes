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
      <div className="text-center mb-6 border-b border-white/10 pb-6">
        <span className="text-4xl font-extrabold text-white">${price}</span>
      </div>
      
      {isPurchased ? (
        <Link href={`/courses/${courseId}/play`}>
          <button className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2">
            <PlayCircle size={20} /> Continue Learning
          </button>
        </Link>
      ) : (
        <div className="flex gap-2">
          <button onClick={handleBuy} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-500/30">
            Buy Now
          </button>
          <button 
            onClick={toggleWishlist}
            className={`px-6 rounded-xl border flex items-center justify-center transition-colors ${inWishlist ? 'border-pink-500 text-pink-500 bg-pink-500/10' : 'border-white/10 hover:bg-slate-800 text-slate-300'}`}
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={24} fill={inWishlist ? "currentColor" : "none"} />
          </button>
        </div>
      )}
    </>
  );
}
