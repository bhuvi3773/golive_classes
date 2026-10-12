"use client";

import { useEffect, useState } from 'react';
import { BarChart3, Users, DollarSign, BookOpen, TrendingUp, Clock, Activity, Target } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#24483C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-8 text-center text-[#8B381A] bg-[#C96F4A]/10 border border-[#C96F4A]/30 rounded-2xl max-w-md mx-auto my-12">
        Failed to load analytics records.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in text-[#1B2E26]">
      <div className="pb-6 border-b border-[#E9DFCC]">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Academic Intelligence</span>
        <h1 className="font-serif text-3xl font-bold text-[#1B2E26] tracking-tight">Performance Analytics</h1>
        <p className="text-[#556960] text-sm mt-0.5 capitalize">{data.role === 'admin' ? 'Faculty Member' : data.role} Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Cards depending on role */}
        {data.role === 'student' && (
          <>
            <StatCard icon={<BookOpen size={20} />} title="Enrolled Modules" value={data.stats.enrolledCourses} />
            <StatCard icon={<Clock size={20} />} title="Hours Dedicated" value={`${data.stats.hoursLearned}h`} />
            <StatCard icon={<Target size={20} />} title="Active Curriculum" value={data.stats.activeProgress} />
            <StatCard icon={<AwardIcon />} title="Diplomas Earned" value={data.stats.certificatesEarned} />
          </>
        )}
        
        {data.role === 'admin' && (
          <>
            <StatCard icon={<Users size={20} />} title="Total Scholars" value={data.stats.totalStudents} />
            <StatCard icon={<DollarSign size={20} />} title="Tuition Revenue" value={`$${data.stats.totalRevenue}`} />
            <StatCard icon={<BookOpen size={20} />} title="Masterclasses" value={data.stats.topSelling?.length || 0} />
          </>
        )}

        {data.role === 'superadmin' && (
          <>
            <StatCard icon={<Users size={20} />} title="Total Platform Scholars" value={data.stats.totalUsers} />
            <StatCard icon={<BookOpen size={20} />} title="Curriculum Catalog" value={data.stats.totalCourses} />
            <StatCard icon={<BarChart3 size={20} />} title="Published Modules" value={data.stats.publishedCourses} />
            <StatCard icon={<DollarSign size={20} />} title="Academy Revenue" value={`$${data.stats.totalRevenue}`} />
          </>
        )}
      </div>

      {(data.role === 'superadmin' || data.role === 'admin') && data.stats.topSelling && data.stats.topSelling.length > 0 && (
        <div className="bg-[#FAF7F0] border border-[#E9DFCC] p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-[#C96F4A]" size={20} />
            <h2 className="font-serif text-xl font-bold text-[#1B2E26]">Premier Enrolling Masterclasses</h2>
          </div>
          <div className="space-y-3">
            {data.stats.topSelling.map((course: any, idx: number) => (
              <div key={course.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#F8F4EC] border border-[#E9DFCC] hover:border-[#24483C]/40 transition-colors shadow-sm">
                <div className="w-10 h-10 bg-[#DCE6D8] rounded-lg flex items-center justify-center font-serif font-bold text-[#24483C]">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#1B2E26] line-clamp-1 text-sm">{course.title}</h3>
                  <p className="text-xs text-[#556960] uppercase tracking-wider">{course.category}</p>
                </div>
                <div className="text-right">
                  <div className="font-serif font-bold text-[#24483C] text-base">${course.price}</div>
                  <Link href={`/courses/${course.id}`} className="text-xs text-[#C96F4A] hover:underline font-semibold">Review Module</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Detailed Course Progress */}
      {data.studentStats && data.studentStats.courseProgressStats && data.studentStats.courseProgressStats.length > 0 && (
        <div className="bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-[#C96F4A]" size={20} />
            <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">
              Scholar Learning Trajectory
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.studentStats.courseProgressStats.map((course: any) => (
              <div key={course.id} className="bg-[#F8F4EC] border border-[#E9DFCC] hover:border-[#24483C]/40 transition-all p-5 rounded-xl flex flex-col shadow-sm">
                <div className="flex gap-4 mb-5">
                  <div className="w-16 h-16 rounded-lg bg-[#E9DFCC] overflow-hidden shrink-0 border border-[#E9DFCC]">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#556960]">
                        <BookOpen size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C96F4A] block mb-0.5">{course.category}</span>
                    <h3 className="font-serif font-bold text-[#1B2E26] line-clamp-2 text-sm leading-snug">{course.title}</h3>
                  </div>
                </div>
                
                <div className="mt-auto pt-3 border-t border-[#E9DFCC]/70">
                  <div className="flex justify-between items-end mb-1.5 text-xs">
                    <span className="font-medium text-[#556960]">Completion Ratio</span>
                    <span className="font-bold text-[#24483C]">{course.percentage}%</span>
                  </div>
                  <div className="w-full bg-[#E9DFCC] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#24483C] h-full rounded-full transition-all duration-700" 
                      style={{ width: `${course.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: any, title: string, value: string | number }) {
  return (
    <div className="bg-[#FAF7F0] p-6 border border-[#E9DFCC] border-t-3 border-t-[#24483C] rounded-2xl flex flex-col shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-[#DCE6D8] text-[#24483C] flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-[#556960] text-xs font-semibold uppercase tracking-wider">{title}</p>
      <h3 className="font-serif text-3xl font-bold text-[#1B2E26] mt-1">{value}</h3>
    </div>
  );
}

function AwardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
  );
}
