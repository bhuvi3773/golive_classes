"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Layers, BookOpen } from 'lucide-react';

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
        <div className="w-8 h-8 border-4 border-[#24483C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto pb-16">
      <div className="editorial-card bg-[#FFFFFF] border border-[#E9DFCC] p-8 flex flex-col md:flex-row items-center gap-6 rounded-2xl shadow-sm">
        <div className="w-14 h-14 bg-[#EEF3EC] rounded-xl flex items-center justify-center shrink-0 border border-[#DCE6D8]">
          <Sparkles className="text-[#24483C] w-7 h-7" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C96F4A]">Personalized Path</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1B2E26] mt-0.5 mb-1.5">Curated Course Recommendations</h1>
          {type === 'personalized' ? (
            <p className="text-[#4A5E54] text-sm md:text-base leading-relaxed">
              Based on your active interest in <span className="font-bold text-[#24483C]">{categories.join(', ')}</span>, we selected these modules for your advancement.
            </p>
          ) : (
            <p className="text-[#4A5E54] text-sm md:text-base leading-relaxed">
              Explore foundational courses to begin building your academic portfolio. As you enroll and wishlist courses, recommendations will adapt.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {recommendations.map((course) => (
          <div key={course.id} className="editorial-card rounded-xl overflow-hidden flex flex-col h-full bg-[#FFFFFF]">
            <div className="h-44 bg-[#F4EFE6] relative overflow-hidden border-b border-[#E9DFCC]">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#EEF3EC]">
                  <BookOpen size={36} className="text-[#24483C]/30" />
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 bg-[#FFFFFF]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-[#24483C] border border-[#E9DFCC] shadow-xs">
                {course.category}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-base font-bold text-[#1B2E26] leading-snug mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-[#4A5E54] text-xs leading-relaxed line-clamp-2 mb-4">{course.description}</p>
              
              <div className="mt-auto pt-3.5 border-t border-[#E9DFCC] flex items-center justify-between">
                <span className="text-lg font-bold text-[#24483C]">
                  ${course.price.toFixed(2)}
                </span>
                <Link href={`/courses/${course.id}`}>
                  <button className="bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] p-2 rounded-lg transition-colors flex items-center justify-center shadow-xs">
                    <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {recommendations.length === 0 && (
        <div className="text-center py-16 text-[#72857C]">
          <div className="editorial-card rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto bg-[#FFFFFF]">
            <Sparkles className="w-12 h-12 text-[#D8CCB5] mb-2" />
            <h2 className="text-lg font-bold text-[#1B2E26]">No Recommendations Yet</h2>
            <p className="text-[#4A5E54] text-sm">Enroll in a course or save items to your wishlist to generate personalized suggestions.</p>
            <Link href="/courses" className="mt-3 bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] px-5 py-2 rounded-lg text-sm font-semibold transition-all">
              Explore Catalog
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
