"use client";

import { useState } from "react";
import { FileText, UploadCloud, CheckCircle } from "lucide-react";

export default function AssignmentPlayer({ 
  lecture, 
  courseId,
  lectureId,
  isCompleted
}: { 
  lecture: any;
  courseId: string;
  lectureId: number;
  isCompleted: boolean;
}) {
  const [submission, setSubmission] = useState("");
  const [submitted, setSubmitted] = useState(isCompleted);

  const data = lecture.assignmentData || {};

  const handleSubmit = async () => {
    if (!submission.trim()) return;
    setSubmitted(true);
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lectureId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in text-[#1B2E26]">
      <div className="bg-[#FAF7F0] border border-[#E9DFCC] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E9DFCC]">
          <div className="p-3 bg-[#DCE6D8] rounded-xl text-[#24483C]">
            <FileText size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C96F4A]">Practical Task</span>
            <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">{data.title || "Academic Practicum Assignment"}</h2>
            <p className="text-[#556960] text-xs mt-0.5">Benchmarking Threshold: {data.passingScore || 70}%</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-[#1B2E26]">Task Instructions</h3>
          <p className="text-[#556960] text-sm whitespace-pre-wrap leading-relaxed">{data.description || "Execute and document the required implementation according to syllabus specifications."}</p>
          
          <div className="mt-4 p-4 bg-[#F8F4EC] rounded-xl border border-[#E9DFCC]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-1">Deliverable Criteria</h4>
            <p className="text-xs text-[#556960]">{data.expectedOutput || "Submit your repository URL or documentation artifact below."}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#FAF7F0] border border-[#E9DFCC] rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-[#1B2E26] mb-4">Scholar Submission</h3>
        
        {submitted ? (
          <div className="text-center py-10 bg-[#DCE6D8] border border-[#24483C]/30 rounded-xl">
            <CheckCircle size={40} className="mx-auto text-[#24483C] mb-3" />
            <h4 className="font-serif text-lg font-bold text-[#24483C] mb-1">Practicum Work Received</h4>
            <p className="text-xs text-[#3D5A4C]">Your submission has been queued for faculty review. The module is marked complete.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea 
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Paste your GitHub repository link, deployment URL, or comprehensive analysis here..."
              rows={5}
              className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl p-4 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C] transition-colors resize-none"
            ></textarea>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#556960] hover:text-[#24483C] transition-colors border border-[#E9DFCC] hover:bg-[#E9DFCC]/30 rounded-xl px-4 py-2.5 w-full sm:w-auto justify-center">
                <UploadCloud size={15} /> Link Supplementary File
              </button>
              
              <button 
                onClick={handleSubmit}
                disabled={!submission.trim()}
                className="bg-[#24483C] hover:bg-[#1B2E26] disabled:opacity-50 text-[#F8F4EC] text-xs font-semibold uppercase tracking-wider py-2.5 px-6 rounded-xl transition-all shadow-sm w-full sm:w-auto"
              >
                Submit Practicum
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
