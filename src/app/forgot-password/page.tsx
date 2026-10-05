"use client";

import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
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
    <div className="flex min-h-[90vh] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md glass-card p-8 md:p-10 space-y-8">
        <Link href="/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-fit">
          <ArrowLeft size={16} /> Back to login
        </Link>
        
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Forgot Password</h2>
          <p className="text-gray-400 text-sm">
            Enter the email address associated with your account and we'll send you a link to reset your password.
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
          </div>
        )}

        {!success && (
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
                  className="w-full bg-[#1e2130] border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                  required
                />
              </div>
            </div>

            <button disabled={loading || !email} type="submit" className="w-full btn-primary py-3 font-semibold text-lg disabled:opacity-50 transition-all">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
