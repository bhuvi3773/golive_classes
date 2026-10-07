"use client";

import { useState } from "react";

interface AssignmentBuilderProps {
  onSave: (assignmentData: { title: string; description: string; expectedOutput: string; passingScore: number }) => void;
  initialData?: any;
}

export default function AssignmentBuilder({ onSave, initialData }: AssignmentBuilderProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [expectedOutput, setExpectedOutput] = useState(initialData?.expectedOutput || "");
  const [passingScore, setPassingScore] = useState(initialData?.passingScore || 70);

  const handleSave = () => {
    onSave({ title, description, expectedOutput, passingScore });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-slate-900 mb-2">Create Assignment</h4>
      
      <div>
        <label className="text-xs text-slate-500">Assignment Title</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Build a Portfolio Website"
          className="w-full bg-white border border-gray-600 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500">Problem Description</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what the student needs to build..."
          rows={4}
          className="w-full bg-white border border-gray-600 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500">Expected Outcome / Format</label>
          <input 
            type="text" 
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(e.target.value)}
            placeholder="e.g. GitHub Repo Link"
            className="w-full bg-white border border-gray-600 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Passing Score (%)</label>
          <input 
            type="number" 
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="w-full bg-white border border-gray-600 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
        >
          Save Assignment
        </button>
      </div>
    </div>
  );
}
