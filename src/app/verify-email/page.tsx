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
    <div className="flex min-h-[90vh] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md glass-card-light p-8 md:p-10 space-y-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200">
            <Mail className="text-emerald-600 w-8 h-8" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h2>
          <p className="text-slate-500 text-sm">
            We've sent a 6-digit verification code to:<br/>
            <strong className="text-slate-900 mt-1 block">{email}</strong>
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

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input 
              type="text" 
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000" 
              className="w-full bg-white border border-gray-600 rounded-lg px-4 py-4 text-center text-3xl tracking-[1em] focus:outline-none focus:border-blue-500 transition-colors text-slate-900 font-mono"
              required
            />
          </div>

          <button disabled={loading || code.length !== 6} type="submit" className="w-full btn-primary py-3 font-semibold text-lg disabled:opacity-50 transition-all">
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Didn't receive it?{" "}
            <button 
              onClick={handleResend}
              disabled={resendDisabled}
              className="text-emerald-600 hover:text-blue-300 font-medium disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
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
