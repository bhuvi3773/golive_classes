"use client";

import { useState, useEffect, use } from "react";
import { Plus, GripVertical, CheckCircle, Video, FileText, ChevronDown, UploadCloud, X, Award, Trash } from "lucide-react";
import Link from "next/link";
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
      
      // Explicitly tell the backend this is a video so it knows to use the Videos Folder ID
      // This prevents the "Storage Quota" error if the browser fails to detect the video mime type
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
          alert(`Upload failed: ${data.error || "Please check your Cloudinary credentials in .env.local"}`);
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
      // You can add a loading state specifically for thumbnail if you want, or reuse isUploading
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
      setActiveUpload(null); // toggle off
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
    <div className="flex min-h-[75vh] glass-card rounded-xl overflow-hidden border border-white/10 mt-6 shadow-2xl">
      
      {/* Instructor Sidebar */}
      <div className="w-64 bg-slate-900/50 backdrop-blur-sm border-r border-white/10 flex flex-col p-4 shrink-0">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Plan your course</h3>
        <button 
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${activeTab === 'goals' ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeTab === 'goals' ? 'border-teal-400' : 'border-slate-500'}`}></div>
          Intended learners
        </button>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-2">Create your content</h3>
        <button 
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${activeTab === 'curriculum' ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeTab === 'curriculum' ? 'border-teal-400 bg-teal-400' : 'border-slate-500 bg-transparent'}`}></div>
          Curriculum
        </button>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-2">Publish your course</h3>
        <button 
          onClick={() => setActiveTab('landing')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${activeTab === 'landing' ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeTab === 'landing' ? 'border-teal-400' : 'border-slate-500'}`}></div>
          Course landing page
        </button>
        <button 
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${activeTab === 'pricing' ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeTab === 'pricing' ? 'border-teal-400' : 'border-slate-500'}`}></div>
          Pricing
        </button>

        <div className="mt-auto pt-8 pb-2 px-2 space-y-3">
          <button 
            onClick={saveCourse}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-md font-bold transition-colors border border-white/10"
          >
            Save Draft
          </button>
          <button 
            onClick={publishCourse}
            className="w-full btn-primary py-2 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
          >
            Submit for Review
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-slate-900/40 overflow-y-auto">
        
        {activeTab === 'curriculum' && (
          <div className="max-w-4xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Curriculum</h2>
            <p className="text-slate-400 mb-8 pb-6 border-b border-white/10">
              Start putting together your course by creating sections, lectures and practice activities. Use your outline to structure your content and label your sections and lectures clearly.
            </p>

            <div className="space-y-6">
              {sections.map((section, sIdx) => (
                <div key={section.id} className="bg-slate-800/40 border border-white/10 rounded-lg overflow-hidden shadow-md">
                  {/* Section Header */}
                  <div className="bg-slate-900/50 p-4 flex items-center gap-3 border-b border-white/10 group">
                    <span className="font-bold text-sm text-slate-400">Section {sIdx + 1}:</span>
                    <input 
                      type="text" 
                      value={section.title}
                      onChange={(e) => updateTitle(section.id, null, e.target.value)}
                      className="bg-transparent text-white font-bold text-base focus:outline-none focus:border-b focus:border-teal-500 w-full placeholder:text-slate-500"
                    />
                    <button onClick={() => deleteSection(section.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-2">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Lectures */}
                  <div className="p-4 space-y-3">
                    {section.lectures.map((lecture, lIdx) => (
                      <div key={lecture.id} className={`border bg-slate-900/50 rounded-md transition-colors ${activeUpload?.lectureId === lecture.id ? 'border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.1)]' : 'border-white/5'}`}>
                        <div className="p-3 flex items-center gap-3 group">
                          <GripVertical size={16} className="text-slate-500 cursor-grab opacity-0 group-hover:opacity-100" />
                          <CheckCircle size={16} className={lecture.content ? "text-teal-400" : "text-slate-600"} />
                          <span className="font-medium text-sm text-slate-400 whitespace-nowrap">Lecture {lIdx + 1}:</span>
                          <input 
                            type="text" 
                            value={lecture.title}
                            onChange={(e) => updateTitle(section.id, lecture.id, e.target.value)}
                            className="bg-transparent text-white text-sm focus:outline-none focus:border-b focus:border-teal-500 flex-1 min-w-0 placeholder:text-slate-600"
                          />
                          {lecture.content && (
                            <div className="flex items-center gap-1 bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20 mr-2">
                              <span className="text-xs text-teal-400 truncate max-w-[150px]" title={lecture.content}>
                                {lecture.type === 'video' ? `🎥 ${lecture.originalName || 'Video Attached'}` : lecture.type === 'quiz' ? `🏆 Quiz Added` : lecture.type === 'assignment' ? `📝 Assignment` : `📄 Article`}
                              </span>
                              <button 
                                onClick={() => removeContent(section.id, lecture.id)}
                                className="text-teal-400 hover:text-red-400 hover:bg-red-500/10 p-0.5 rounded transition-colors ml-1"
                                title="Remove content"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => toggleUpload(lecture.id, 'video')}
                              className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded border transition-colors ${activeUpload?.lectureId === lecture.id && activeUpload.type === 'video' ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-slate-800 hover:bg-slate-700 border-white/10 text-slate-300'}`}
                            >
                              <Video size={14} /> + Video
                            </button>
                            <button 
                              onClick={() => toggleUpload(lecture.id, 'article')}
                              className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded border transition-colors ${activeUpload?.lectureId === lecture.id && activeUpload.type === 'article' ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-slate-800 hover:bg-slate-700 border-white/10 text-slate-300'}`}
                            >
                              <FileText size={14} /> + Article
                            </button>
                            <button 
                              onClick={() => toggleUpload(lecture.id, 'quiz')}
                              className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded border transition-colors ${activeUpload?.lectureId === lecture.id && activeUpload.type === 'quiz' ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-slate-800 hover:bg-slate-700 border-white/10 text-slate-300'}`}
                            >
                              <Award size={14} /> + Quiz
                            </button>
                            <button 
                              onClick={() => toggleUpload(lecture.id, 'assignment')}
                              className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded border transition-colors ${activeUpload?.lectureId === lecture.id && activeUpload.type === 'assignment' ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-slate-800 hover:bg-slate-700 border-white/10 text-slate-300'}`}
                            >
                              <FileText size={14} /> + Assignment
                            </button>
                            <button onClick={() => deleteLecture(section.id, lecture.id)} className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded text-slate-500 transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Editor / Dropzone */}
                        {activeUpload?.lectureId === lecture.id && (
                          <div className="px-10 pb-4 pt-2 border-t border-white/10 bg-slate-900/60 animate-in slide-in-from-top-2">
                            {activeUpload.type === 'video' ? (
                              <div>
                                <h4 className="text-sm font-medium text-white mb-2">Video Content</h4>
                                {lecture.type === 'video' && lecture.content ? (
                                  <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/20 p-4 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400">
                                        <Video size={20} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-white text-sm">{lecture.originalName || "Video File Attached"}</p>
                                        <p className="text-xs text-teal-400 font-medium">Successfully uploaded</p>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => handleDeleteContent(section.id, lecture.id)}
                                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors border border-red-500/20"
                                      title="Delete Video"
                                    >
                                      <Trash size={18} />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="border-2 border-dashed border-white/20 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-800/80 hover:border-teal-500 transition-colors cursor-pointer group relative bg-slate-900/40">
                                    <input 
                                      type="file" 
                                      accept="video/mp4,video/webm" 
                                      className="hidden" 
                                      onChange={(e) => handleFileUpload(section.id, lecture.id, e)}
                                      disabled={isUploading}
                                    />
                                    {isUploading ? (
                                      <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                        <p className="text-sm font-medium text-teal-400">Uploading...</p>
                                      </div>
                                    ) : (
                                      <>
                                        <UploadCloud size={32} className="text-slate-500 group-hover:text-teal-400 mb-3 transition-colors" />
                                        <p className="text-sm font-medium text-slate-300">Click to upload your video</p>
                                        <p className="text-xs text-slate-500 mt-1">MP4 or WebM format. Max 4GB.</p>
                                      </>
                                    )}
                                  </label>
                                )}
                              </div>
                            ) : activeUpload.type === 'article' ? (
                              <div>
                                <h4 className="text-sm font-medium text-white mb-2">Write Article Content</h4>
                                <textarea 
                                  rows={5}
                                  placeholder="Type your article content here..."
                                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-teal-500 resize-y placeholder:text-slate-500"
                                ></textarea>
                                <div className="flex justify-end mt-2">
                                  <button 
                                    onClick={() => handleSaveArticle(section.id, lecture.id, "content")}
                                    className="btn-primary text-xs px-4 py-2"
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
                      className="mt-4 flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 font-medium ml-8"
                    >
                      <Plus size={16} /> Add Lecture
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={addSection}
              className="mt-8 flex items-center gap-2 px-4 py-2 border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-bold rounded-lg transition-colors"
            >
              <Plus size={18} /> Add Section
            </button>
          </div>
        )}

        {activeTab === 'goals' && course && (
          <div className="max-w-4xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Intended learners</h2>
            <p className="text-slate-400 mb-8 pb-6 border-b border-white/10">
              The descriptions you write here will help students decide if your course is the right one for them.
            </p>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">What will students learn in your course?</h3>
                <p className="text-sm text-slate-400 mb-4">You must enter at least 1 learning objective or outcome.</p>
                <textarea 
                  value={course.goals?.join('\n') || ''}
                  onChange={(e) => updateCourseField('goals', e.target.value.split('\n'))}
                  placeholder="Example: Define the roles and responsibilities of a project manager"
                  rows={4}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-500"
                ></textarea>
                <p className="text-xs text-slate-500 mt-1">Enter one goal per line.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">What are the requirements or prerequisites for taking your course?</h3>
                <textarea 
                  value={course.requirements?.join('\n') || ''}
                  onChange={(e) => updateCourseField('requirements', e.target.value.split('\n'))}
                  placeholder="Example: No programming experience needed."
                  rows={3}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-500"
                ></textarea>
                <p className="text-xs text-slate-500 mt-1">Enter one requirement per line.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Who is this course for?</h3>
                <textarea 
                  value={course.targetAudience?.join('\n') || ''}
                  onChange={(e) => updateCourseField('targetAudience', e.target.value.split('\n'))}
                  placeholder="Example: Beginner Python developers curious about data science"
                  rows={3}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-teal-500 placeholder:text-slate-500"
                ></textarea>
                <p className="text-xs text-slate-500 mt-1">Enter one audience per line.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'landing' && course && (
          <div className="max-w-4xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Course landing page</h2>
            <p className="text-slate-400 mb-8 pb-6 border-b border-white/10">
              Your course landing page is crucial to your success. If it's done right, it can also help you gain visibility in search engines like Google.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Course title</label>
                <input 
                  type="text" 
                  value={course.title || ''}
                  onChange={(e) => updateCourseField('title', e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Course description</label>
                <textarea 
                  value={course.description || ''}
                  onChange={(e) => updateCourseField('description', e.target.value)}
                  rows={6}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-teal-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Category</label>
                  <select 
                    value={course.category || ''}
                    onChange={(e) => updateCourseField('category', e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-teal-500 [&>option]:bg-slate-900"
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
                <label className="block text-sm font-bold text-slate-300 mb-2">Course image (Thumbnail)</label>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {course.thumbnail ? (
                    <div className="relative w-64 h-36 bg-slate-900 rounded-lg overflow-hidden border border-white/10 group">
                      <img src={course.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <button 
                            onClick={() => updateCourseField('thumbnail', '')} 
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            title="Remove Thumbnail"
                         >
                            <Trash size={18} />
                         </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-64 h-36 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-800/80 hover:border-teal-500 transition-colors cursor-pointer relative bg-slate-900/40">
                      <input 
                        type="file" 
                        accept="image/png,image/jpeg,image/webp" 
                        className="hidden" 
                        onChange={handleThumbnailUpload}
                        disabled={isUploading}
                      />
                      <UploadCloud size={28} className="text-slate-500 mb-2 group-hover:text-teal-400 transition-colors" />
                      <p className="text-sm font-medium text-slate-300">Upload Image</p>
                    </label>
                  )}
                  <div className="flex-1 text-sm text-slate-400 space-y-2">
                    <p>Upload your course image here. It must meet our image quality standards to be accepted.</p>
                    <p>Important guidelines: 750x422 pixels; .jpg, .jpeg,. gif, or .png. no text on the image.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="h-full flex items-center justify-center text-slate-500">
            <p>This section is under development. Please use the Curriculum tab to upload videos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
