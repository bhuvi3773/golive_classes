"use client";

import Link from "next/link";
import { BookOpen, Video, Home, User, LogOut, Shield, Heart, FileText, Award, Receipt, Sparkles, BarChart, Menu, X, Rocket, FolderTree, Settings, Users } from "lucide-react";
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

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

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

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile More Menu Drawer */}
      {isMobileMenuOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Navigation and academic tools"
          className="md:hidden fixed inset-x-0 bottom-[64px] bg-[#FFFFFF] border-t border-[#E9DFCC] z-50 p-5 shadow-2xl rounded-t-3xl max-h-[82vh] overflow-y-auto animate-in slide-in-from-bottom-6 text-[#1B2E26]"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E9DFCC]">
            <div>
              <h3 className="text-[#1B2E26] font-serif font-bold text-base">Academic Tools & Navigation</h3>
              <p className="text-[11px] text-[#556960]">Access your learning pathway and management consoles</p>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-[#4A5E54] hover:text-[#1B2E26] bg-[#F4EFE6] p-1.5 rounded-full transition-colors"
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Student Learning Tools */}
          <div className="mb-4">
            <span className="text-[10px] font-bold text-[#C96F4A] uppercase tracking-wider block mb-2 px-1">Learning Tools</span>
            <div className="grid grid-cols-3 gap-2.5">
              <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl text-[#2C3E35] hover:border-[#24483C] transition-all">
                <Heart size={20} className="mb-1 text-[#C96F4A]" />
                <span className="text-[11px] font-semibold text-center">Wishlist</span>
              </Link>
              <Link href="/recommendations" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl text-[#2C3E35] hover:border-[#24483C] transition-all text-center">
                <Sparkles size={20} className="mb-1 text-[#24483C]" />
                <span className="text-[11px] font-semibold">For You</span>
              </Link>
              <Link href="/certificates" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl text-[#2C3E35] hover:border-[#24483C] transition-all">
                <Award size={20} className="mb-1 text-[#C96F4A]" />
                <span className="text-[11px] font-semibold text-center">Certificates</span>
              </Link>
              <Link href="/analytics" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl text-[#2C3E35] hover:border-[#24483C] transition-all">
                <BarChart size={20} className="mb-1 text-[#24483C]" />
                <span className="text-[11px] font-semibold text-center">Analytics</span>
              </Link>
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl text-[#2C3E35] hover:border-[#24483C] transition-all">
                <Receipt size={20} className="mb-1 text-[#556960]" />
                <span className="text-[11px] font-semibold text-center">Billing</span>
              </Link>
              <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl text-[#2C3E35] hover:border-[#24483C] transition-all">
                <Home size={20} className="mb-1 text-[#24483C]" />
                <span className="text-[11px] font-semibold text-center">Catalog</span>
              </Link>
            </div>
          </div>

          {/* Faculty & Admin Tools (Conditional) */}
          {(role === 'admin' || role === 'superadmin') && (
            <div className="mb-4 pt-3 border-t border-[#E9DFCC]">
              <span className="text-[10px] font-bold text-[#24483C] uppercase tracking-wider block mb-2 px-1">Faculty & Console</span>
              <div className="grid grid-cols-3 gap-2.5">
                <Link href="/admin/courses" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#EEF3EC] border border-[#DCE6D8] rounded-xl text-[#24483C] hover:border-[#24483C] transition-all text-center">
                  <Shield size={20} className="mb-1 text-[#24483C]" />
                  <span className="text-[11px] font-bold">Curricula</span>
                </Link>
                <Link href="/admin/launches" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#EEF3EC] border border-[#DCE6D8] rounded-xl text-[#24483C] hover:border-[#24483C] transition-all text-center">
                  <Rocket size={20} className="mb-1 text-[#C96F4A]" />
                  <span className="text-[11px] font-bold">Cohorts</span>
                </Link>
                <Link href="/admin/categories" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#EEF3EC] border border-[#DCE6D8] rounded-xl text-[#24483C] hover:border-[#24483C] transition-all text-center">
                  <FolderTree size={20} className="mb-1 text-[#24483C]" />
                  <span className="text-[11px] font-bold">Disciplines</span>
                </Link>
              </div>
            </div>
          )}

          {/* Superadmin Tools (Conditional) */}
          {role === 'superadmin' && (
            <div className="mb-4 pt-3 border-t border-[#E9DFCC]">
              <span className="text-[10px] font-bold text-[#8B381A] uppercase tracking-wider block mb-2 px-1">Provost Executive HQ</span>
              <div className="grid grid-cols-3 gap-2.5">
                <Link href="/superadmin" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#C96F4A]/10 border border-[#C96F4A]/30 rounded-xl text-[#8B381A] hover:border-[#8B381A] transition-all text-center">
                  <Shield size={20} className="mb-1 text-[#C96F4A]" />
                  <span className="text-[11px] font-bold">Audits HQ</span>
                </Link>
                <Link href="/superadmin/users" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#C96F4A]/10 border border-[#C96F4A]/30 rounded-xl text-[#8B381A] hover:border-[#8B381A] transition-all text-center">
                  <Users size={20} className="mb-1 text-[#8B381A]" />
                  <span className="text-[11px] font-bold">Registry</span>
                </Link>
                <Link href="/superadmin/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-3 bg-[#C96F4A]/10 border border-[#C96F4A]/30 rounded-xl text-[#8B381A] hover:border-[#8B381A] transition-all text-center">
                  <Settings size={20} className="mb-1 text-[#8B381A]" />
                  <span className="text-[11px] font-bold">Settings</span>
                </Link>
              </div>
            </div>
          )}

          {/* Account Logout Action */}
          {isLoggedIn && (
            <div className="pt-3 border-t border-[#E9DFCC]">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FAF7F0] hover:bg-[#C96F4A]/10 text-[#8B381A] border border-[#E9DFCC] hover:border-[#C96F4A]/30 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
              >
                <LogOut size={16} /> Sign Out of Academy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav 
        aria-label="Mobile primary navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#24483C] border-t border-[#19332A] z-50 px-2 py-1.5 pb-safe flex justify-around items-center shadow-lg text-[#DCE6D8]"
      >
        <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 hover:text-[#FFFFFF] transition-colors">
          <Home size={20} />
          <span className="text-[10px] mt-1 font-medium">Courses</span>
        </Link>
        <Link href="/my-learning" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 hover:text-[#FFFFFF] transition-colors">
          <BookOpen size={20} />
          <span className="text-[10px] mt-1 font-medium">Learn</span>
        </Link>
        <Link href="/live-classes" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 hover:text-[#FFFFFF] transition-colors">
          <Video size={20} />
          <span className="text-[10px] mt-1 font-medium">Live</span>
        </Link>
        {isLoggedIn ? (
          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 hover:text-[#FFFFFF] transition-colors">
            <User size={20} />
            <span className="text-[10px] mt-1 font-medium">Profile</span>
          </Link>
        ) : (
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center p-2 hover:text-[#FFFFFF] transition-colors">
            <User size={20} />
            <span className="text-[10px] mt-1 font-medium">Login</span>
          </Link>
        )}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle more navigation options"
          className={`flex flex-col items-center p-2 transition-colors ${isMobileMenuOpen ? 'text-[#C96F4A]' : 'hover:text-[#FFFFFF]'}`}
        >
          <Menu size={20} />
          <span className="text-[10px] mt-1 font-medium">More</span>
        </button>
      </nav>
    </>
  );
}
