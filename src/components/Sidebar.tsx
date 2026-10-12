"use client";

import Link from "next/link";
import { BookOpen, Video, Home, User, LogOut, Shield, Heart, FileText, Award, Receipt, Sparkles, BarChart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setRole(data.user.role);
          setIsLoggedIn(true);
        }
      })
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    try {
      // Proper logout by hitting the backend to delete HttpOnly cookie
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout error", error);
    }
    setIsLoggedIn(false);
    setRole(null);
    window.location.href = '/login';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-[72px] hover:w-64 transition-all duration-300 group overflow-hidden bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 h-screen fixed left-0 top-0 flex-col hidden md:flex z-50 shadow-[8px_0_32px_-12px_rgba(0,0,0,0.5)]">
        <div className="p-6 flex items-center justify-center group-hover:justify-start">
          <Link href="/my-learning">
            <div className="flex items-center gap-2 cursor-pointer w-full ml-1 group">
              <div className="relative bg-[#fdfcfb] p-2 pl-4 rounded-r-xl rounded-l-md border border-slate-300 shadow-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-teal-900/40 group-hover:border-teal-400/50">
                {/* Binder rings */}
                <div className="absolute left-[-6px] top-2 bottom-2 flex flex-col justify-between py-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-3 h-1.5 bg-slate-300 rounded-sm shadow-sm border border-slate-400" />
                  ))}
                </div>
                {/* Notebook spine line */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200"></div>
                
                <img src="/logo.png" alt="GoLive Classes" className="h-12 w-auto max-w-full object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-105 relative z-10 ml-1" />
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-hidden group-hover:overflow-y-auto pb-20 hover:pr-2 transition-all">
          <Link
            href="/courses"
            className="flex items-center space-x-4 px-3 py-3 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Home size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">All Courses</span>
          </Link>

          <Link
            href="/my-learning"
            className="flex items-center space-x-4 px-3 py-3 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <BookOpen size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">My Learning</span>
          </Link>

          <Link
            href="/live-classes"
            className="flex items-center space-x-4 px-3 py-3 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Video size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Live Classes</span>
          </Link>

          <div className="pt-4 pb-2">
            <p className="text-xs font-bold text-slate-400 uppercase px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Student Features</p>
          </div>

          <Link
            href="/recommendations"
            className="flex items-center space-x-4 px-3 py-3 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Sparkles size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Recommendations</span>
          </Link>

          <Link
            href="/analytics"
            className="flex items-center space-x-4 px-3 py-3 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <BarChart size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">Analytics</span>
          </Link>

          <Link
            href="/wishlist"
            className="flex items-center space-x-4 px-3 py-3 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Heart size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Wishlist</span>
          </Link>

          <Link
            href="/my-learning"
            className="flex items-center space-x-4 px-3 py-3 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <FileText size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Assignments</span>
          </Link>

          <Link
            href="/certificates"
            className="flex items-center space-x-4 px-3 py-3 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Award size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Certificates</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center space-x-4 px-3 py-3 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Receipt size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Purchase History</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Conditionally render admin based on user role */}
          {(role === 'admin' || role === 'superadmin') && (
            <Link
              href="/admin/courses"
              className="flex items-center space-x-4 px-3 py-3 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
            >
              <Shield size={22} className="shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Teacher Mode</span>
            </Link>
          )}
          {role === 'superadmin' && (
            <Link
              href="/superadmin"
              className="flex items-center space-x-4 px-3 py-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20 overflow-hidden whitespace-nowrap mt-2"
            >
              <Shield size={22} className="shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">HQ Dashboard</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile More Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-[64px] bg-slate-900/95 backdrop-blur-3xl border-t border-white/10 z-40 p-4 shadow-[0_-16px_32px_-12px_rgba(0,0,0,0.5)] rounded-t-3xl animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-white font-bold text-lg">More Options</h3>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-4 bg-slate-800/60 border border-white/5 rounded-2xl text-slate-300 hover:text-teal-400 hover:border-teal-500/30 transition-all">
              <Heart size={24} className="mb-2" />
              <span className="text-xs font-medium">Wishlist</span>
            </Link>
            <Link href="/recommendations" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-4 bg-slate-800/60 border border-white/5 rounded-2xl text-slate-300 hover:text-teal-400 hover:border-teal-500/30 transition-all text-center">
              <Sparkles size={24} className="mb-2" />
              <span className="text-xs font-medium">For You</span>
            </Link>
            <Link href="/certificates" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-4 bg-slate-800/60 border border-white/5 rounded-2xl text-slate-300 hover:text-teal-400 hover:border-teal-500/30 transition-all">
              <Award size={24} className="mb-2" />
              <span className="text-xs font-medium">Certificates</span>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 z-50 px-2 py-2 pb-safe flex justify-around items-center shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.5)]">
        <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 text-slate-400 hover:text-teal-400">
          <Home size={22} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <Link href="/my-learning" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 text-slate-400 hover:text-teal-400">
          <BookOpen size={22} />
          <span className="text-[10px] mt-1 font-medium">Learn</span>
        </Link>
        <Link href="/analytics" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 text-slate-400 hover:text-teal-400">
          <BarChart size={22} />
          <span className="text-[10px] mt-1 font-medium">Analytics</span>
        </Link>
        {isLoggedIn ? (
          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 text-slate-400 hover:text-teal-400">
            <User size={22} />
            <span className="text-[10px] mt-1 font-medium">Profile</span>
          </Link>
        ) : (
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 text-slate-400 hover:text-teal-400">
            <User size={22} />
            <span className="text-[10px] mt-1 font-medium">Login</span>
          </Link>
        )}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center p-2 transition-colors ${isMobileMenuOpen ? 'text-teal-400' : 'text-slate-400 hover:text-teal-400'}`}
        >
          <Menu size={22} />
          <span className="text-[10px] mt-1 font-medium">More</span>
        </button>
      </nav>
    </>
  );
}
