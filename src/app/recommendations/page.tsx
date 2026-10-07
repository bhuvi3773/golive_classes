"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';
import CoursePurchaseCard from '@/components/CoursePurchaseCard';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [type, setType] = useState('general');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recommendations')
      .then(res => res.json())
      .then(data => {
        if (data.recommendations) {
          setRecommendations(data.recommendations);
          setCategories(data.categories || []);
          setType(data.type);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-emerald-200 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
          <Sparkles className="text-emerald-600 w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Recommended for You</h1>
          {type === 'personalized' ? (
            <p className="text-blue-200/80">
              Because you are interested in <span className="font-bold text-blue-300">{categories.join(', ')}</span>, we think you'll love these courses.
            </p>
          ) : (
            <p className="text-blue-200/80">
              Here are some of our top-rated courses to kickstart your learning journey! Enroll in courses or add them to your wishlist to get personalized recommendations.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {recommendations.map((course) => (
          <div key={course._id} className="glass-card-light overflow-hidden hover:scale-[1.02] transition-transform duration-300 flex flex-col h-full border-blue-500/10">
            <div className="h-48 bg-gray-800 relative">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <Layers size={40} className="text-white/10" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-slate-900 border border-slate-200">
                {course.category}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xl font-bold text-slate-900">
                  ${course.price.toFixed(2)}
                </span>
                <Link href={`/courses/${course._id}`}>
                  <button className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg transition-colors flex items-center justify-center">
                    <ArrowRight size={20} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {recommendations.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          No recommendations available right now. Check back later!
        </div>
      )}
    </div>
  );
}
