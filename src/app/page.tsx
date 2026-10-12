import Link from "next/link";
import { LogIn, UserPlus, CheckCircle, Code, Briefcase, Video, Star, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getUserFromCookie();
  
  let courses: any[] = [];
  let isPersonalized = false;
  
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { purchasedCourses: true, wishlist: true }
    });
    if (dbUser) {
      const interestedCategories = new Set<string>();
      dbUser.purchasedCourses.forEach((course: any) => {
        if (course.category) interestedCategories.add(course.category);
      });
      dbUser.wishlist.forEach((course: any) => {
        if (course.category) interestedCategories.add(course.category);
      });
      if (dbUser.viewedCategories) {
        dbUser.viewedCategories.forEach((cat: string) => interestedCategories.add(cat));
      }
      
      const categoryArray = Array.from(interestedCategories);
      const purchasedIds = dbUser.purchasedCourses.map((c: any) => c.id);
      
      if (categoryArray.length > 0) {
        courses = await prisma.course.findMany({
          where: {
            id: { notIn: purchasedIds },
            status: 'published',
            category: { in: categoryArray }
          },
          take: 6
        });
        isPersonalized = true;
      }
      
      if (courses.length < 6) {
        const extraCourses = await prisma.course.findMany({
          where: {
            id: { notIn: [...purchasedIds, ...courses.map(r => r.id)] },
            status: 'published'
          },
          take: 6 - courses.length
        });
        courses = [...courses, ...extraCourses];
      }
    } else {
       courses = await prisma.course.findMany({ where: { status: 'published' }, take: 6 });
    }
  } else {
    courses = await prisma.course.findMany({ where: { status: 'published' }, take: 6 });
  }

  return (
    <div className="min-h-screen mesh-bg text-slate-100 selection:bg-teal-500/30 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href={user ? "/my-learning" : "/"} className="flex items-center gap-2 shrink-0 group">
            <div className="relative bg-[#fdfcfb] p-2 pl-4 md:pl-5 rounded-r-xl rounded-l-md border border-slate-300 shadow-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-teal-900/40 group-hover:border-teal-400/50">
              {/* Binder rings */}
              <div className="absolute left-[-6px] md:left-[-8px] top-2 bottom-2 flex flex-col justify-between py-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-3 md:w-4 h-1.5 md:h-2 bg-slate-300 rounded-sm shadow-sm border border-slate-400" />
                ))}
              </div>
              {/* Notebook spine line */}
              <div className="absolute left-3 md:left-4 top-0 bottom-0 w-px bg-slate-200"></div>
              
              <img src="/logo.png" alt="GoLive Classes" className="h-10 md:h-12 w-auto max-w-[200px] md:max-w-[250px] object-contain drop-shadow-sm group-hover:scale-105 transition-transform relative z-10 ml-1 md:ml-2" />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <Link href="/" className="hover:text-teal-400 transition-colors text-teal-400">Home</Link>
            <Link href="/courses" className="hover:text-teal-400 transition-colors">Courses</Link>
            <Link href="/recommendations" className="hover:text-teal-400 transition-colors flex items-center gap-1">
              Recommendations
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/my-learning" className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-teal-900/50">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors hidden sm:block">
                  Login
                </Link>
                <Link href="/register" className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl hover:shadow-teal-900/50">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 px-6 overflow-hidden border-b border-white/10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/50 backdrop-blur-md shadow-xl border border-white/10 text-teal-300 text-sm font-extrabold mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            #1 Online Learning Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mb-6 text-white drop-shadow-lg">
            Master the Skills to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 drop-shadow-sm">Build Your Future</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-10 font-medium">
            Join thousands of students learning cutting-edge technologies. Expert-led courses, hands-on projects, and a clear path to career success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/courses" className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-teal-900/50 text-lg hover:-translate-y-1">
              Explore Courses
              <ArrowRight size={20} />
            </Link>
            {!user && (
              <Link href="/register" className="flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800/80 border border-teal-500/50 text-teal-300 px-8 py-4 rounded-xl font-bold transition-all text-lg shadow-lg hover:shadow-teal-900/20 hover:-translate-y-1">
                <UserPlus size={20} />
                Sign Up Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-slate-900/40 backdrop-blur-md border-y border-white/5 py-12 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">50K+</div>
            <div className="text-sm text-teal-400 font-medium">Students Trained</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">95%</div>
            <div className="text-sm text-teal-400 font-medium">Placement Rate</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">200+</div>
            <div className="text-sm text-teal-400 font-medium">Expert Instructors</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">4.9/5</div>
            <div className="text-sm text-teal-400 font-medium">Average Rating</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900/20 backdrop-blur-sm px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Why Learn With Us?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Everything you need to master new technologies and advance your career, all in one platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <div className="glass-card p-8 hover:border-teal-400/50">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                <Video className="text-teal-400 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Expert-Led Courses</h3>
              <p className="text-slate-300 leading-relaxed text-lg">Learn directly from industry professionals with years of real-world experience and deep technical knowledge.</p>
            </div>
            
            <div className="glass-card p-8 hover:border-teal-400/50">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                <Code className="text-teal-400 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Hands-On Projects</h3>
              <p className="text-slate-300 leading-relaxed text-lg">Build a portfolio of real-world applications as you learn. Stop watching and start doing.</p>
            </div>

            <div className="glass-card p-8 hover:border-teal-400/50">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                <Briefcase className="text-teal-400 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Career Focused</h3>
              <p className="text-slate-300 leading-relaxed text-lg">Our curriculum is designed backward from what hiring managers are actually looking for right now.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {isPersonalized ? "Recommended for You" : "Featured Courses"}
              </h2>
              <p className="text-slate-400 max-w-2xl text-lg">
                {isPersonalized 
                  ? "Based on your interests and wishlist." 
                  : "Start learning the most highly-demanded skills."}
              </p>
            </div>
            <Link href="/courses" className="text-teal-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group">
              View All Courses <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <div key={course.id.toString()} className="glass-card rounded-3xl flex flex-col h-full group hover:border-teal-400/40">
                <div className="h-48 bg-slate-900 relative overflow-hidden border-b border-white/5">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-teal-900/50 to-slate-900">
                      <span className="text-white/30 font-bold">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-extrabold text-teal-300 border border-teal-500/30 shadow-lg shadow-black/50">
                    {course.category}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white leading-tight mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-6">{course.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">
                      ${course.price.toFixed(2)}
                    </span>
                    <Link href={`/courses/${course.id}`}>
                      <button className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 hover:text-white px-6 py-2.5 rounded-xl transition-colors font-bold border border-teal-500/30 hover:border-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.1)]">
                        View Course
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400">
                <p>No courses available right now. Instructors are adding content!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900/40 backdrop-blur-sm px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">What Our Students Say</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium">Join thousands of students who have transformed their careers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card-light p-10 rounded-3xl hover:-translate-y-2">
                <div className="flex gap-1 text-amber-400 mb-6 drop-shadow-sm">
                  <Star size={22} fill="currentColor" />
                  <Star size={22} fill="currentColor" />
                  <Star size={22} fill="currentColor" />
                  <Star size={22} fill="currentColor" />
                  <Star size={22} fill="currentColor" />
                </div>
                <p className="text-slate-200 mb-8 italic text-lg leading-relaxed">"This platform completely changed my career trajectory. The instructors are amazing and the hands-on projects gave me the confidence to pass my technical interviews."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-900/50">S{i}</div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">Student {i}</h4>
                    <p className="text-sm text-teal-400 font-semibold">Placed at Top Tech Co.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 flex flex-col items-center gap-6">
          <div className="relative bg-[#fdfcfb] p-2 pl-4 rounded-r-xl rounded-l-md border border-slate-300 shadow-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-teal-900/40 group-hover:border-teal-400/50 group inline-flex">
            {/* Binder rings */}
            <div className="absolute left-[-6px] top-2 bottom-2 flex flex-col justify-between py-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-3 h-1.5 bg-slate-300 rounded-sm shadow-sm border border-slate-400" />
              ))}
            </div>
            {/* Notebook spine line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200"></div>
            
            <img src="/logo.png" alt="GoLive Classes" className="h-12 w-auto max-w-[200px] object-contain drop-shadow-sm opacity-80 group-hover:opacity-100 transition-opacity relative z-10 ml-1" />
          </div>
          <p>© {new Date().getFullYear()} GoLive Classes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
