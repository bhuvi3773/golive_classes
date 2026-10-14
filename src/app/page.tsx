import Link from "next/link";
import { LogIn, UserPlus, CheckCircle, Code, Briefcase, Video, Star, ArrowRight, BookOpen, Compass, Award } from "lucide-react";
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
    <div className="min-h-screen bg-[#F8F4EC] text-[#1B2E26] selection:bg-[#C96F4A]/25 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-[#E9DFCC] bg-[#FFFFFF]/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href={user ? "/my-learning" : "/"} className="flex items-center gap-2 shrink-0 group">
            <div className="relative bg-[#F8F4EC] p-1.5 sm:p-2 pl-3.5 sm:pl-4 md:pl-5 rounded-r-xl rounded-l-md border border-[#E9DFCC] shadow-sm flex items-center justify-center transition-all duration-300 group-hover:border-[#24483C]">
              {/* Binder rings */}
              <div className="absolute left-[-6px] md:left-[-8px] top-2 bottom-2 flex flex-col justify-between py-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-2.5 sm:w-3 md:w-4 h-1 sm:h-1.5 md:h-2 bg-[#D8CCB5] rounded-sm" />
                ))}
              </div>
              {/* Notebook spine line */}
              <div className="absolute left-2.5 sm:left-3 md:left-4 top-0 bottom-0 w-px bg-[#E9DFCC]"></div>
              
              <img src="/logo.png" alt="GoLive Classes" className="h-8 sm:h-10 md:h-12 w-auto max-w-[150px] sm:max-w-[200px] md:max-w-[250px] object-contain drop-shadow-sm group-hover:scale-105 transition-transform relative z-10 ml-1 md:ml-2" />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-[#4A5E54]">
            <Link href="/" className="text-[#24483C] font-semibold transition-colors">Home</Link>
            <Link href="/courses" className="hover:text-[#24483C] transition-colors">Courses</Link>
            <Link href="/live-classes" className="hover:text-[#24483C] transition-colors">Live Classes</Link>
            <Link href="/recommendations" className="hover:text-[#24483C] transition-colors flex items-center gap-1">
              Curated Picks
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <Link href="/my-learning" className="bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-[#4A5E54] hover:text-[#1B2E26] font-semibold text-xs sm:text-sm transition-colors hidden sm:block">
                  Sign In
                </Link>
                <Link href="/register" className="bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-sm">
                  Enroll Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-48 md:pb-28 px-4 sm:px-6 border-b border-[#E9DFCC] editorial-canvas">
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DCE6D8] border border-[#BED1B7] text-[#24483C] text-xs md:text-sm font-bold mb-6 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#24483C]"></span>
            Warm Editorial Academy
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.12] mb-6 text-[#1B2E26]">
            Every Skill Has a <br/>
            <span className="text-[#C96F4A] italic font-serif">Journey.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-[#4A5E54] max-w-2xl leading-relaxed mb-8 sm:mb-10 font-normal">
            Master software engineering, architecture, and design with carefully structured courses, deliberate practice, and real mentorship.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 w-full sm:w-auto">
            <Link href="/courses" className="flex items-center justify-center gap-2 bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] px-6 sm:px-8 py-3.5 rounded-xl font-bold transition-all shadow-md text-sm sm:text-base hover:-translate-y-0.5">
              Explore Syllabus
              <ArrowRight size={18} />
            </Link>
            {!user && (
              <Link href="/register" className="flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#F4EFE6] border border-[#E9DFCC] text-[#24483C] px-6 sm:px-8 py-3.5 rounded-xl font-bold transition-all text-sm sm:text-base shadow-sm hover:-translate-y-0.5">
                <UserPlus size={18} className="text-[#C96F4A]" />
                Join the Academy
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-[#FFFFFF] border-b border-[#E9DFCC] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
          <div className="border-r last:border-r-0 border-[#E9DFCC]">
            <div className="text-3xl md:text-4xl font-extrabold text-[#24483C] mb-1">50K+</div>
            <div className="text-xs md:text-sm text-[#4A5E54] font-medium uppercase tracking-wider">Students Trained</div>
          </div>
          <div className="border-r last:border-r-0 border-[#E9DFCC]">
            <div className="text-3xl md:text-4xl font-extrabold text-[#24483C] mb-1">95%</div>
            <div className="text-xs md:text-sm text-[#4A5E54] font-medium uppercase tracking-wider">Completion & Placement</div>
          </div>
          <div className="border-r last:border-r-0 border-[#E9DFCC]">
            <div className="text-3xl md:text-4xl font-extrabold text-[#24483C] mb-1">200+</div>
            <div className="text-xs md:text-sm text-[#4A5E54] font-medium uppercase tracking-wider">Master Instructors</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#C96F4A] mb-1">4.9 / 5</div>
            <div className="text-xs md:text-sm text-[#4A5E54] font-medium uppercase tracking-wider">Academic Rating</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-b border-[#E9DFCC] bg-[#F8F4EC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-[#1B2E26]">A Deliberate Way to Learn</h2>
            <p className="text-[#4A5E54] max-w-2xl mx-auto text-base md:text-lg">Structured learning paths backed by hands-on engineering problems and comprehensive review.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="editorial-card p-6 sm:p-8 bg-[#FFFFFF]">
              <div className="w-14 h-14 bg-[#EEF3EC] border border-[#DCE6D8] rounded-xl flex items-center justify-center mb-6 text-[#24483C]">
                <Video size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#1B2E26]">In-Depth Curriculums</h3>
              <p className="text-[#4A5E54] leading-relaxed text-sm">Every course is sequenced from fundamental principles to production architecture, without skipping steps.</p>
            </div>
            
            <div className="editorial-card p-6 sm:p-8 bg-[#FFFFFF]">
              <div className="w-14 h-14 bg-[#F4EFE6] border border-[#E9DFCC] rounded-xl flex items-center justify-center mb-6 text-[#C96F4A]">
                <Code size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#1B2E26]">Real Engineering Projects</h3>
              <p className="text-[#4A5E54] leading-relaxed text-sm">Build verifiable projects with database persistence, security enforcement, and cloud deployments.</p>
            </div>

            <div className="editorial-card p-6 sm:p-8 bg-[#FFFFFF]">
              <div className="w-14 h-14 bg-[#EEF3EC] border border-[#DCE6D8] rounded-xl flex items-center justify-center mb-6 text-[#24483C]">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#1B2E26]">Credentialed Certificates</h3>
              <p className="text-[#4A5E54] leading-relaxed text-sm">Earn verified certificates of completion that demonstrate mastery to hiring managers and teams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-b border-[#E9DFCC] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-[#C96F4A] tracking-wider uppercase">Curated Catalog</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-1 text-[#1B2E26]">
                {isPersonalized ? "Recommended for Your Path" : "Featured Academy Courses"}
              </h2>
              <p className="text-[#4A5E54] max-w-2xl text-base mt-2">
                {isPersonalized 
                  ? "Courses matching your selected disciplines and learning history." 
                  : "Comprehensive modules designed for immediate practical application."}
              </p>
            </div>
            <Link href="/courses" className="text-[#24483C] hover:text-[#19332A] font-bold flex items-center gap-1.5 text-sm group">
              Browse All Courses <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <div key={course.id.toString()} className="editorial-card rounded-2xl flex flex-col h-full bg-[#FFFFFF] overflow-hidden">
                <div className="h-44 bg-[#F4EFE6] relative overflow-hidden border-b border-[#E9DFCC]">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#EEF3EC]">
                      <BookOpen size={36} className="text-[#24483C]/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-[#FFFFFF]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#24483C] border border-[#E9DFCC] shadow-sm">
                    {course.category}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[#1B2E26] leading-snug mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-[#4A5E54] text-sm line-clamp-2 mb-6 leading-relaxed">{course.description}</p>
                  
                  <div className="mt-auto pt-4 border-t border-[#E9DFCC] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#72857C] block font-medium">Tuition</span>
                      <span className="text-xl font-bold text-[#24483C]">
                        ${course.price.toFixed(2)}
                      </span>
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <button className="bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] px-4 py-2 rounded-lg transition-colors text-sm font-semibold shadow-sm">
                        Course Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <div className="col-span-full py-16 text-center text-[#4A5E54] bg-[#FDFCF9] rounded-2xl border border-[#E9DFCC]">
                <p>New curriculum modules are currently being prepared.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-[#F4EFE6] px-4 sm:px-6 border-b border-[#E9DFCC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-[#24483C] tracking-wider uppercase">Student Outcomes</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B2E26] mt-1">Reflections from Our Graduates</h2>
            <p className="text-[#4A5E54] max-w-2xl mx-auto text-base mt-2">Hear from practitioners who advanced their skills in our learning cohorts.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E9DFCC] shadow-sm">
                <div className="flex gap-1 text-[#C96F4A] mb-4">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                </div>
                <p className="text-[#2C3E35] mb-6 italic text-sm leading-relaxed">"The structured curriculum and clear execution focus gave me the exact tools needed to transition into senior system design."</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E9DFCC]">
                  <div className="w-10 h-10 rounded-full bg-[#24483C] text-[#F8F4EC] flex items-center justify-center font-bold text-sm">S{i}</div>
                  <div>
                    <h4 className="font-bold text-[#1B2E26] text-sm">Alum {i}</h4>
                    <p className="text-xs text-[#4A5E54]">Staff Systems Engineer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[#72857C] text-sm text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#1B2E26] text-base">GoLive Classes</span>
            <span>— Warm Editorial Academy</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/courses" className="hover:text-[#24483C]">Courses</Link>
            <Link href="/terms" className="hover:text-[#24483C]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#24483C]">Privacy</Link>
          </div>
          <p>© {new Date().getFullYear()} GoLive Classes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
