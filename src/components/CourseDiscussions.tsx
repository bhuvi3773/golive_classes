"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, User, Reply, ChevronDown, ChevronUp } from "lucide-react";

export default function CourseDiscussions({ courseId, lectureId, currentUser }: { courseId: string, lectureId: number, currentUser: any }) {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [courseId, lectureId]);

  const fetchDiscussions = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/discussions?lectureId=${lectureId}`);
      const data = await res.json();
      if (Array.isArray(data)) setDiscussions(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;
    setIsPosting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId, title: newTitle, text: newText })
      });
      if (res.ok) {
        setNewTitle("");
        setNewText("");
        fetchDiscussions();
      }
    } catch (err) {
      console.error(err);
    }
    setIsPosting(false);
  };

  const handleReply = async (discussionId: string) => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply', discussionId, text: replyText })
      });
      if (res.ok) {
        setReplyText("");
        fetchDiscussions();
      }
    } catch (err) {
      console.error(err);
    }
    setIsReplying(false);
  };

  if (loading) return <div className="p-6 text-slate-500">Loading discussions...</div>;

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <MessageCircle size={20} className="text-emerald-600" />
        Q&A / Discussions
      </h3>

      {/* New Question Form */}
      <form onSubmit={handlePost} className="mb-8 bg-slate-50 border border-slate-200 p-4 rounded-xl">
        <h4 className="font-bold text-slate-900 mb-3">Ask a new question</h4>
        <input 
          type="text"
          placeholder="Title (e.g. Need help with Docker installation)"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-emerald-500"
          required
        />
        <textarea
          placeholder="Describe your question in detail..."
          value={newText}
          onChange={e => setNewText(e.target.value)}
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-emerald-500"
          required
        ></textarea>
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isPosting}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {isPosting ? "Posting..." : <><Send size={16} /> Post Question</>}
          </button>
        </div>
      </form>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-white border border-slate-200 rounded-xl">
            No questions asked yet for this lecture. Be the first!
          </div>
        ) : (
          discussions.map(discussion => (
            <div key={discussion._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all shadow-sm">
              <div 
                className="p-4 cursor-pointer hover:bg-slate-50 flex items-start gap-4"
                onClick={() => setExpandedId(expandedId === discussion._id ? null : discussion._id)}
              >
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                  {discussion.userId?.avatar ? (
                    <img src={discussion.userId.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">{discussion.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{discussion.userId?.name || 'Anonymous'}</span>
                    {discussion.userId?.role === 'admin' || discussion.userId?.role === 'superadmin' ? (
                      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">INSTRUCTOR</span>
                    ) : null}
                    <span>• {new Date(discussion.createdAt).toLocaleDateString()}</span>
                    <span>• {discussion.replies?.length || 0} replies</span>
                  </div>
                </div>
                <div className="shrink-0 text-slate-400">
                  {expandedId === discussion._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedId === discussion._id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                  <p className="text-slate-700 text-sm mb-6 whitespace-pre-wrap">{discussion.text}</p>
                  
                  {/* Replies */}
                  <div className="space-y-4 ml-6 pl-4 border-l-2 border-slate-200 mb-6">
                    {discussion.replies?.map((reply: any, rIdx: number) => (
                      <div key={rIdx} className="flex gap-3">
                        <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                          {reply.userId?.avatar ? (
                            <img src={reply.userId.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User size={14} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-xs mb-1">
                            <span className="font-bold text-slate-900">{reply.userId?.name || 'Anonymous'}</span>
                            {reply.userId?.role === 'admin' || reply.userId?.role === 'superadmin' ? (
                              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">INSTRUCTOR</span>
                            ) : null}
                            <span className="text-slate-400">• {new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-700 text-sm">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <div className="flex gap-3 ml-6 pl-4 border-l-2 border-slate-200">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                      {currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <User size={14} />}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add a reply..." 
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleReply(discussion._id);
                        }}
                      />
                      <button 
                        disabled={isReplying}
                        onClick={() => handleReply(discussion._id)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
