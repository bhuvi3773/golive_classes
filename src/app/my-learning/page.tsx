import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Course from "@/models/Course";
import { getUserFromCookie } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function MyLearningPage() {
  const user = await getUserFromCookie();
  
  // In a real app, we would query the Enrolled courses for this specific user.
  // For the MVP, we will fetch real courses from the DB to make it look professional,
  // but we'll pretend the user is enrolled in the first 2.
  await connectToDatabase();
  const allCourses = await Course.find({ status: 'published' }).limit(2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Learning</h1>
          <p className="text-gray-400 mt-1">Pick up right where you left off, Student.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search my courses..." 
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
          />
        </div>
      </div>

      {allCourses.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
            <BookOpen size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">You aren't enrolled in any courses yet</h2>
          <p className="text-gray-400 max-w-md mx-auto">Browse our catalog to find your next favorite course and expand your skill set.</p>
          <Link href="/">
            <button className="btn-primary mt-4">Explore Catalog</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allCourses.map((course) => (
            <div key={course._id.toString()} className="glass-card p-6 flex flex-col hover:border-blue-500/30 transition-colors">
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-24 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} className="w-full h-full object-cover" alt="thumbnail"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="text-gray-600" size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{course.category}</p>
                </div>
              </div>
              
              <div className="mt-auto space-y-4">
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-400">12% Complete</span>
                  <button className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold text-white transition-colors">
                    Resume
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
