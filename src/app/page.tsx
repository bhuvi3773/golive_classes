import Link from "next/link";
import { PlayCircle, ArrowRight, LayoutDashboard } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Course from "@/models/Course";
import Category from "@/models/Category";
import { getUserFromCookie } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  await connectToDatabase();
  const user = await getUserFromCookie();

  // Fetch real data from DB
  const categories = await Category.find({});
  const courses = await Course.find({ status: 'published' }).sort({ createdAt: -1 }).limit(6);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-16 flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-violet-600/20 z-0"></div>
        <div className="relative z-10 space-y-6 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Master the Future with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
              GoLive Classes
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            From complete beginners to advanced professionals. Learn the skills you need to build the technology of tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {!user ? (
              <>
                <Link href="/register">
                  <button className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
                    Start Learning Today
                  </button>
                </Link>
                <Link href="#courses">
                  <button className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white font-medium w-full sm:w-auto">
                    <PlayCircle size={20} />
                    Explore Courses
                  </button>
                </Link>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link href="/my-learning">
                  <button className="btn-primary text-base px-8 py-3 w-full sm:w-auto flex items-center gap-2">
                    <PlayCircle size={20} />
                    Continue Learning
                  </button>
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/courses/new">
                    <button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-lg text-base px-8 py-3 w-full sm:w-auto flex items-center justify-center gap-2 transition-all">
                      <LayoutDashboard size={20} />
                      Publish New Course
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Explore Categories</h2>
            <p className="text-gray-400 mt-1">Find the perfect path for your career</p>
          </div>
          {user?.role === 'admin' && (
            <Link href="/admin/categories">
              <button className="text-violet-400 hover:text-violet-300 text-sm font-medium border border-violet-500/30 px-4 py-2 rounded-lg hover:bg-violet-500/10 transition-colors">
                + Manage Categories
              </button>
            </Link>
          )}
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center p-12 glass-card">
            <p className="text-gray-500">No categories found. Instructors are adding them now!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat._id.toString()} className="glass-card p-6 hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
                  {cat.name.charAt(0)}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{cat.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{cat.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Featured Courses */}
      <section id="courses" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Popular Courses</h2>
            <p className="text-gray-400 mt-1">Start your journey with our top-rated content</p>
          </div>
          {user?.role === 'admin' && (
            <Link href="/admin/courses">
              <button className="text-violet-400 hover:text-violet-300 text-sm font-medium border border-violet-500/30 px-4 py-2 rounded-lg hover:bg-violet-500/10 transition-colors">
                + Manage Courses
              </button>
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="text-center p-12 glass-card">
            <p className="text-gray-500">Courses are being developed. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link href={`/courses/${course._id}`} key={course._id.toString()}>
                <div className="glass-card flex flex-col h-full hover:border-blue-500/50 hover:bg-white/5 transition-all group overflow-hidden">
                  <div className="h-48 bg-[#1e2130] w-full relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle size={40} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-white/5 text-gray-300 rounded-md">{course.category}</span>
                      <span className="text-lg font-bold text-white">${course.price}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">{course.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">{course.description}</p>
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-sm font-medium text-blue-400 group-hover:text-blue-300">
                      Learn More <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
