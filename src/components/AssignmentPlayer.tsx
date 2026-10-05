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
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in">
      <div className="bg-[#12141f] border border-white/10 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{data.title || "Project Assignment"}</h2>
            <p className="text-gray-400 text-sm mt-1">Passing Score: {data.passingScore || 70}%</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <h3 className="text-lg font-bold text-white mb-2">Instructions</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{data.description || "Complete the required project."}</p>
          
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-sm font-bold text-white mb-1">Expected Output</h4>
            <p className="text-sm text-gray-400">{data.expectedOutput || "Submit your work below"}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#12141f] border border-white/10 rounded-xl p-8">
        <h3 className="text-lg font-bold text-white mb-4">Your Submission</h3>
        
        {submitted ? (
          <div className="text-center py-12 bg-green-500/10 border border-green-500/20 rounded-xl">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Assignment Submitted!</h4>
            <p className="text-gray-400">Your work is being reviewed. The lecture has been marked as complete.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea 
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Paste your GitHub repository link or project text here..."
              rows={6}
              className="w-full bg-[#1e2130] border border-gray-600 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            ></textarea>
            
            <div className="flex justify-between items-center">
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-gray-600 hover:border-gray-400 rounded-lg px-4 py-2">
                <UploadCloud size={16} /> Attach File (Optional)
              </button>
              
              <button 
                onClick={handleSubmit}
                disabled={!submission.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 px-8 rounded-lg transition-all"
              >
                Submit Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
