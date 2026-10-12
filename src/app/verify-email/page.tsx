"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed.");
        setLoading(false);
        return;
      }

      setSuccess("✓ Email verified successfully!");
      setTimeout(() => {
        // Route directly to the Profile Setup onboarding flow if they just signed up
        window.location.href = "/profile-setup";
      }, 1500);
    } catch (err) {
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabled) return;
    
    setError("");
    setSuccess("");
    setResendDisabled(true);
    
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
        if (res.status === 429) {
          setCountdown(60); // Wait 60s
        } else {
          setResendDisabled(false);
        }
        return;
      }

      setSuccess("✓ A new verification code has been sent.");
      setCountdown(60); // 60s cooldown
    } catch (err) {
      setError("Failed to connect to the server.");
      setResendDisabled(false);
    }
  };

  if (!email) return null;

  return (
    <div className="flex min-h-[90vh] items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-md glass-card shadow-2xl rounded-2xl p-8 md:p-10 space-y-8 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/20">
            <Mail className="text-teal-400 w-8 h-8" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Verify your email</h2>
          <p className="text-slate-400 text-sm">
            We've sent a 6-digit verification code to:<br/>
            <strong className="text-white mt-1 block">{email}</strong>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 p-3 rounded-lg text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input 
              type="text" 
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000" 
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-4 text-center text-3xl tracking-[1em] focus:outline-none focus:border-teal-500 transition-colors text-white font-mono placeholder:text-slate-500"
              required
            />
          </div>

          <button disabled={loading || code.length !== 6} type="submit" className="w-full btn-primary py-3 font-semibold text-lg disabled:opacity-50 transition-all">
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10">
          <p className="text-sm text-slate-400">
            Didn't receive it?{" "}
            <button 
              onClick={handleResend}
              disabled={resendDisabled}
              className="text-teal-400 hover:text-teal-300 font-medium disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[90vh] items-center justify-center text-slate-500">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
