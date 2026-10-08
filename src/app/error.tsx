"use client";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl bg-white/60 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-12">
        <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 rounded-3xl flex items-center justify-center shadow-inner mb-8 border border-white">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Something went wrong</h2>
        
        <p className="text-lg text-slate-500 max-w-md mb-10">
          An unexpected error occurred while trying to load this page. Please try again or go back home.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Try Again
          </button>
          <Link href="/">
            <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
