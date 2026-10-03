"use client";

import { useState, useEffect, use } from "react";
import { Plus, GripVertical, CheckCircle, Video, FileText, ChevronDown, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CourseManagementDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("curriculum");
  const [course, setCourse] = useState<any>(null);

  // Mock curriculum structure
  const [sections, setSections] = useState([
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
  const [activeUpload, setActiveUpload] = useState<{lectureId: number, type: 'video' | 'article'} | null>(null);

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
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
        setActiveUpload(null);
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

  const toggleUpload = (lectureId: number, type: 'video' | 'article') => {
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
        body: JSON.stringify({ curriculum: sections })
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
        body: JSON.stringify({ status: 'published', curriculum: sections })
      });
      if (res.ok) {
        alert("Course published successfully! It is now visible to students.");
        router.push('/admin/courses');
      } else {
        const errorData = await res.json();
        alert(`Failed to publish course: ${errorData.error || res.statusText}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error publishing course: ${err.message}`);
    }
  };

  return (
    <div className="flex min-h-[75vh] bg-[#0a0c16] rounded-xl overflow-hidden border border-white/10 mt-6">
      
      {/* Instructor Sidebar */}
      <div className="w-64 bg-[#1e2130] border-r border-white/10 flex flex-col p-4 shrink-0">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Plan your course</h3>
        <button 
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${activeTab === 'goals' ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500' : 'text-gray-300 hover:bg-white/5'}`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeTab === 'goals' ? 'border-blue-400' : 'border-gray-500'}`}></div>
          Intended learners
        </button>

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-2">Create your content</h3>
        <button 
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${activeTab === 'curriculum' ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500' : 'text-gray-300 hover:bg-white/5'}`}
        >
          <div className="w-4 h-4 rounded-full border-2 border-gray-500 bg-gray-500"></div>
          Curriculum
        </button>

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-2">Publish your course</h3>
        <button 
          onClick={() => setActiveTab('landing')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${activeTab === 'landing' ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500' : 'text-gray-300 hover:bg-white/5'}`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeTab === 'landing' ? 'border-blue-400' : 'border-gray-500'}`}></div>
          Course landing page
        </button>
        <button 
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${activeTab === 'pricing' ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500' : 'text-gray-300 hover:bg-white/5'}`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeTab === 'pricing' ? 'border-blue-400' : 'border-gray-500'}`}></div>
          Pricing
        </button>

        <div className="mt-auto pt-8 pb-2 px-2 space-y-3">
          <button 
            onClick={saveCourse}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-md font-bold transition-colors border border-white/20"
          >
            Save Draft
          </button>
          <button 
            onClick={publishCourse}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-md font-bold transition-colors shadow-lg shadow-green-600/20"
          >
            Publish Course
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-[#0a0c16] overflow-y-auto">
        
        {activeTab === 'curriculum' && (
          <div className="max-w-4xl animate-in fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Curriculum</h2>
            <p className="text-gray-400 mb-8 pb-6 border-b border-white/10">
              Start putting together your course by creating sections, lectures and practice activities. Use your outline to structure your content and label your sections and lectures clearly.
            </p>

            <div className="space-y-6">
              {sections.map((section, sIdx) => (
                <div key={section.id} className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <div className="bg-[#1e2130] p-4 flex items-center gap-3 border-b border-white/10">
                    <span className="font-bold text-sm text-gray-400">Section {sIdx + 1}:</span>
                    <input 
                      type="text" 
                      value={section.title}
                      onChange={(e) => updateTitle(section.id, null, e.target.value)}
                      className="bg-transparent text-white font-bold text-base focus:outline-none focus:border-b focus:border-blue-500 w-full"
                    />
                  </div>

                  {/* Lectures */}
                  <div className="p-4 space-y-3">
                    {section.lectures.map((lecture, lIdx) => (
                      <div key={lecture.id} className={`border bg-[#161925] rounded-md transition-colors ${activeUpload?.lectureId === lecture.id ? 'border-blue-500/50' : 'border-white/10'}`}>
                        <div className="p-3 flex items-center gap-3 group">
                          <GripVertical size={16} className="text-gray-600 cursor-grab opacity-0 group-hover:opacity-100" />
                          <CheckCircle size={16} className={lecture.content ? "text-green-500" : "text-gray-500"} />
                          <span className="font-medium text-sm text-gray-400 whitespace-nowrap">Lecture {lIdx + 1}:</span>
                          <input 
                            type="text" 
                            value={lecture.title}
                            onChange={(e) => updateTitle(section.id, lecture.id, e.target.value)}
                            className="bg-transparent text-gray-200 text-sm focus:outline-none focus:border-b focus:border-blue-500 flex-1 min-w-0"
                          />
                          {lecture.content && (
                            <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 mr-2">
                              <span className="text-xs text-blue-400 truncate max-w-[150px]" title={lecture.content}>
                                {lecture.type === 'video' ? `🎥 ${lecture.originalName || 'Video Attached'}` : `📝 Article`}
                              </span>
                              <button 
                                onClick={() => removeContent(section.id, lecture.id)}
                                className="text-blue-400 hover:text-red-400 hover:bg-red-500/10 p-0.5 rounded transition-colors ml-1"
                                title="Remove content"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => toggleUpload(lecture.id, 'video')}
                              className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded border transition-colors ${activeUpload?.lectureId === lecture.id && activeUpload.type === 'video' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'}`}
                            >
                              <Video size={14} /> + Video
                            </button>
                            <button 
                              onClick={() => toggleUpload(lecture.id, 'article')}
                              className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded border transition-colors ${activeUpload?.lectureId === lecture.id && activeUpload.type === 'article' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'}`}
                            >
                              <FileText size={14} /> + Article
                            </button>
                            <button className="p-1.5 hover:bg-white/5 rounded text-gray-400"><ChevronDown size={16} /></button>
                          </div>
                        </div>

                        {/* Interactive Editor / Dropzone */}
                        {activeUpload?.lectureId === lecture.id && (
                          <div className="px-10 pb-4 pt-2 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2">
                            {activeUpload.type === 'video' ? (
                              <div>
                                <h4 className="text-sm font-medium text-white mb-2">Upload Video Content</h4>
                                <label className="border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 hover:border-blue-500 transition-colors cursor-pointer group relative">
                                  <input 
                                    type="file" 
                                    accept="video/mp4,video/webm" 
                                    className="hidden" 
                                    onChange={(e) => handleFileUpload(section.id, lecture.id, e)}
                                    disabled={isUploading}
                                  />
                                  {isUploading ? (
                                    <div className="flex flex-col items-center">
                                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                      <p className="text-sm font-medium text-blue-400">Uploading...</p>
                                    </div>
                                  ) : (
                                    <>
                                      <UploadCloud size={32} className="text-gray-500 group-hover:text-blue-400 mb-3 transition-colors" />
                                      <p className="text-sm font-medium text-gray-200">Click to upload your video</p>
                                      <p className="text-xs text-gray-500 mt-1">MP4 or WebM format. Max 4GB.</p>
                                    </>
                                  )}
                                </label>
                              </div>
                            ) : (
                              <div>
                                <h4 className="text-sm font-medium text-white mb-2">Write Article Content</h4>
                                <textarea 
                                  rows={5}
                                  placeholder="Type your article content here..."
                                  className="w-full bg-[#1e2130] border border-gray-600 rounded-lg p-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-y"
                                ></textarea>
                                <div className="flex justify-end mt-2">
                                  <button 
                                    onClick={() => handleSaveArticle(section.id, lecture.id, "content")}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
                                  >
                                    Save Article
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => addLecture(section.id)}
                      className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium ml-8"
                    >
                      <Plus size={16} /> Add Lecture
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={addSection}
              className="mt-8 flex items-center gap-2 px-4 py-2 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold rounded-lg transition-colors"
            >
              <Plus size={18} /> Add Section
            </button>
          </div>
        )}

        {activeTab !== 'curriculum' && (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>This section is under development. Please use the Curriculum tab to upload videos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
