"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, PlayCircle, BookOpen } from "lucide-react";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/wishlist')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWishlist(data);
        setLoading(false);
      });
  }, []);

  const handleRemove = async (courseId: string) => {
    try {
      await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      setWishlist(wishlist.filter(c => c.id !== courseId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#C96F4A]">Saved Modules</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B2E26] mt-0.5 mb-1">My Academic Wishlist</h1>
        <p className="text-[#4A5E54] text-sm">Courses and certifications saved for future enrollment.</p>
      </div>

      {loading ? (
        <div className="text-[#72857C] text-sm">Loading saved modules...</div>
      ) : wishlist.length === 0 ? (
        <div className="editorial-card bg-[#FFFFFF] border border-[#E9DFCC] rounded-2xl p-6 sm:p-12 text-center flex flex-col items-center max-w-md mx-auto">
          <Heart size={44} className="text-[#D8CCB5] mb-3" />
          <h2 className="text-xl font-bold text-[#1B2E26] mb-1.5">Your wishlist is currently empty</h2>
          <p className="text-[#4A5E54] text-sm mb-6">Explore our curriculum catalog to find subjects you wish to master.</p>
          <Link href="/courses" className="bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
            Browse Syllabus
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(course => (
            <div key={course.id} className="editorial-card rounded-xl overflow-hidden bg-[#FFFFFF] flex flex-col group">
              <div className="aspect-video bg-[#F4EFE6] relative overflow-hidden border-b border-[#E9DFCC]">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#EEF3EC]">
                    <BookOpen size={36} className="text-[#24483C]/30" />
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 flex gap-2">
                  <button 
                    onClick={() => handleRemove(course.id)}
                    className="p-2 bg-[#FFFFFF]/90 hover:bg-[#C96F4A] hover:text-[#FFFFFF] backdrop-blur-sm rounded-full text-[#C96F4A] transition-colors border border-[#E9DFCC] shadow-xs"
                    title="Remove from wishlist"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="text-[11px] font-bold text-[#24483C] mb-1.5 uppercase tracking-wider">{course.category}</div>
                <h3 className="font-bold text-base mb-2 text-[#1B2E26] line-clamp-2 leading-snug">{course.title}</h3>
                <div className="mt-auto pt-4 border-t border-[#E9DFCC] flex items-center justify-between">
                  <span className="font-bold text-lg text-[#24483C]">${course.price}</span>
                  <Link href={`/courses/${course.id}`}>
                    <span className="text-xs text-[#24483C] hover:text-[#19332A] font-semibold">View Details →</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
