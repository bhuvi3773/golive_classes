"use client";

import { PlaySquare, FileSignature } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewCourseWizard() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  // Form State
  const [courseType, setCourseType] = useState<"course" | "practice">("course");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setCategory(data[0].name);
      });
  }, []);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreateCourse = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || "Untitled Course",
          description: "Course syllabus overview goes here...",
          price: 0,
          category,
          thumbnail: "",
          status: 'draft',
          instructor: 'Faculty Admin', 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/courses/${data.id}/manage`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create course");
        setSaving(false);
      }
    } catch (err) {
      setError("An error occurred");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center bg-[#F8F4EC] text-[#1B2E26]">
      {/* Header */}
      <header className="w-full h-16 border-b border-[#E9DFCC] flex items-center justify-between px-6 bg-[#FAF7F0] shadow-sm">
        <div className="flex items-center gap-4">
          <span className="font-serif text-lg font-bold text-[#1B2E26] tracking-tight">GoLive <span className="text-[#C96F4A]">Faculty Authoring</span></span>
          <div className="h-4 w-px bg-[#E9DFCC]"></div>
          <span className="text-[#556960] text-xs font-semibold uppercase tracking-wider">Step {step} of {totalSteps}</span>
        </div>
        <Link href="/admin/courses" className="text-xs font-semibold uppercase tracking-wider text-[#C96F4A] hover:underline">
          Exit Wizard
        </Link>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-[#E9DFCC] h-1.5">
        <div 
          className="h-full bg-[#24483C] transition-all duration-500 ease-out" 
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>

      {/* Content area */}
      <div className="flex-1 w-full max-w-3xl flex flex-col justify-center px-6 py-12">
        {error && <div className="mb-6 text-[#8B381A] bg-[#C96F4A]/10 p-4 rounded-xl font-medium text-xs text-center border border-[#C96F4A]/30">{error}</div>}
        
        {/* STEP 1: Type */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A] block mb-2">Stage 1: Format</span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2E26] mb-10">What style of academic curriculum are you authoring?</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div 
                onClick={() => setCourseType("course")}
                className={`bg-[#FAF7F0] p-8 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4 shadow-sm ${courseType === 'course' ? 'border-[#24483C] bg-[#DCE6D8]/30 shadow-md' : 'border-[#E9DFCC] hover:border-[#24483C]/30'}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#DCE6D8] text-[#24483C] flex items-center justify-center">
                  <PlaySquare size={28} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1B2E26]">Masterclass Course</h3>
                <p className="text-xs text-[#556960] leading-relaxed">Structured learning journeys with sequential video lectures, syllabi, reading materials, and evaluations.</p>
              </div>
              <div 
                onClick={() => setCourseType("practice")}
                className={`bg-[#FAF7F0] p-8 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4 shadow-sm ${courseType === 'practice' ? 'border-[#24483C] bg-[#DCE6D8]/30 shadow-md' : 'border-[#E9DFCC] hover:border-[#24483C]/30'}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#DCE6D8] text-[#24483C] flex items-center justify-center">
                  <FileSignature size={28} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1B2E26]">Practicum & Mock Test</h3>
                <p className="text-xs text-[#556960] leading-relaxed">Prepare scholars for academic and industry examinations through curated assessment batteries.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Title */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center max-w-2xl mx-auto w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A] block mb-2">Stage 2: Nomenclature</span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2E26] mb-3">Provide a working curriculum title</h1>
            <p className="text-[#556960] text-sm mb-8">You can refine and localize this working title at any point prior to publication.</p>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Applied Microservices Architecture & Distributed Systems"
              className="w-full bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl px-6 py-4 text-base focus:outline-none focus:border-[#24483C] transition-colors text-[#1B2E26] placeholder:text-[#556960]/50 shadow-sm"
            />
          </div>
        )}

        {/* STEP 3: Category */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center max-w-2xl mx-auto w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A] block mb-2">Stage 3: Discipline</span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2E26] mb-3">Which academic category best classifies your knowledge?</h1>
            <p className="text-[#556960] text-sm mb-8">This determines the departmental catalog taxonomy and search indexing.</p>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl px-6 py-4 text-base focus:outline-none focus:border-[#24483C] transition-colors text-[#1B2E26] cursor-pointer shadow-sm"
            >
              {categories.length === 0 && <option value="">Loading taxonomy...</option>}
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* STEP 4: Time Commitment */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center max-w-2xl mx-auto w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A] block mb-2">Stage 4: Dedication</span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1B2E26] mb-3">Estimated scholar effort per week?</h1>
            <p className="text-[#556960] text-sm mb-8">Sets appropriate pacing guidance and cohort schedules for enrolled learners.</p>
            
            <div className="space-y-3 text-left">
              {[
                "Accelerated Seminar (0-2 hours / week)",
                "Standard Academic Pacing (2-4 hours / week)",
                "Intensive Immersion Practicum (5+ hours / week)",
                "Self-Paced Flexible Exploration"
              ].map(option => (
                <label key={option} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all bg-[#FAF7F0] shadow-sm ${timeCommitment === option ? 'border-[#24483C] bg-[#DCE6D8]/30 shadow-md' : 'border-[#E9DFCC] hover:border-[#24483C]/30'}`}>
                  <input 
                    type="radio" 
                    name="time" 
                    value={option}
                    checked={timeCommitment === option}
                    onChange={(e) => setTimeCommitment(e.target.value)}
                    className="w-4 h-4 text-[#24483C] accent-[#24483C] cursor-pointer"
                  />
                  <span className="text-[#1B2E26] text-xs font-semibold">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <footer className="w-full h-20 border-t border-[#E9DFCC] flex items-center px-6 bg-[#FAF7F0] shadow-sm">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
          {step > 1 ? (
            <button onClick={handleBack} className="px-5 py-2.5 rounded-xl border border-[#E9DFCC] text-[#1B2E26] text-xs font-semibold uppercase tracking-wider hover:bg-[#E9DFCC]/30 transition-colors shadow-sm">
              Previous
            </button>
          ) : <div></div>}

          {step < totalSteps ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleCreateCourse} 
                disabled={saving}
                className="text-[#556960] hover:text-[#1B2E26] text-xs font-semibold uppercase tracking-wider mr-2 transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
              <button onClick={handleNext} className="bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors">
                Continue
              </button>
            </div>
          ) : (
            <button 
              onClick={handleCreateCourse} 
              disabled={saving}
              className="bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] px-7 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? "Creating Course..." : "Create & Manage Syllabus"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
