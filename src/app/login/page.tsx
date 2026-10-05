"use client";

import Link from "next/link";
import { Mail, Lock, BookOpen, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requireVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      // Route based on role
      if (data.role === 'superadmin') {
        window.location.href = "/superadmin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center py-12">
      <div className="w-full max-w-lg glass-card p-8 md:p-10 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-gray-400 mt-2">Log in to your account</p>
        </div>

        {/* Role Selection added to Login per user request */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => setRole("student")}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
              role === "student" 
                ? "border-blue-500 bg-blue-500/10" 
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <BookOpen size={28} className={role === "student" ? "text-blue-400" : "text-gray-400"} />
            <h3 className="font-semibold text-white">Learner</h3>
          </div>

          <div 
            onClick={() => setRole("instructor")}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
              role === "instructor" 
                ? "border-violet-500 bg-violet-500/10" 
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <GraduationCap size={28} className={role === "instructor" ? "text-violet-400" : "text-gray-400"} />
            <h3 className="font-semibold text-white">Teacher</h3>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                required
              />
            </div>
          </div>

          <button disabled={loading} type="submit" className={`w-full py-3 font-semibold text-lg rounded-lg shadow-lg disabled:opacity-50 transition-all ${
            role === 'instructor' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white' : 'btn-primary'
          }`}>
            {loading ? "Signing In..." : `Login as ${role === 'student' ? 'Learner' : 'Teacher'}`}
          </button>
        </form>

        <div className="relative flex items-center justify-center mt-6 mb-6">
          <div className="absolute border-t border-gray-700 w-full"></div>
          <span className="bg-[#0a0c16] px-4 text-sm text-gray-500 z-10">OR</span>
        </div>

        <Link href="/api/auth/google/login" className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-semibold py-3 rounded-lg transition-colors border border-gray-300">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Link>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
