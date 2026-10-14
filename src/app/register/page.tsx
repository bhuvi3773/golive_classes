"use client";

import Link from "next/link";
import { Mail, Lock, User as UserIcon, BookOpen } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      // Route directly to the verify email page
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center py-6 sm:py-12 px-3 sm:px-4 relative">
      <div className="w-full max-w-lg bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8 relative z-10 text-[#1B2E26]">
        {/* Emblem */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#24483C] text-[#F8F4EC] shadow-sm mb-1 sm:mb-2">
            <BookOpen size={24} />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2E26] tracking-tight">Begin Your Journey</h2>
          <p className="text-[#556960] text-xs sm:text-sm">Create an academy account to unlock live masterclasses and structured learning paths.</p>
        </div>

        {error && (
          <div className="bg-[#C96F4A]/10 border border-[#C96F4A]/30 text-[#8B381A] p-3 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C]">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#556960]" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eleanor Vance" 
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#24483C] focus:ring-1 focus:ring-[#24483C] transition-all text-[#1B2E26] placeholder:text-[#556960]/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#556960]" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vance@academy.edu" 
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#24483C] focus:ring-1 focus:ring-[#24483C] transition-all text-[#1B2E26] placeholder:text-[#556960]/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#556960]" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#24483C] focus:ring-1 focus:ring-[#24483C] transition-all text-[#1B2E26] placeholder:text-[#556960]/50"
                required
              />
            </div>
            <p className="text-[11px] text-[#556960]">At least 6 characters with secure credentials.</p>
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full py-3.5 font-medium text-base rounded-xl transition-all shadow-sm bg-[#24483C] text-[#F8F4EC] hover:bg-[#1B2E26] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Free Account"}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute border-t border-[#E9DFCC] w-full"></div>
          <span className="bg-[#FAF7F0] px-4 text-xs font-semibold uppercase tracking-wider text-[#556960] z-10">or continue with</span>
        </div>

        <Link 
          href="/api/auth/google/login" 
          className="w-full flex items-center justify-center gap-3 bg-[#FAF7F0] hover:bg-[#E9DFCC]/50 text-[#1B2E26] font-medium py-3 rounded-xl transition-colors border border-[#E9DFCC] text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Link>

        <p className="text-center text-sm text-[#556960]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C96F4A] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
