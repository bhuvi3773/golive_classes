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
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
        isCompleted 
          ? 'bg-[#DCE6D8] text-[#24483C] border border-[#24483C]/30' 
          : 'bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] border border-[#E9DFCC]/20'
      }`}
    >
      <CheckCircle size={15} />
      {isCompleted ? 'Completed' : loading ? 'Saving...' : 'Mark as Complete'}
    </button>
  );
}
