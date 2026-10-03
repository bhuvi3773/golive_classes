import Link from "next/link";
import { LogIn, UserPlus, CheckCircle } from "lucide-react";
import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getUserFromCookie();

  if (user) {
    redirect('/courses');
  }

  return (
    <div className="min-h-screen bg-[#0a0c16] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-[#0a0c16]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="GoLive Classes" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white font-medium transition-colors hidden sm:block">
              Login
            </Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              India's Best IT Training Provider
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Tech Career</span> With Us
            </h1>
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
              Industry-led coding bootcamps, AI/ML courses, and Cloud training with job placement. Start your journey with expert mentors today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                <UserPlus size={20} />
                Sign Up Free
              </Link>
              <Link href="/login" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl font-semibold transition-all">
                <LogIn size={20} />
                Login
              </Link>
            </div>
            
            <div className="pt-6 flex flex-wrap items-center gap-6 text-sm text-gray-400 font-medium">
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> 95% Job Placement</div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Expert Mentors</div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-3xl blur-3xl"></div>
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" alt="Students learning" className="relative z-10 rounded-3xl border border-white/10 shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-gray-500 text-sm absolute bottom-0 w-full">
        <p>© {new Date().getFullYear()} GoLive Classes. All rights reserved.</p>
      </footer>
    </div>
  );
}
