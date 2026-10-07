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
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.error) {
    return <div className="p-8 text-center text-red-400">Failed to load analytics.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Analytics</h1>
        <p className="text-slate-500 capitalize">{data.role === 'admin' ? 'Teacher' : data.role} Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Cards depending on role */}
        {data.role === 'student' && (
          <>
            <StatCard icon={<BookOpen />} title="Enrolled Courses" value={data.stats.enrolledCourses} />
            <StatCard icon={<Clock />} title="Hours Learned" value={`${data.stats.hoursLearned}h`} />
            <StatCard icon={<Target />} title="Active Courses" value={data.stats.activeProgress} />
            <StatCard icon={<AwardIcon />} title="Certificates" value={data.stats.certificatesEarned} />
          </>
        )}
        
        {data.role === 'admin' && (
          <>
            <StatCard icon={<Users />} title="Total Students" value={data.stats.totalStudents} />
            <StatCard icon={<DollarSign />} title="Total Revenue" value={`$${data.stats.totalRevenue}`} />
            <StatCard icon={<BookOpen />} title="Top Courses" value={data.stats.topSelling?.length || 0} />
          </>
        )}

        {data.role === 'superadmin' && (
          <>
            <StatCard icon={<Users />} title="Total Platform Users" value={data.stats.totalUsers} />
            <StatCard icon={<BookOpen />} title="Total Courses" value={data.stats.totalCourses} />
            <StatCard icon={<BarChart3 />} title="Published Courses" value={data.stats.publishedCourses} />
            <StatCard icon={<DollarSign />} title="Est. Revenue" value={`$${data.stats.totalRevenue}`} />
          </>
        )}
      </div>

      {(data.role === 'superadmin' || data.role === 'admin') && data.stats.topSelling && data.stats.topSelling.length > 0 && (
        <div className="mt-12 glass-card-light p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="text-green-400" /> Top Selling Courses</h2>
          <div className="space-y-4">
            {data.stats.topSelling.map((course: any, idx: number) => (
              <div key={course._id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 border border-slate-200 hover:border-white/10 transition-colors">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center font-bold text-emerald-600">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-slate-500">{course.category}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">${course.price}</div>
                  <Link href={`/courses/${course._id}`} className="text-xs text-emerald-600 hover:underline">View Course</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Detailed Course Progress (Visible to Everyone) */}
      {data.studentStats && data.studentStats.courseProgressStats && data.studentStats.courseProgressStats.length > 0 && (
        <div className="mt-12 bg-white/60 backdrop-blur-md border border-white shadow-xl rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <Activity className="text-emerald-500" /> My Learning Trajectory
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {data.studentStats.courseProgressStats.map((course: any) => (
              <div key={course._id} className="bg-white/80 border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 rounded-2xl flex flex-col">
                <div className="flex gap-4 mb-6">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="text-slate-400" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-slate-900 line-clamp-2 text-lg">{course.title}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{course.category}</p>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700">Completion</span>
                    <span className="text-lg font-extrabold text-emerald-600">{course.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner border border-slate-200">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full relative transition-all duration-1000 ease-out" 
                      style={{ width: `${course.percentage}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent"></div>
                    </div>
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
    <div className="glass-card-light p-6 border-t-4 border-t-blue-500 flex flex-col">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
    </div>
  );
}

function AwardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
  );
}
