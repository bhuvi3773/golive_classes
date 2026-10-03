"use client";

import { X, PlaySquare, FileSignature, ArrowRight, ArrowLeft } from "lucide-react";
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
          description: "Course description goes here...", // Defaults to be filled later
          price: 0,
          category,
          thumbnail: "",
          status: 'draft', // Created as draft
          instructor: 'Admin', 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to the management/curriculum dashboard
        router.push(`/admin/courses/${data._id}/manage`);
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
    <div className="min-h-[80vh] bg-[#0a0c16] flex flex-col items-center">
      {/* Header */}
      <header className="w-full h-16 border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-white tracking-tight">GoLive<span className="text-blue-500">Teacher</span></span>
          <div className="h-6 w-px bg-white/10"></div>
          <span className="text-gray-400 font-medium">Step {step} of {totalSteps}</span>
        </div>
        <Link href="/admin/courses" className="text-blue-400 hover:text-blue-300 font-bold text-sm">
          Exit
        </Link>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-[#1e2130] h-1">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out" 
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>

      {/* Content area */}
      <div className="flex-1 w-full max-w-3xl flex flex-col justify-center px-6 py-12">
        {error && <div className="mb-6 text-red-400 bg-red-500/10 p-4 rounded-lg font-medium text-center border border-red-500/20">{error}</div>}
        
        {/* STEP 1: Type */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-12">First, let's find out what type of course you're making.</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div 
                onClick={() => setCourseType("course")}
                className={`p-8 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4 ${courseType === 'course' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-[#1e2130] hover:border-gray-500'}`}
              >
                <PlaySquare size={48} className={courseType === 'course' ? 'text-blue-400' : 'text-gray-400'} />
                <h3 className="text-xl font-bold text-white">Course</h3>
                <p className="text-sm text-gray-400">Create rich learning experiences with the help of video lectures, quizzes, coding exercises, etc.</p>
              </div>
              <div 
                onClick={() => setCourseType("practice")}
                className={`p-8 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4 ${courseType === 'practice' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-[#1e2130] hover:border-gray-500'}`}
              >
                <FileSignature size={48} className={courseType === 'practice' ? 'text-blue-400' : 'text-gray-400'} />
                <h3 className="text-xl font-bold text-white">Practice Test</h3>
                <p className="text-sm text-gray-400">Help students prepare for certification exams by providing practice questions.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Title */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center max-w-2xl mx-auto w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">How about a working title?</h1>
            <p className="text-gray-400 mb-12">It's ok if you can't think of a good title now. You can change it later.</p>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Learn Python from Scratch"
              className="w-full bg-[#1e2130] border border-gray-600 rounded-lg px-6 py-4 text-lg focus:outline-none focus:border-blue-500 transition-colors text-white"
            />
          </div>
        )}

        {/* STEP 3: Category */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center max-w-2xl mx-auto w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">What category best fits the knowledge you'll share?</h1>
            <p className="text-gray-400 mb-12">If you're not sure about the right category, you can change it later.</p>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#1e2130] border border-gray-600 rounded-lg px-6 py-4 text-lg focus:outline-none focus:border-blue-500 transition-colors text-white appearance-none cursor-pointer"
            >
              {categories.length === 0 && <option value="">Loading...</option>}
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* STEP 4: Time Commitment */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center max-w-2xl mx-auto w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">How much time can you spend creating your course per week?</h1>
            <p className="text-gray-400 mb-12">There's no wrong answer. We can help you achieve your goals even if you don't have much time.</p>
            
            <div className="space-y-4 text-left">
              {[
                "I'm very busy right now (0-2 hours)",
                "I'll work on this on the side (2-4 hours)",
                "I have lots of flexibility (5+ hours)",
                "I haven't yet decided if I have time"
              ].map(option => (
                <label key={option} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${timeCommitment === option ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-[#1e2130] hover:border-gray-500'}`}>
                  <input 
                    type="radio" 
                    name="time" 
                    value={option}
                    checked={timeCommitment === option}
                    onChange={(e) => setTimeCommitment(e.target.value)}
                    className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-600 focus:ring-2"
                  />
                  <span className="text-gray-200 font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <footer className="w-full h-24 border-t border-white/10 flex items-center px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
          {step > 1 ? (
            <button onClick={handleBack} className="px-6 py-2.5 rounded-sm border border-white/20 text-white font-bold hover:bg-white/5 transition-colors">
              Previous
            </button>
          ) : <div></div>}

          {step < totalSteps ? (
            <button onClick={handleNext} className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-sm font-bold transition-colors">
              Continue
            </button>
          ) : (
            <button 
              onClick={handleCreateCourse} 
              disabled={saving}
              className="bg-blue-600 text-white hover:bg-blue-500 px-8 py-2.5 rounded-sm font-bold transition-colors disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Course"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
