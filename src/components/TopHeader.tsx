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
    <header className="h-16 border-b border-white/10 bg-slate-900/60 backdrop-blur-2xl sticky top-0 z-40 px-6 md:px-10 flex items-center justify-end gap-4 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
      {/* Search */}
      <div className="flex items-center">
        {isSearchOpen ? (
          <form onSubmit={handleSearch} className="flex items-center bg-slate-800/50 border border-white/10 rounded-full px-3 py-1.5 animate-in slide-in-from-right-4 fade-in">
            <Search size={16} className="text-slate-400 mr-2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if (!searchQuery) setIsSearchOpen(false); }}
              placeholder="Search courses..."
              className="bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none w-48"
            />
          </form>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-full transition-colors"
            title="Search"
          >
            <Search size={20} />
          </button>
        )}
      </div>

      {/* Notifications */}
      <button className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-full transition-colors">
        <Bell size={20} />
      </button>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold border border-teal-500/50 hover:bg-teal-500/30 transition-colors"
        >
          {isLoggedIn ? "U" : <User size={18} />}
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {isLoggedIn ? (
              <>
                <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                  <User size={16} /> Profile
                </Link>
                <div className="h-px bg-white/10 w-full"></div>
                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                <User size={16} /> Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
