"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

  return (
    <>
      <div className="text-center mb-6 border-b border-white/10 pb-6">
        <span className="text-4xl font-extrabold text-white">${price}</span>
      </div>
      
      {isPurchased ? (
        <Link href={`/courses/${courseId}/play`}>
          <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-2">
            <PlayCircle size={20} /> Continue Learning
          </button>
        </Link>
      ) : (
        <div className="flex gap-2">
          <button className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25">
            Buy Now
          </button>
          <button 
            onClick={toggleWishlist}
            className={`px-6 rounded-xl border flex items-center justify-center transition-colors ${inWishlist ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/10 hover:bg-white/5 text-gray-400'}`}
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={24} fill={inWishlist ? "currentColor" : "none"} />
          </button>
        </div>
      )}
    </>
  );
}
