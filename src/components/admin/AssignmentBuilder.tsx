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
      <h4 className="text-sm font-medium text-white mb-2">Create Assignment</h4>
      
      <div>
        <label className="text-xs text-gray-400">Assignment Title</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Build a Portfolio Website"
          className="w-full bg-[#1e2130] border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400">Problem Description</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what the student needs to build..."
          rows={4}
          className="w-full bg-[#1e2130] border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400">Expected Outcome / Format</label>
          <input 
            type="text" 
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(e.target.value)}
            placeholder="e.g. GitHub Repo Link"
            className="w-full bg-[#1e2130] border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Passing Score (%)</label>
          <input 
            type="number" 
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="w-full bg-[#1e2130] border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
        >
          Save Assignment
        </button>
      </div>
    </div>
  );
}
