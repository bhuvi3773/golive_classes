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
    <div className="space-y-4 text-[#1B2E26]">
      <div className="pb-2 border-b border-[#E9DFCC]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">Construct Practicum Assignment</h4>
      </div>
      
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#3D5A4C] block mb-1">Assignment Title</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Architect High-Throughput Message Queue"
          className="w-full bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl px-3.5 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#3D5A4C] block mb-1">Problem Specification & Requirements</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detail the technical implementation requirements and constraints..."
          rows={4}
          className="w-full bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl px-3.5 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#3D5A4C] block mb-1">Expected Deliverable Format</label>
          <input 
            type="text" 
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(e.target.value)}
            placeholder="e.g. Public GitHub Repository Link"
            className="w-full bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl px-3.5 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#3D5A4C] block mb-1">Benchmark Threshold (%)</label>
          <input 
            type="number" 
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="w-full bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl px-3.5 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave}
          className="bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] text-xs font-semibold uppercase tracking-wider px-5 py-2 rounded-xl transition-colors shadow-sm"
        >
          Save Practicum Specification
        </button>
      </div>
    </div>
  );
}
