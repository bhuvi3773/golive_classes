import Link from "next/link";
import { PlayCircle, Star, Clock, BookOpen } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Course from "@/models/Course";
import Category from "@/models/Category";
import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await connectToDatabase();
  const user = await getUserFromCookie();

  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  const categories = await Category.find({});
  
  let filter: any = { status: 'published' };
  if (query) {
    filter = {
      ...filter,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };
  }
  
  const courses = await Course.find(filter).sort({ createdAt: -1 });

  return (
    <div className="space-y-8 pb-16">
      
      {!query ? (
        <>
          {/* Welcome Banner */}
          <div className="w-full bg-gradient-to-r from-[#1e2130] to-[#12141f] rounded-2xl p-8 border border-white/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name || "Student"}!</h1>
              <p className="text-gray-400">Ready to learn something new today? Let's dive in.</p>
            </div>
          </div>

          {/* Categories Section - Udemy Style (Pills) */}
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 delay-75">
            <h2 className="text-2xl font-bold text-white">Top Categories</h2>
            
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">More categories coming soon.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <Link 
                    href={`/courses?q=${encodeURIComponent(cat.name)}`}
                    key={cat._id.toString()} 
                    className="px-5 py-3 rounded-full bg-[#1e2130] border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 transition-all cursor-pointer font-medium text-sm text-gray-200"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        /* Search Results Header */
        <div className="pb-4 border-b border-white/10 animate-in fade-in">
          <h1 className="text-2xl font-bold text-white">
            {courses.length} result{courses.length !== 1 ? 's' : ''} for "{query}"
          </h1>
        </div>
      )}
      
      {/* Courses Section - Udemy Style Grid */}
      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 delay-150">
        {!query && (
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-white">Featured Courses</h2>
            <span className="text-sm text-blue-400 font-medium hover:text-blue-300 cursor-pointer">See all</span>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center p-12 bg-[#1e2130]/50 border border-white/5 rounded-2xl">
            {query ? (
              <>
                <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                <p className="text-gray-500">We couldn't find any courses matching "{query}". Try adjusting your search or browsing categories.</p>
              </>
            ) : (
              <p className="text-gray-500">No courses available yet. Check back soon!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Link href={`/courses/${course._id}`} key={course._id.toString()} className="group flex flex-col h-full cursor-pointer">
                {/* Thumbnail */}
                <div className="w-full aspect-video bg-[#1a1d2d] rounded-xl overflow-hidden relative border border-white/5 mb-3 group-hover:border-gray-500 transition-colors">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle size={32} className="text-gray-600" />
                    </div>
                  )}
                  {/* Hover Overlay Play Button */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                      <PlayCircle size={24} className="text-white fill-white" />
                    </div>
                  </div>
                </div>
                
                {/* Course Details */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-base font-bold text-gray-100 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 font-medium">{course.category}</p>
                  
                  {/* Ratings (Mocked for Udemy aesthetic) */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-xs font-bold text-yellow-500">4.8</span>
                    <div className="flex items-center text-yellow-500">
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} className="text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-500">(1,204)</span>
                  </div>

                  {/* Price */}
                  <div className="font-bold text-lg text-white mt-2">
                    ${course.price}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Keep Learning Section (Mock up) - Only show if not searching */}
      {!query && (
        <section className="space-y-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 delay-300">
          <h2 className="text-2xl font-bold text-white">Because you searched for "DevOps"</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1e2130] rounded-xl border border-white/5 p-4 flex gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
              <div className="w-32 aspect-video bg-gray-800 rounded-lg shrink-0"></div>
              <div className="flex flex-col justify-center">
                <h3 className="text-sm font-bold text-white line-clamp-2">Docker & Kubernetes: The Practical Guide</h3>
                <p className="text-xs text-gray-400 mt-1">Acme Instructors</p>
                <div className="font-bold text-sm text-white mt-1">$19.99</div>
              </div>
            </div>
            <div className="bg-[#1e2130] rounded-xl border border-white/5 p-4 flex gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
              <div className="w-32 aspect-video bg-gray-800 rounded-lg shrink-0"></div>
              <div className="flex flex-col justify-center">
                <h3 className="text-sm font-bold text-white line-clamp-2">AWS Certified Solutions Architect</h3>
                <p className="text-xs text-gray-400 mt-1">Cloud Gurus</p>
                <div className="font-bold text-sm text-white mt-1">$29.99</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
