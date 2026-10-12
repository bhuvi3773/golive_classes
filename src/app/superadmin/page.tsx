"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, PlayCircle } from "lucide-react";
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
      const course = courses.find(c => c.id === courseId);
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, status: 'published' })
      });
      if (res.ok) {
        setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'published' } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (courseId: string) => {
    if (!confirm("Are you sure you want to reject this course? It will be sent back to the teacher.")) return;
    try {
      const course = courses.find(c => c.id === courseId);
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, status: 'rejected' })
      });
      if (res.ok) {
        setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'rejected' } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCourses = courses.filter(c => c.status === 'pending');
  const publishedCourses = courses.filter(c => c.status === 'published');
  const rejectedCourses = courses.filter(c => c.status === 'rejected');

  return (
    <div className="p-8 space-y-8 text-[#1B2E26]">
      <div className="pb-4 border-b border-[#E9DFCC]">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Quality & Accreditation</span>
        <h1 className="font-serif text-3xl font-bold text-[#1B2E26] tracking-tight">Curriculum Review Dashboard</h1>
        <p className="text-[#556960] text-sm mt-0.5">Audit academic syllabi submitted by faculty for pedagogical rigor and policy compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FAF7F0] p-6 rounded-2xl border border-[#E9DFCC] border-l-4 border-l-[#C96F4A] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C96F4A] block mb-1">Awaiting Review</span>
          <p className="font-serif text-4xl font-bold text-[#1B2E26]">{pendingCourses.length}</p>
        </div>
        <div className="bg-[#FAF7F0] p-6 rounded-2xl border border-[#E9DFCC] border-l-4 border-l-[#24483C] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] block mb-1">Accredited & Published</span>
          <p className="font-serif text-4xl font-bold text-[#24483C]">{publishedCourses.length}</p>
        </div>
        <div className="bg-[#FAF7F0] p-6 rounded-2xl border border-[#E9DFCC] border-l-4 border-l-[#8B381A] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B381A] block mb-1">Returned for Revision</span>
          <p className="font-serif text-4xl font-bold text-[#8B381A]">{rejectedCourses.length}</p>
        </div>
      </div>

      <div className="bg-[#FAF7F0] rounded-2xl border border-[#E9DFCC] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#E9DFCC] flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#1B2E26] flex items-center gap-2">
            <AlertTriangle className="text-[#C96F4A]" size={20} /> Action Required: Pending Curricula
          </h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-[#556960] text-sm">Evaluating curriculum submissions...</div>
        ) : pendingCourses.length === 0 ? (
          <div className="p-12 text-center text-[#556960] flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#DCE6D8] text-[#24483C] flex items-center justify-center mb-3">
              <CheckCircle size={28} />
            </div>
            <p className="font-serif font-bold text-base text-[#1B2E26]">All Audits Complete</p>
            <p className="text-xs text-[#556960] mt-1">There are no course submissions pending accreditation at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4EC] border-b border-[#E9DFCC] text-[#3D5A4C]">
                <tr>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Curriculum Details</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Faculty Author</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Syllabus Scope</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DFCC]/60 text-[#1B2E26]">
                {pendingCourses.map(course => (
                  <tr key={course.id} className="hover:bg-[#F8F4EC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-[#E9DFCC] rounded-lg shrink-0 overflow-hidden border border-[#E9DFCC] flex items-center justify-center">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                          ) : (
                            <span className="text-[10px] text-[#556960]">No Art</span>
                          )}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-sm text-[#1B2E26] line-clamp-1">{course.title}</p>
                          <span className="text-[10px] bg-[#C96F4A]/10 text-[#8B381A] px-2 py-0.2 rounded font-bold uppercase">Awaiting Accreditation</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#1B2E26] font-medium">
                      {course.instructor || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-[#556960]">
                      {course.curriculum?.length || 0} Sections
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 flex-wrap sm:flex-nowrap">
                        <Link href={`/courses/${course.id}/play`} target="_blank">
                          <button className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#E9DFCC]/50 text-[#1B2E26] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 border border-[#E9DFCC] shadow-sm">
                            <PlayCircle size={14} /> Audit View
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleApprove(course.id)}
                          className="px-3.5 py-1.5 bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle size={14} /> Accredit
                        </button>
                        <button 
                          onClick={() => handleReject(course.id)}
                          className="px-3 py-1.5 bg-[#C96F4A]/10 hover:bg-[#C96F4A]/20 text-[#8B381A] border border-[#C96F4A]/30 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                        >
                          <XCircle size={14} /> Return
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
