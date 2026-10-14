"use client";

import Link from "next/link";
import { Plus, Search, Filter, Edit, Trash, Eye, Loader2, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

export default function CoursesManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch('/api/courses?admin=true')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCourses(courses.filter(c => c.id !== courseId));
      } else {
        alert("Failed to delete course.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting course.");
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-[#1B2E26]">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E9DFCC]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Course Management</span>
          <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">Faculty Curricula Catalog</h2>
          <p className="text-[#556960] text-xs mt-0.5">Author, structure, configure, and publish academic masterclasses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/courses/new">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm">
              <Plus size={16} />
              Author New Course
            </button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#FAF7F0] p-4 flex flex-col md:flex-row gap-4 justify-between items-center border border-[#E9DFCC] rounded-2xl shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#556960]" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search curricula by title or discipline..." 
            className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#24483C] transition-colors text-[#1B2E26] placeholder:text-[#556960]/60 shadow-inner"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FAF7F0] border border-[#E9DFCC] hover:bg-[#E9DFCC]/50 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#556960] hover:text-[#1B2E26] transition-colors shadow-sm">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-[#FAF7F0] overflow-hidden border border-[#E9DFCC] rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-max">
            <thead className="bg-[#F8F4EC] border-b border-[#E9DFCC] text-[#3D5A4C]">
              <tr>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Curriculum Details</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Discipline</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Tuition</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DFCC]/60 text-[#1B2E26]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-[#24483C] mx-auto" />
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#556960]">
                    No courses discovered. Click "Author New Course" to initiate a syllabus.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#F8F4EC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-[#E9DFCC] rounded-lg shrink-0 overflow-hidden border border-[#E9DFCC] flex items-center justify-center">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                          ) : (
                            <BookOpen size={16} className="text-[#556960]" />
                          )}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-sm text-[#1B2E26] line-clamp-1">{course.title}</p>
                          <p className="text-[11px] text-[#556960]">Instructor: {course.instructor || 'Faculty Admin'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-[#F8F4EC] border border-[#E9DFCC] rounded-lg text-[11px] font-medium text-[#24483C]">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-sm text-[#24483C]">${course.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        course.status === 'published' 
                          ? 'bg-[#DCE6D8] text-[#24483C] border-[#24483C]/30' 
                          : course.status === 'pending' 
                            ? 'bg-[#C96F4A]/10 text-[#8B381A] border-[#C96F4A]/30' 
                            : 'bg-[#E9DFCC] text-[#556960] border-[#E9DFCC]'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3 text-[#556960]">
                        <Link href={`/courses/${course.id}`} className="hover:text-[#24483C] p-1 transition-colors" title="View Public Page">
                          <Eye size={16} />
                        </Link>
                        <Link href={`/admin/courses/${course.id}/manage`} className="hover:text-[#24483C] p-1 transition-colors" title="Manage Curriculum">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(course.id)} className="hover:text-[#8B381A] p-1 transition-colors" title="Delete Course">
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
