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
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
    setRole(null);
    window.location.href = '/login';
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#0a0c16]/90 backdrop-blur-md sticky top-0 z-40 px-6 md:px-10 flex items-center justify-end gap-4">
      {/* Search */}
      <div className="flex items-center">
        {isSearchOpen ? (
          <form onSubmit={handleSearch} className="flex items-center bg-[#1e2130] rounded-full px-3 py-1.5 animate-in slide-in-from-right-4 fade-in">
            <Search size={16} className="text-gray-400 mr-2" />
            <input 
              type="text" 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if(!searchQuery) setIsSearchOpen(false); }}
              placeholder="Search courses..." 
              className="bg-transparent text-sm text-white focus:outline-none w-48"
            />
          </form>
        ) : (
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            title="Search"
          >
            <Search size={20} />
          </button>
        )}
      </div>

      {/* Notifications */}
      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
        <Bell size={20} />
      </button>

      {/* Profile */}
      <div className="relative">
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
        >
          {isLoggedIn ? "U" : <User size={18} />}
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-[#1e2130] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {isLoggedIn ? (
              <>
                <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                  <User size={16} /> Profile
                </Link>
                <div className="h-px bg-white/10 w-full"></div>
                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                <User size={16} /> Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
