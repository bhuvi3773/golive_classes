"use client";

import { Search, User, LogOut, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TopHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    <header className="h-16 border-b border-[#E9DFCC] bg-[#FFFFFF]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 md:px-10 flex items-center justify-between md:justify-end gap-2 sm:gap-4 shadow-sm">
      {/* Mobile Brand Emblem (visible below 768px) */}
      <div className="flex items-center gap-2 md:hidden mr-auto">
        <Link href="/my-learning" className="flex items-center gap-1.5 group">
          <div className="relative bg-[#F8F4EC] p-1.5 pl-2.5 rounded-r-md rounded-l-xs border border-[#E9DFCC] shadow-xs flex items-center justify-center">
            <div className="absolute left-[-3px] top-1 bottom-1 flex flex-col justify-between py-0.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1.5 h-0.5 bg-[#D8CCB5] rounded-xs" />
              ))}
            </div>
            <div className="absolute left-1.5 top-0 bottom-0 w-px bg-[#E9DFCC]"></div>
            <img src="/logo.png" alt="GoLive" className="h-6 w-auto object-contain relative z-10 ml-0.5" />
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center">
        {isSearchOpen ? (
          <form onSubmit={handleSearch} className="flex items-center bg-[#F4EFE6] border border-[#E9DFCC] rounded-full px-2.5 py-1 animate-in slide-in-from-right-4 fade-in">
            <Search size={15} className="text-[#4A5E54] mr-1.5 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if (!searchQuery) setIsSearchOpen(false); }}
              placeholder="Search..."
              className="bg-transparent text-xs text-[#1B2E26] placeholder:text-[#72857C] focus:outline-none w-28 xs:w-36 sm:w-48"
            />
          </form>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-[#4A5E54] hover:text-[#24483C] hover:bg-[#EEF3EC] rounded-full transition-colors"
            title="Search courses"
            aria-label="Search courses"
          >
            <Search size={19} />
          </button>
        )}
      </div>

      {/* Notifications */}
      <button 
        className="p-2 text-[#4A5E54] hover:text-[#24483C] hover:bg-[#EEF3EC] rounded-full transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={19} />
      </button>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          aria-label="Account menu"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#24483C] text-[#F8F4EC] flex items-center justify-center font-bold text-xs sm:text-sm border border-[#19332A] hover:bg-[#19332A] transition-colors shadow-sm"
        >
          {isLoggedIn ? "U" : <User size={16} />}
        </button>

        {showProfileMenu && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setShowProfileMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] border border-[#E9DFCC] rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-3 text-xs sm:text-sm text-[#2C3E35] hover:text-[#1B2E26] hover:bg-[#F4EFE6] transition-colors">
                    <User size={16} /> Profile
                  </Link>
                  <div className="h-px bg-[#E9DFCC] w-full"></div>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-xs sm:text-sm text-[#C96F4A] hover:text-[#B25D39] hover:bg-[#F4EFE6] transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-3 text-xs sm:text-sm text-[#2C3E35] hover:text-[#1B2E26] hover:bg-[#F4EFE6] transition-colors">
                  <User size={16} /> Sign In
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
