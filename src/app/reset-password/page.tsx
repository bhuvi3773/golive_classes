"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
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
      <div className="flex min-h-[90vh] items-center justify-center py-12 px-4 text-center relative">
        <div className="bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-10 max-w-md w-full relative z-10 text-[#1B2E26]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#C96F4A]/10 text-[#C96F4A] mb-3">
            <Lock size={22} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1B2E26] mb-2">Invalid or Expired Link</h2>
          <p className="text-[#556960] text-sm mb-6">This password reset link is invalid or missing the required secure authorization token.</p>
          <Link href="/forgot-password" className="w-full inline-block py-3 rounded-xl font-medium bg-[#24483C] text-[#F8F4EC] hover:bg-[#1B2E26] transition-colors">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center py-12 px-4 relative">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-8 md:p-10 space-y-6 relative z-10 text-[#1B2E26]">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#24483C] text-[#F8F4EC] shadow-sm mb-1">
            <ShieldCheck size={22} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#1B2E26] tracking-tight">Set New Password</h2>
          <p className="text-[#556960] text-sm">
            Enter and verify your new credentials below.
          </p>
        </div>

        {error && (
          <div className="bg-[#C96F4A]/10 border border-[#C96F4A]/30 text-[#8B381A] p-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-[#DCE6D8] border border-[#24483C]/30 text-[#24483C] p-4 rounded-xl text-sm font-medium">
            {success}
            <p className="text-xs text-[#3D5A4C] mt-1">Redirecting to login portal...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C]">New Password</label>
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C]">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#556960]" size={18} />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#24483C] focus:ring-1 focus:ring-[#24483C] transition-all text-[#1B2E26] placeholder:text-[#556960]/50"
                required
              />
            </div>
          </div>

          <button 
            disabled={loading || !password || !confirmPassword} 
            type="submit" 
            className="w-full py-3.5 font-medium text-base rounded-xl transition-all shadow-sm bg-[#24483C] text-[#F8F4EC] hover:bg-[#1B2E26] disabled:opacity-50"
          >
            {loading ? "Saving Credentials..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[90vh] items-center justify-center text-[#556960]">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
