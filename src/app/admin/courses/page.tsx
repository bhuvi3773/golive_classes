"use client";

import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, Edit, Trash, Eye, Loader2 } from "lucide-react";
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
        setCourses(courses.filter(c => c._id !== courseId));
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
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Manage Courses</h2>
          <p className="text-slate-500 mt-1">Create, edit, and publish your courses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/courses/new">
            <button className="btn-primary flex items-center gap-2 py-2">
              <Plus size={18} />
              New Course
            </button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card-light p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..." 
            className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="glass-card-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Course Details</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No courses found. Click "New Course" to create one.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
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
                          <p className="text-xs text-slate-500 mt-0.5">Instructor: {course.instructor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">${course.price}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-green-500/20 text-green-400 border border-green-500/20 rounded-full text-xs font-medium">
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3 text-slate-500">
                        <Link href={`/courses/${course._id}`} className="hover:text-slate-900 transition-colors" title="View">
                          <Eye size={18} />
                        </Link>
                        <Link href={`/admin/courses/${course._id}/manage`} className="hover:text-blue-400 transition-colors" title="Manage">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(course._id)} className="hover:text-red-400 transition-colors" title="Delete">
                          <Trash size={18} />
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
