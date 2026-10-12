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
      <aside className="w-[72px] hover:w-64 transition-all duration-300 group overflow-hidden bg-[#24483C] text-[#F8F4EC] border-r border-[#19332A] h-screen fixed left-0 top-0 flex-col hidden md:flex z-50 shadow-xl">
        <div className="p-5 flex items-center justify-center group-hover:justify-start border-b border-[#2E5B4C]">
          <Link href="/my-learning">
            <div className="flex items-center gap-2 cursor-pointer w-full group">
              <div className="relative bg-[#F8F4EC] p-2 pl-3 rounded-r-lg rounded-l-sm border border-[#E9DFCC] shadow-md flex items-center justify-center transition-all duration-300 group-hover:border-[#C96F4A]">
                {/* Binder rings */}
                <div className="absolute left-[-5px] top-2 bottom-2 flex flex-col justify-between py-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-2.5 h-1 bg-[#D8CCB5] rounded-sm shadow-sm" />
                  ))}
                </div>
                {/* Notebook spine line */}
                <div className="absolute left-2.5 top-0 bottom-0 w-px bg-[#E9DFCC]"></div>
                
                <img src="/logo.png" alt="GoLive Classes" className="h-9 w-auto max-w-full object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-105 relative z-10 ml-1" />
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-hidden group-hover:overflow-y-auto pb-20 transition-all">
          <Link
            href="/courses"
            className="flex items-center space-x-4 px-3 py-2.5 text-[#DCE6D8] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Home size={20} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">All Courses</span>
          </Link>

          <Link
            href="/my-learning"
            className="flex items-center space-x-4 px-3 py-2.5 text-[#DCE6D8] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <BookOpen size={20} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">My Learning</span>
          </Link>

          <Link
            href="/live-classes"
            className="flex items-center space-x-4 px-3 py-2.5 text-[#DCE6D8] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Video size={20} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Live Classes</span>
          </Link>

          <div className="pt-3 pb-1">
            <p className="text-[11px] font-bold text-[#A3B8AE] uppercase tracking-wider px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Academic Tools</p>
          </div>

          <Link
            href="/recommendations"
            className="flex items-center space-x-4 px-3 py-2.5 text-[#DCE6D8] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Sparkles size={20} className="shrink-0 text-[#C96F4A]" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Recommendations</span>
          </Link>

          <Link
            href="/analytics"
            className="flex items-center space-x-4 px-3 py-2.5 text-[#DCE6D8] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <BarChart size={20} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Analytics</span>
          </Link>

          <Link
            href="/wishlist"
            className="flex items-center space-x-4 px-3 py-2.5 text-[#DCE6D8] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Heart size={20} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Wishlist</span>
          </Link>

          <Link
            href="/my-learning"
            className="flex items-center space-x-4 px-3 py-2.5 text-[#DCE6D8] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <FileText size={20} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Assignments</span>
          </Link>

          <Link
            href="/certificates"
            className="flex items-center space-x-4 px-3 py-2.5 text-[#DCE6D8] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Award size={20} className="shrink-0 text-[#C96F4A]" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Certificates</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center space-x-4 px-3 py-2.5 text-[#DCE6D8] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Receipt size={20} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Billing History</span>
          </Link>
        </nav>

        <div className="p-3 border-t border-[#2E5B4C] space-y-1.5">
          {(role === 'admin' || role === 'superadmin') && (
            <Link
              href="/admin/courses"
              className="flex items-center space-x-4 px-3 py-2.5 text-[#C96F4A] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors overflow-hidden whitespace-nowrap font-medium"
            >
              <Shield size={20} className="shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">Teacher Mode</span>
            </Link>
          )}
          {role === 'superadmin' && (
            <Link
              href="/superadmin"
              className="flex items-center space-x-4 px-3 py-2.5 text-[#DCE6D8] hover:text-[#FFFFFF] hover:bg-[#19332A] rounded-lg transition-colors border border-[#2E5B4C] overflow-hidden whitespace-nowrap mt-1"
            >
              <Shield size={20} className="shrink-0 text-[#C96F4A]" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">HQ Console</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile More Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-[64px] bg-[#FFFFFF] border-t border-[#E9DFCC] z-40 p-5 shadow-2xl rounded-t-2xl animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[#1B2E26] font-bold text-base">More Options</h3>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#4A5E54] hover:text-[#1B2E26] bg-[#F4EFE6] p-1.5 rounded-full">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3.5 bg-[#FDFCF9] border border-[#E9DFCC] rounded-xl text-[#2C3E35] hover:border-[#24483C] transition-all">
              <Heart size={22} className="mb-1.5 text-[#C96F4A]" />
              <span className="text-xs font-medium">Wishlist</span>
            </Link>
            <Link href="/recommendations" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3.5 bg-[#FDFCF9] border border-[#E9DFCC] rounded-xl text-[#2C3E35] hover:border-[#24483C] transition-all text-center">
              <Sparkles size={22} className="mb-1.5 text-[#24483C]" />
              <span className="text-xs font-medium">For You</span>
            </Link>
            <Link href="/certificates" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3.5 bg-[#FDFCF9] border border-[#E9DFCC] rounded-xl text-[#2C3E35] hover:border-[#24483C] transition-all">
              <Award size={22} className="mb-1.5 text-[#C96F4A]" />
              <span className="text-xs font-medium">Certificates</span>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#24483C] border-t border-[#19332A] z-50 px-2 py-2 pb-safe flex justify-around items-center shadow-lg text-[#DCE6D8]">
        <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 hover:text-[#FFFFFF]">
          <Home size={20} />
          <span className="text-[10px] mt-1 font-medium">Courses</span>
        </Link>
        <Link href="/my-learning" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 hover:text-[#FFFFFF]">
          <BookOpen size={20} />
          <span className="text-[10px] mt-1 font-medium">Learn</span>
        </Link>
        <Link href="/analytics" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 hover:text-[#FFFFFF]">
          <BarChart size={20} />
          <span className="text-[10px] mt-1 font-medium">Analytics</span>
        </Link>
        {isLoggedIn ? (
          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 hover:text-[#FFFFFF]">
            <User size={20} />
            <span className="text-[10px] mt-1 font-medium">Profile</span>
          </Link>
        ) : (
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 hover:text-[#FFFFFF]">
            <User size={20} />
            <span className="text-[10px] mt-1 font-medium">Login</span>
          </Link>
        )}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center p-2 transition-colors ${isMobileMenuOpen ? 'text-[#C96F4A]' : 'hover:text-[#FFFFFF]'}`}
        >
          <Menu size={20} />
          <span className="text-[10px] mt-1 font-medium">More</span>
        </button>
      </nav>
    </>
  );
}
