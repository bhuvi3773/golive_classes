"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password. The link may have expired.");
        setLoading(false);
        return;
      }

      setSuccess("✓ " + (data.message || "Password has been successfully reset."));
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center py-12 px-4 text-center">
        <div className="glass-card p-10 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-gray-400 mb-6">This password reset link is invalid or missing the secure token.</p>
          <Link href="/forgot-password" className="btn-primary w-full block py-3 rounded-lg font-bold">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md glass-card p-8 md:p-10 space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Create New Password</h2>
          <p className="text-gray-400 text-sm">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm font-medium">
            {success}
            <p className="text-xs text-green-500/70 mt-1">Redirecting to login...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-[#1e2130] border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-[#1e2130] border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                required
              />
            </div>
          </div>

          <button disabled={loading || !password || !confirmPassword} type="submit" className="w-full btn-primary py-3 font-semibold text-lg disabled:opacity-50 transition-all">
            {loading ? "Saving..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[90vh] items-center justify-center text-gray-400">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
