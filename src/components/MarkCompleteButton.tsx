"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MarkCompleteButton({ courseId, lectureId, isCompleted }: { courseId: string, lectureId: number, isCompleted: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const markComplete = async () => {
    if (isCompleted) return;
    setLoading(true);
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lectureId })
      });
      router.refresh(); // Refresh the page to reflect the green checkmark
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={markComplete}
      disabled={isCompleted || loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
        isCompleted 
          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
      }`}
    >
      <CheckCircle size={16} />
      {isCompleted ? 'Completed' : loading ? 'Saving...' : 'Mark as Complete'}
    </button>
  );
}
