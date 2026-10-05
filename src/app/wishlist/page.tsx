"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, PlayCircle } from "lucide-react";

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
      setWishlist(wishlist.filter(c => c._id !== courseId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Wishlist</h1>
        <p className="text-gray-400">Courses you've saved for later.</p>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading your wishlist...</div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center flex flex-col items-center">
          <Heart size={48} className="text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-6">Explore our catalog and find something to learn!</p>
          <Link href="/courses">
            <button className="btn-primary">Browse Courses</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(course => (
            <div key={course._id} className="bg-[#12141f] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all group flex flex-col">
              <div className="aspect-video bg-gray-800 relative overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle size={40} className="text-gray-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button 
                    onClick={() => handleRemove(course._id)}
                    className="p-2 bg-black/50 hover:bg-red-500 backdrop-blur-sm rounded-full text-white transition-colors"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider">{course.category}</div>
                <h3 className="font-bold text-lg mb-2 text-white line-clamp-2">{course.title}</h3>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="font-bold text-lg text-white">${course.price}</span>
                  <Link href={`/courses/${course._id}`}>
                    <span className="text-sm text-blue-400 hover:text-blue-300 font-medium">View Course</span>
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
