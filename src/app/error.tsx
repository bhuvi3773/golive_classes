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
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2">
        <AlertCircle size={40} className="text-red-500" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900">Something went wrong</h2>
      <p className="text-slate-500 max-w-md">
        An unexpected error occurred while trying to load this page. Please try again or go back home.
      </p>
      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
        <Link href="/">
          <button className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
}
