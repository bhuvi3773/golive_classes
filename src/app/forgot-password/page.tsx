"use client";

import { useState } from "react";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process request.");
        setLoading(false);
        return;
      }

      setSuccess(data.message || "✓ If an account exists, a password reset link has been sent.");
      setLoading(false);
    } catch (err) {
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center py-12 px-4 relative">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-8 md:p-10 space-y-6 relative z-10 text-[#1B2E26]">
        <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#556960] hover:text-[#24483C] transition-colors w-fit">
          <ArrowLeft size={14} /> Back to login
        </Link>
        
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#24483C] text-[#F8F4EC] shadow-sm mb-1">
            <KeyRound size={22} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#1B2E26] tracking-tight">Recover Access</h2>
          <p className="text-[#556960] text-sm">
            Enter the academic email address associated with your account and we will dispatch a secure reset token.
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
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#556960]" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#24483C] focus:ring-1 focus:ring-[#24483C] transition-all text-[#1B2E26] placeholder:text-[#556960]/50"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading || !email} 
              type="submit" 
              className="w-full py-3.5 font-medium text-base rounded-xl transition-all shadow-sm bg-[#24483C] text-[#F8F4EC] hover:bg-[#1B2E26] disabled:opacity-50"
            >
              {loading ? "Transmitting..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
