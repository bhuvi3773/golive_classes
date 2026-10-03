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
        setError(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      // Route everyone to the Storefront which acts as the unified Home Page
      window.location.href = "/";
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
              <span className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">Forgot password?</span>
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

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
