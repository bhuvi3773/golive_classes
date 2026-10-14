"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";

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
    <div className="flex min-h-[90vh] items-center justify-center py-12 px-4 relative">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-5 sm:p-8 md:p-10 space-y-6 text-center relative z-10 text-[#1B2E26]">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-[#DCE6D8] rounded-2xl flex items-center justify-center border border-[#24483C]/20 text-[#24483C]">
            <MailCheck size={28} />
          </div>
        </div>
        
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2E26] mb-2 tracking-tight">Verify Your Email</h2>
          <p className="text-[#556960] text-sm">
            We have dispatched a 6-digit verification code to:<br/>
            <strong className="text-[#1B2E26] mt-1 block font-mono text-sm break-all">{email}</strong>
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

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C] block mb-2">6-Digit Code</label>
            <input 
              type="text" 
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000" 
              className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-2 sm:px-4 py-3 sm:py-3.5 text-center text-2xl sm:text-3xl tracking-[0.3em] sm:tracking-[0.6em] focus:outline-none focus:border-[#24483C] focus:ring-1 focus:ring-[#24483C] transition-all text-[#1B2E26] font-mono placeholder:text-[#556960]/30"
              required
            />
          </div>

          <button 
            disabled={loading || code.length !== 6} 
            type="submit" 
            className="w-full py-3.5 font-medium text-base rounded-xl transition-all shadow-sm bg-[#24483C] text-[#F8F4EC] hover:bg-[#1B2E26] disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E9DFCC]">
          <p className="text-sm text-[#556960]">
            Didn&apos;t receive the code?{" "}
            <button 
              onClick={handleResend}
              disabled={resendDisabled}
              className="text-[#C96F4A] hover:underline font-semibold disabled:text-[#556960]/50 disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              {countdown > 0 ? `Resend code (${countdown}s)` : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[90vh] items-center justify-center text-[#556960]">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
