"use client";

import Link from "next/link";
import { BookOpen, Video, Home, User, LogOut, Shield, Heart, FileText, Award, Receipt } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    // Proper logout by hitting the backend to delete HttpOnly cookie
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
    setRole(null);
    window.location.href = '/login';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-[72px] hover:w-64 transition-all duration-300 group overflow-hidden bg-[#1e2130] border-r border-white/10 h-screen fixed left-0 top-0 flex-col hidden md:flex z-50">
        <div className="p-6 flex items-center justify-center group-hover:justify-start">
          <Link href="/">
            <span className="text-2xl font-bold text-gradient cursor-pointer flex items-center">
              <span className="group-hover:hidden">G</span>
              <span className="hidden group-hover:inline">GoLive</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link
            href="/courses"
            className="flex items-center space-x-4 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Home size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">All Courses</span>
          </Link>

          <Link
            href="/my-learning"
            className="flex items-center space-x-4 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <BookOpen size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">My Learning</span>
          </Link>

          <Link
            href="/live-classes"
            className="flex items-center space-x-4 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Video size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Live Classes</span>
          </Link>
          
          <div className="pt-4 pb-2">
            <p className="text-xs font-bold text-gray-500 uppercase px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Student Features</p>
          </div>

          <Link
            href="/wishlist"
            className="flex items-center space-x-4 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Heart size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Wishlist</span>
          </Link>

          <Link
            href="/my-learning"
            className="flex items-center space-x-4 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <FileText size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Assignments</span>
          </Link>

          <Link
            href="/certificates"
            className="flex items-center space-x-4 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
          >
            <Award size={22} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Certificates</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center space-x-4 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
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
              className="flex items-center space-x-4 px-3 py-3 text-violet-400 hover:text-violet-300 hover:bg-white/5 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
            >
              <Shield size={22} className="shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Teacher Mode</span>
            </Link>
          )}
          {role === 'superadmin' && (
            <Link
              href="/superadmin"
              className="flex items-center space-x-4 px-3 py-3 text-red-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors border border-red-500/20 overflow-hidden whitespace-nowrap mt-2"
            >
              <Shield size={22} className="shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">HQ Dashboard</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1e2130] border-t border-white/10 z-50 px-2 py-3 pb-safe flex justify-around items-center">
        <Link href="/courses" className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
          <Home size={22} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <Link href="/my-learning" className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
          <BookOpen size={22} />
          <span className="text-[10px] mt-1 font-medium">Learn</span>
        </Link>
        <Link href="/live-classes" className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
          <Video size={22} />
          <span className="text-[10px] mt-1 font-medium">Live</span>
        </Link>
        {isLoggedIn ? (
          <Link href="/profile" className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
            <User size={22} />
            <span className="text-[10px] mt-1 font-medium">Profile</span>
          </Link>
        ) : (
          <Link href="/login" className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
            <User size={22} />
            <span className="text-[10px] mt-1 font-medium">Login</span>
          </Link>
        )}
      </nav>
    </>
  );
}
