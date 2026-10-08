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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 font-sans">
      {/* Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 px-6 overflow-hidden border-b border-white/40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-emerald-400/30 via-teal-400/30 to-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-400/20 to-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md shadow-xl border border-white text-emerald-800 text-sm font-extrabold mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            #1 Online Learning Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mb-6 text-slate-900 drop-shadow-sm">
            Master the Skills to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 drop-shadow-sm">Build Your Future</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed mb-10 font-medium">
            Join thousands of students learning cutting-edge technologies. Expert-led courses, hands-on projects, and a clear path to career success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/courses" className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-slate-900/20 text-lg hover:-translate-y-1">
              Explore Courses
              <ArrowRight size={20} />
            </Link>
            {!user && (
              <Link href="/register" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border-2 border-emerald-500 text-emerald-700 px-8 py-4 rounded-xl font-bold transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-1">
                <UserPlus size={20} />
                Sign Up Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-white/40 backdrop-blur-md border-y border-white/50 py-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">500+</div>
            <div className="text-sm text-emerald-800">Active Learners</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">100+</div>
            <div className="text-sm text-emerald-800">Hours of Content</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">20+</div>
            <div className="text-sm text-emerald-800">Expert Instructors</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">4.8/5</div>
            <div className="text-sm text-emerald-800">Average Rating</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/20 backdrop-blur-sm px-6 border-b border-white/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Learn With Us?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Everything you need to master new technologies and advance your career, all in one platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <div className="bg-white/70 backdrop-blur-md border border-white shadow-xl p-8 rounded-3xl hover:border-emerald-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                <Video className="text-white w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Expert-Led Courses</h3>
              <p className="text-slate-600 leading-relaxed text-lg">Learn directly from industry professionals with years of real-world experience and deep technical knowledge.</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-md border border-white shadow-xl p-8 rounded-3xl hover:border-blue-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                <Code className="text-white w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Hands-On Projects</h3>
              <p className="text-slate-600 leading-relaxed text-lg">Build a portfolio of real-world applications as you learn. Stop watching and start doing.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-md border border-white shadow-xl p-8 rounded-3xl hover:border-violet-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                <Briefcase className="text-white w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Career Focused</h3>
              <p className="text-slate-600 leading-relaxed text-lg">Our curriculum is designed backward from what hiring managers are actually looking for right now.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {isPersonalized ? "Recommended for You" : "Featured Courses"}
              </h2>
              <p className="text-slate-500 max-w-2xl text-lg">
                {isPersonalized 
                  ? "Based on your interests and wishlist." 
                  : "Start learning the most highly-demanded skills."}
              </p>
            </div>
            <Link href="/courses" className="text-emerald-600 hover:text-blue-300 font-semibold flex items-center gap-1 group">
              View All Courses <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <div key={course.id.toString()} className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden hover:border-emerald-300 transition-all hover:-translate-y-2 shadow-xl hover:shadow-2xl flex flex-col h-full group">
                <div className="h-48 bg-slate-900 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-emerald-900 to-slate-900">
                      <span className="text-white/50 font-bold">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-extrabold text-emerald-700 shadow-lg shadow-black/10">
                    {course.category}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6">{course.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-900">
                      ${course.price.toFixed(2)}
                    </span>
                    <Link href={`/courses/${course.id}`}>
                      <button className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-6 py-2.5 rounded-xl transition-colors font-bold border border-emerald-200 hover:border-emerald-600 shadow-sm">
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
      <section className="py-24 bg-white/20 backdrop-blur-sm px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900 drop-shadow-sm">What Our Students Say</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-xl font-medium">Join thousands of students who have transformed their careers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {/* Testimonial 1 */}
            <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="flex gap-1 text-amber-400 mb-6 drop-shadow-sm">
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
              </div>
              <p className="text-slate-700 mb-8 italic text-lg leading-relaxed">"The hands-on projects were exactly what I needed. I didn't just watch videos, I actually built full-stack apps that I could show off in my portfolio."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg">R</div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Rahul S.</h4>
                  <p className="text-sm text-emerald-700 font-semibold">Software Engineer I</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="flex gap-1 text-amber-400 mb-6 drop-shadow-sm">
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
              </div>
              <p className="text-slate-700 mb-8 italic text-lg leading-relaxed">"The instructors here don't just teach syntax, they teach architecture and best practices. I cleared my technical interviews thanks to the deep dives here."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg">P</div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Priya M.</h4>
                  <p className="text-sm text-blue-700 font-semibold">Frontend Developer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="flex gap-1 text-amber-400 mb-6 drop-shadow-sm">
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
                <Star size={22} fill="currentColor" />
              </div>
              <p className="text-slate-700 mb-8 italic text-lg leading-relaxed">"GoLive Classes breaks down complex backend concepts into simple, digestible pieces. Highly recommended for anyone looking to seriously upskill."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">A</div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Aman K.</h4>
                  <p className="text-sm text-violet-700 font-semibold">Backend Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/50 py-16 bg-white/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 flex flex-col items-center gap-6">
          <img src="/logo.png" alt="GoLive Classes" className="h-20 w-auto max-w-[200px] object-contain drop-shadow-lg opacity-70 hover:opacity-100 transition-opacity" />
          <p>© {new Date().getFullYear()} GoLive Classes. All rights reserved.</p>
          <div className="flex gap-4 text-sm mt-2">
            <Link href="/terms" className="hover:text-emerald-600 transition-colors">Terms & Conditions</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
