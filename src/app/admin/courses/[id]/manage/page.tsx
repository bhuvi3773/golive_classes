"use client";

import { useState, useEffect, use } from "react";
import { Plus, GripVertical, CheckCircle, Video, FileText, UploadCloud, X, Award, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import QuizBuilder from "@/components/admin/QuizBuilder";
import AssignmentBuilder from "@/components/admin/AssignmentBuilder";

type Lecture = {
  id: number;
  title: string;
  type: string;
  content: string | null;
  originalName?: string;
};

type Section = {
  id: number;
  title: string;
  lectures: Lecture[];
};

export default function CourseManagementDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("curriculum");
  const [course, setCourse] = useState<any>(null);

  // Mock curriculum structure
  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      title: "Introduction",
      lectures: [
        { id: 101, title: "Welcome to the Course!", type: "video", content: null },
        { id: 102, title: "What you will learn", type: "video", content: null }
      ]
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [activeUpload, setActiveUpload] = useState<{lectureId: number, type: 'video' | 'article' | 'quiz' | 'assignment'} | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        if (data.curriculum && data.curriculum.length > 0) {
          setSections(data.curriculum);
        }
      })
      .catch(() => {});
  }, [courseId]);

  const addSection = () => {
    setSections([...sections, { id: Date.now(), title: "New Section", lectures: [] }]);
  };

  const updateCourseField = (field: string, value: any) => {
    if (course) {
      setCourse({ ...course, [field]: value });
    }
  };

  const addLecture = (sectionId: number) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          lectures: [...sec.lectures, { id: Date.now(), title: "New Lecture", type: "video", content: null }]
        };
      }
      return sec;
    }));
  };

  const updateTitle = (sectionId: number, lectureId: number | null, newTitle: string) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        if (lectureId === null) {
          return { ...sec, title: newTitle };
        } else {
          return {
            ...sec,
            lectures: sec.lectures.map(lec => lec.id === lectureId ? { ...lec, title: newTitle } : lec)
          };
        }
      }
      return sec;
    }));
  };

  const handleFileUpload = async (sectionId: number, lectureId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderType', 'video');
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        if (data.success) {
          setSections(sections.map(sec => {
            if (sec.id === sectionId) {
              return {
                ...sec,
                lectures: sec.lectures.map(lec => lec.id === lectureId ? { ...lec, content: data.url, type: 'video', originalName: file.name } : lec)
              };
            }
            return sec;
          }));
        } else {
          alert(`Upload failed: ${data.error || "Please check upload configuration"}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
        setActiveUpload(null);
      }
    }
  };

  const handleDeleteContent = (sectionId: number, lectureId: number) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          lectures: sec.lectures.map(lec => lec.id === lectureId ? { ...lec, content: "", originalName: "" } : lec)
        };
      }
      return sec;
    }));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderType', 'thumbnail');
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        if (data.success) {
          updateCourseField('thumbnail', data.url);
        } else {
          alert(`Upload failed: ${data.error}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveArticle = (sectionId: number, lectureId: number, content: string) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          lectures: sec.lectures.map(lec => lec.id === lectureId ? { ...lec, content: "Article Content Saved", type: 'article' } : lec)
        };
      }
      return sec;
    }));
    setActiveUpload(null);
  };

  const handleSaveQuiz = (sectionId: number, lectureId: number, quizData: any) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          lectures: sec.lectures.map(lec => lec.id === lectureId ? { ...lec, quizData, content: "Quiz Setup Completed", type: 'quiz' } : lec)
        };
      }
      return sec;
    }));
    setActiveUpload(null);
  };

  const handleSaveAssignment = (sectionId: number, lectureId: number, assignmentData: any) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          lectures: sec.lectures.map(lec => lec.id === lectureId ? { ...lec, assignmentData, content: "Assignment Setup Completed", type: 'assignment' } : lec)
        };
      }
      return sec;
    }));
    setActiveUpload(null);
  };

  const removeContent = (sectionId: number, lectureId: number) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          lectures: sec.lectures.map(lec => lec.id === lectureId ? { ...lec, content: null } : lec)
        };
      }
      return sec;
    }));
  };

  const deleteSection = (sectionId: number) => {
    if (confirm('Are you sure you want to delete this entire section?')) {
      setSections(sections.filter(sec => sec.id !== sectionId));
    }
  };

  const deleteLecture = (sectionId: number, lectureId: number) => {
    if (confirm('Are you sure you want to delete this lecture?')) {
      setSections(sections.map(sec => {
        if (sec.id === sectionId) {
          return { ...sec, lectures: sec.lectures.filter(lec => lec.id !== lectureId) };
        }
        return sec;
      }));
    }
  };

  const toggleUpload = (lectureId: number, type: 'video' | 'article' | 'quiz' | 'assignment') => {
    if (activeUpload?.lectureId === lectureId && activeUpload?.type === type) {
      setActiveUpload(null);
    } else {
      setActiveUpload({ lectureId, type });
    }
  };

  const saveCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...course,
          curriculum: sections 
        })
      });
      if (res.ok) {
        alert("Course saved successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to save course: ${errorData.error || res.statusText}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error saving course: ${err.message}`);
    }
  };

  const publishCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...course,
          status: 'pending', 
          curriculum: sections 
        })
      });
      if (res.ok) {
        alert("Course submitted for review successfully! It will be visible to students once approved by an admin.");
        router.push('/admin/courses');
      } else {
        const errorData = await res.json();
        alert(`Failed to submit course: ${errorData.error || res.statusText}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error submitting course: ${err.message}`);
    }
  };

  return (
    <div className="flex min-h-[75vh] bg-[#FAF7F0] rounded-2xl overflow-hidden border border-[#E9DFCC] mt-6 shadow-sm text-[#1B2E26]">
      {/* Faculty Sidebar */}
      <div className="w-64 bg-[#F8F4EC] border-r border-[#E9DFCC] flex flex-col p-5 shrink-0">
        <h3 className="text-xs font-bold text-[#3D5A4C] uppercase tracking-wider mb-4 px-2">Plan Curriculum</h3>
        <button 
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left text-xs font-semibold ${activeTab === 'goals' ? 'bg-[#DCE6D8] text-[#24483C] border-l-2 border-[#24483C]' : 'text-[#556960] hover:bg-[#E9DFCC]/40 hover:text-[#1B2E26]'}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${activeTab === 'goals' ? 'border-[#24483C] bg-[#24483C]' : 'border-[#556960]'}`}></div>
          Intended Scholars
        </button>

        <h3 className="text-xs font-bold text-[#3D5A4C] uppercase tracking-wider mt-8 mb-4 px-2">Course Syllabus</h3>
        <button 
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left text-xs font-semibold ${activeTab === 'curriculum' ? 'bg-[#DCE6D8] text-[#24483C] border-l-2 border-[#24483C]' : 'text-[#556960] hover:bg-[#E9DFCC]/40 hover:text-[#1B2E26]'}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${activeTab === 'curriculum' ? 'border-[#24483C] bg-[#24483C]' : 'border-[#556960]'}`}></div>
          Curriculum Modules
        </button>

        <h3 className="text-xs font-bold text-[#3D5A4C] uppercase tracking-wider mt-8 mb-4 px-2">Publishing & Listing</h3>
        <button 
          onClick={() => setActiveTab('landing')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left text-xs font-semibold ${activeTab === 'landing' ? 'bg-[#DCE6D8] text-[#24483C] border-l-2 border-[#24483C]' : 'text-[#556960] hover:bg-[#E9DFCC]/40 hover:text-[#1B2E26]'}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${activeTab === 'landing' ? 'border-[#24483C] bg-[#24483C]' : 'border-[#556960]'}`}></div>
          Course Landing Page
        </button>
        <button 
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left text-xs font-semibold ${activeTab === 'pricing' ? 'bg-[#DCE6D8] text-[#24483C] border-l-2 border-[#24483C]' : 'text-[#556960] hover:bg-[#E9DFCC]/40 hover:text-[#1B2E26]'}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${activeTab === 'pricing' ? 'border-[#24483C] bg-[#24483C]' : 'border-[#556960]'}`}></div>
          Tuition Pricing
        </button>

        <div className="mt-auto pt-8 pb-2 space-y-2.5">
          <button 
            onClick={saveCourse}
            className="w-full bg-[#FAF7F0] hover:bg-[#E9DFCC]/50 text-[#1B2E26] py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors border border-[#E9DFCC] shadow-sm"
          >
            Save Draft
          </button>
          <button 
            onClick={publishCourse}
            className="w-full bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            Submit For Review
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-[#FAF7F0] overflow-y-auto">
        
        {activeTab === 'curriculum' && (
          <div className="max-w-4xl animate-in fade-in space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Curriculum Architecture</span>
              <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">Syllabus Modules & Content</h2>
              <p className="text-[#556960] text-xs mt-1 pb-4 border-b border-[#E9DFCC]">
                Structure your course into cohesive chronological sections, lectures, assignments, and knowledge evaluations.
              </p>
            </div>

            <div className="space-y-6">
              {sections.map((section, sIdx) => (
                <div key={section.id} className="bg-[#F8F4EC] border border-[#E9DFCC] rounded-2xl overflow-hidden shadow-sm">
                  {/* Section Header */}
                  <div className="bg-[#FAF7F0] p-4 flex items-center gap-3 border-b border-[#E9DFCC] group">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#3D5A4C]">Section {sIdx + 1}:</span>
                    <input 
                      type="text" 
                      value={section.title}
                      onChange={(e) => updateTitle(section.id, null, e.target.value)}
                      className="bg-transparent text-[#1B2E26] font-serif font-bold text-base focus:outline-none focus:border-b focus:border-[#24483C] w-full"
                    />
                    <button onClick={() => deleteSection(section.id)} className="opacity-0 group-hover:opacity-100 text-[#556960] hover:text-[#8B381A] transition-opacity p-1.5" title="Delete section">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Lectures */}
                  <div className="p-4 space-y-3">
                    {section.lectures.map((lecture, lIdx) => (
                      <div key={lecture.id} className={`border bg-[#FAF7F0] rounded-xl transition-colors ${activeUpload?.lectureId === lecture.id ? 'border-[#24483C] shadow-sm' : 'border-[#E9DFCC]'}`}>
                        <div className="p-3 flex items-center gap-3 group">
                          <GripVertical size={15} className="text-[#556960] cursor-grab opacity-0 group-hover:opacity-100" />
                          <CheckCircle size={16} className={lecture.content ? "text-[#24483C]" : "text-[#556960]/40"} />
                          <span className="font-bold text-xs uppercase tracking-wider text-[#556960] whitespace-nowrap">Lecture {lIdx + 1}:</span>
                          <input 
                            type="text" 
                            value={lecture.title}
                            onChange={(e) => updateTitle(section.id, lecture.id, e.target.value)}
                            className="bg-transparent text-[#1B2E26] text-xs font-medium focus:outline-none focus:border-b focus:border-[#24483C] flex-1 min-w-0"
                          />
                          {lecture.content && (
                            <div className="flex items-center gap-1.5 bg-[#DCE6D8] px-2.5 py-1 rounded-lg border border-[#24483C]/20 mr-2">
                              <span className="text-[11px] font-semibold text-[#24483C] truncate max-w-[150px]" title={lecture.content}>
                                {lecture.type === 'video' ? `🎥 ${lecture.originalName || 'Video Attached'}` : lecture.type === 'quiz' ? `🏆 Quiz Added` : lecture.type === 'assignment' ? `📝 Practicum` : `📄 Article`}
                              </span>
                              <button 
                                onClick={() => removeContent(section.id, lecture.id)}
                                className="text-[#24483C] hover:text-[#8B381A] p-0.5 rounded transition-colors ml-1"
                                title="Remove content"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}
                          <div className="flex gap-1.5 shrink-0">
                            <button 
                              onClick={() => toggleUpload(lecture.id, 'video')}
                              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${activeUpload?.lectureId === lecture.id && activeUpload.type === 'video' ? 'bg-[#24483C] text-[#F8F4EC] border-[#24483C]' : 'bg-[#F8F4EC] hover:bg-[#E9DFCC]/50 border-[#E9DFCC] text-[#24483C]'}`}
                            >
                              <Video size={13} /> + Video
                            </button>
                            <button 
                              onClick={() => toggleUpload(lecture.id, 'article')}
                              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${activeUpload?.lectureId === lecture.id && activeUpload.type === 'article' ? 'bg-[#24483C] text-[#F8F4EC] border-[#24483C]' : 'bg-[#F8F4EC] hover:bg-[#E9DFCC]/50 border-[#E9DFCC] text-[#24483C]'}`}
                            >
                              <FileText size={13} /> + Article
                            </button>
                            <button 
                              onClick={() => toggleUpload(lecture.id, 'quiz')}
                              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${activeUpload?.lectureId === lecture.id && activeUpload.type === 'quiz' ? 'bg-[#24483C] text-[#F8F4EC] border-[#24483C]' : 'bg-[#F8F4EC] hover:bg-[#E9DFCC]/50 border-[#E9DFCC] text-[#24483C]'}`}
                            >
                              <Award size={13} /> + Quiz
                            </button>
                            <button 
                              onClick={() => toggleUpload(lecture.id, 'assignment')}
                              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${activeUpload?.lectureId === lecture.id && activeUpload.type === 'assignment' ? 'bg-[#24483C] text-[#F8F4EC] border-[#24483C]' : 'bg-[#F8F4EC] hover:bg-[#E9DFCC]/50 border-[#E9DFCC] text-[#24483C]'}`}
                            >
                              <FileText size={13} /> + Practicum
                            </button>
                            <button onClick={() => deleteLecture(section.id, lecture.id)} className="p-1.5 hover:text-[#8B381A] rounded text-[#556960] transition-colors" title="Delete lecture">
                              <X size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Editor / Dropzone */}
                        {activeUpload?.lectureId === lecture.id && (
                          <div className="px-8 pb-5 pt-3 border-t border-[#E9DFCC] bg-[#F8F4EC] rounded-b-xl animate-in slide-in-from-top-1">
                            {activeUpload.type === 'video' ? (
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-2">Video Resource Delivery</h4>
                                {lecture.type === 'video' && lecture.content ? (
                                  <div className="flex items-center justify-between bg-[#DCE6D8] border border-[#24483C]/20 p-4 rounded-xl">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-[#24483C] rounded-xl flex items-center justify-center text-[#F8F4EC]">
                                        <Video size={18} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-[#1B2E26] text-xs">{lecture.originalName || "Video Attached"}</p>
                                        <p className="text-[11px] text-[#24483C] font-semibold">Available for secure streaming</p>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => handleDeleteContent(section.id, lecture.id)}
                                      className="p-2 bg-[#C96F4A]/10 text-[#8B381A] hover:bg-[#C96F4A]/20 rounded-lg transition-colors border border-[#C96F4A]/30"
                                      title="Remove Video"
                                    >
                                      <Trash size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="border-2 border-dashed border-[#E9DFCC] rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-[#FAF7F0] hover:border-[#24483C] transition-colors cursor-pointer group relative bg-[#FAF7F0]">
                                    <input 
                                      type="file" 
                                      accept="video/mp4,video/webm" 
                                      className="hidden" 
                                      onChange={(e) => handleFileUpload(section.id, lecture.id, e)}
                                      disabled={isUploading}
                                    />
                                    {isUploading ? (
                                      <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-3 border-[#24483C] border-t-transparent rounded-full animate-spin mb-3"></div>
                                        <p className="text-xs font-semibold text-[#24483C]">Encoding & dispatching to media storage...</p>
                                      </div>
                                    ) : (
                                      <>
                                        <UploadCloud size={32} className="text-[#556960] group-hover:text-[#24483C] mb-2 transition-colors" />
                                        <p className="text-xs font-semibold text-[#1B2E26]">Select or drag video lecture media</p>
                                        <p className="text-[11px] text-[#556960] mt-0.5">MP4 or WebM format. High definition recommended.</p>
                                      </>
                                    )}
                                  </label>
                                )}
                              </div>
                            ) : activeUpload.type === 'article' ? (
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-2">Academic Treatise / Article Text</h4>
                                <textarea 
                                  rows={5}
                                  placeholder="Author comprehensive lecture discourse and code samples..."
                                  className="w-full bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl p-4 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C] resize-y"
                                ></textarea>
                                <div className="flex justify-end mt-2">
                                  <button 
                                    onClick={() => handleSaveArticle(section.id, lecture.id, "content")}
                                    className="bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-xl"
                                  >
                                    Save Article
                                  </button>
                                </div>
                              </div>
                            ) : activeUpload.type === 'quiz' ? (
                              <QuizBuilder 
                                initialData={(lecture as any).quizData}
                                onSave={(data) => handleSaveQuiz(section.id, lecture.id, data)}
                              />
                            ) : (
                              <AssignmentBuilder 
                                initialData={(lecture as any).assignmentData}
                                onSave={(data) => handleSaveAssignment(section.id, lecture.id, data)}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => addLecture(section.id)}
                      className="mt-4 flex items-center gap-1.5 text-xs text-[#24483C] hover:text-[#1B2E26] font-bold uppercase tracking-wider"
                    >
                      <Plus size={15} /> Append Lecture
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={addSection}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 border border-[#24483C]/30 bg-[#DCE6D8] hover:bg-[#24483C] hover:text-[#F8F4EC] text-[#24483C] font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm"
            >
              <Plus size={16} /> Append Curriculum Section
            </button>
          </div>
        )}

        {activeTab === 'goals' && course && (
          <div className="max-w-4xl animate-in fade-in space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Pedagogical Objectives</span>
              <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">Intended Learners & Outcomes</h2>
              <p className="text-[#556960] text-xs mt-1 pb-4 border-b border-[#E9DFCC]">
                Detail what competencies scholars will develop and what prerequisites are required.
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-base font-bold text-[#1B2E26] mb-1">What will scholars master in this curriculum?</h3>
                <p className="text-xs text-[#556960] mb-3">State tangible learning outcomes (one objective per line).</p>
                <textarea 
                  value={course.goals?.join('\n') || ''}
                  onChange={(e) => updateCourseField('goals', e.target.value.split('\n'))}
                  placeholder="Example: Design and deploy fault-tolerant microservices architectures"
                  rows={4}
                  className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl p-4 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]"
                ></textarea>
              </div>

              <div>
                <h3 className="font-serif text-base font-bold text-[#1B2E26] mb-1">Prerequisites and prior knowledge requirements</h3>
                <textarea 
                  value={course.requirements?.join('\n') || ''}
                  onChange={(e) => updateCourseField('requirements', e.target.value.split('\n'))}
                  placeholder="Example: Working familiarity with TypeScript and relational data models."
                  rows={3}
                  className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl p-4 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]"
                ></textarea>
              </div>

              <div>
                <h3 className="font-serif text-base font-bold text-[#1B2E26] mb-1">Target Scholar Profile</h3>
                <textarea 
                  value={course.targetAudience?.join('\n') || ''}
                  onChange={(e) => updateCourseField('targetAudience', e.target.value.split('\n'))}
                  placeholder="Example: Software engineers and system architects aspiring toward senior leadership."
                  rows={3}
                  className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl p-4 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'landing' && course && (
          <div className="max-w-4xl animate-in fade-in space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Public Catalogue Presence</span>
              <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">Course Landing Page Specification</h2>
              <p className="text-[#556960] text-xs mt-1 pb-4 border-b border-[#E9DFCC]">
                The public storefront and syllabus presentation viewed by prospective scholars.
              </p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-1.5">Official Title</label>
                <input 
                  type="text" 
                  value={course.title || ''}
                  onChange={(e) => updateCourseField('title', e.target.value)}
                  className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl p-3.5 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-1.5">Comprehensive Course Overview</label>
                <textarea 
                  value={course.description || ''}
                  onChange={(e) => updateCourseField('description', e.target.value)}
                  rows={5}
                  className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl p-3.5 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-1.5">Academic Discipline</label>
                  <select 
                    value={course.category || ''}
                    onChange={(e) => updateCourseField('category', e.target.value)}
                    className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl p-3 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]"
                  >
                    <option value="">Select Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-1.5">Course Artwork (Thumbnail)</label>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {course.thumbnail ? (
                    <div className="relative w-64 h-36 bg-[#E9DFCC] rounded-xl overflow-hidden border border-[#E9DFCC] group shadow-sm">
                      <img src={course.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-[#24483C]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <button 
                            onClick={() => updateCourseField('thumbnail', '')} 
                            className="bg-[#C96F4A] text-[#F8F4EC] p-2 rounded-xl transition-colors"
                            title="Remove Thumbnail"
                         >
                            <Trash size={16} />
                         </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-64 h-36 border-2 border-dashed border-[#E9DFCC] rounded-xl flex flex-col items-center justify-center text-center hover:border-[#24483C] transition-colors cursor-pointer relative bg-[#F8F4EC]">
                      <input 
                        type="file" 
                        accept="image/png,image/jpeg,image/webp" 
                        className="hidden" 
                        onChange={handleThumbnailUpload}
                        disabled={isUploading}
                      />
                      <UploadCloud size={24} className="text-[#556960] mb-1.5 transition-colors" />
                      <p className="text-xs font-semibold text-[#1B2E26]">Select Course Artwork</p>
                      <p className="text-[10px] text-[#556960] mt-0.5">Recommended: 16:9 ratio</p>
                    </label>
                  )}
                  <div className="flex-1 text-xs text-[#556960] space-y-1 leading-relaxed">
                    <p>Select academic artwork suitable for catalogue display and official diplomas.</p>
                    <p>Recommended specifications: 1280x720 pixels or greater. Clean framing without cluttered text overlays.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="h-full flex items-center justify-center text-[#556960] text-sm">
            <p>Tuition schedule configurations can be customized here. Use Curriculum modules to author lectures.</p>
          </div>
        )}
      </div>
    </div>
  );
}
