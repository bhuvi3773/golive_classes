"use client";

import Link from "next/link";
import { BookOpen, Video, Home, User, LogOut, Shield } from "lucide-react";
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
      <aside className="w-64 bg-[#1e2130] border-r border-white/10 h-screen fixed left-0 top-0 flex-col hidden md:flex z-50">
        <div className="p-6">
          <Link href="/">
            <span className="text-2xl font-bold text-gradient cursor-pointer">
              GoLive
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link
            href="/courses"
            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Home size={20} />
            <span>All Courses</span>
          </Link>

          <Link
            href="/my-learning"
            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <BookOpen size={20} />
            <span>My Learning</span>
          </Link>

          <Link
            href="/live-classes"
            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Video size={20} />
            <span>Live Classes</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Conditionally render admin based on user role */}
          {role === 'admin' && (
            <Link
              href="/admin/courses/new"
              className="flex items-center space-x-3 px-4 py-3 text-violet-400 hover:text-violet-300 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Shield size={20} />
              <span>Teacher Mode</span>
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
