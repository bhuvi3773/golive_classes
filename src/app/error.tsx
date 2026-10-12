"use client";
import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative text-[#1B2E26]">
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-10 md:p-12">
        <div className="w-20 h-20 bg-[#C96F4A]/10 border border-[#C96F4A]/30 rounded-2xl flex items-center justify-center text-[#C96F4A] shadow-sm mb-6">
          <AlertCircle size={40} />
        </div>
        
        <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A] mb-2">System Exception</span>
        <h2 className="font-serif text-2xl font-bold text-[#1B2E26] mb-3">
          An Academic Error Occurred
        </h2>
        
        <p className="text-sm text-[#556960] max-w-sm mb-8 leading-relaxed">
          An unforeseen exception interrupted your session. You may reattempt the operation or return to the main academy campus.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
          >
            <RotateCcw size={15} />
            Reattempt
          </button>
          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FAF7F0] hover:bg-[#E9DFCC]/50 border border-[#E9DFCC] text-[#24483C] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm">
              <Home size={15} />
              Return Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
