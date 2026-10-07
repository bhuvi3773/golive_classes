"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Search, AlertTriangle, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function SuperAdminPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses?admin=true')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      });
  }, []);

  const handleApprove = async (courseId: string) => {
    if (!confirm("Are you sure you want to approve and publish this course?")) return;
    try {
      // First fetch the course to send the full body back, or just send a partial update if the backend supports it
      const course = courses.find(c => c._id === courseId);
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, status: 'published' })
      });
      if (res.ok) {
        setCourses(courses.map(c => c._id === courseId ? { ...c, status: 'published' } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (courseId: string) => {
    if (!confirm("Are you sure you want to reject this course? It will be sent back to the teacher.")) return;
    try {
      const course = courses.find(c => c._id === courseId);
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, status: 'rejected' })
      });
      if (res.ok) {
        setCourses(courses.map(c => c._id === courseId ? { ...c, status: 'rejected' } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCourses = courses.filter(c => c.status === 'pending');
  const publishedCourses = courses.filter(c => c.status === 'published');
  const rejectedCourses = courses.filter(c => c.status === 'rejected');

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Content Review Dashboard</h1>
        <p className="text-slate-500">Review courses submitted by teachers for quality and policy compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#12141f] p-6 rounded-xl border border-yellow-500/30">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Pending Review</h3>
          <p className="text-4xl font-bold text-yellow-500">{pendingCourses.length}</p>
        </div>
        <div className="bg-[#12141f] p-6 rounded-xl border border-green-500/30">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Approved & Live</h3>
          <p className="text-4xl font-bold text-green-500">{publishedCourses.length}</p>
        </div>
        <div className="bg-[#12141f] p-6 rounded-xl border border-red-500/30">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Rejected</h3>
          <p className="text-4xl font-bold text-red-500">{rejectedCourses.length}</p>
        </div>
      </div>

      <div className="bg-[#12141f] rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" /> Action Required: Pending Courses
          </h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading courses...</div>
        ) : pendingCourses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <CheckCircle size={48} className="mb-4 text-green-500/50" />
            <p>All caught up! No courses pending review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Course Details</th>
                  <th className="px-6 py-4 font-semibold">Instructor</th>
                  <th className="px-6 py-4 font-semibold">Content Stats</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {pendingCourses.map(course => (
                  <tr key={course._id} className="hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{course.title}</p>
                          <p className="text-xs text-yellow-500 mt-0.5 font-medium">Pending Review</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {course.instructor || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">
                        {course.curriculum?.length || 0} Sections
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/courses/${course._id}/play`} target="_blank">
                          <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-slate-900 rounded text-xs font-bold transition-colors flex items-center gap-1">
                            <PlayCircle size={14} /> Review Content
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleApprove(course._id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(course._id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
