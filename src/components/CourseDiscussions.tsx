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

  if (loading) return <div className="p-6 text-[#556960] text-sm">Loading academic discussions...</div>;

  return (
    <div className="p-6 text-[#1B2E26]">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} className="text-[#24483C]" />
        <h3 className="font-serif text-xl font-bold text-[#1B2E26]">
          Lecture Colloquium
        </h3>
      </div>

      {/* New Question Form */}
      <form onSubmit={handlePost} className="mb-8 bg-[#F8F4EC] border border-[#E9DFCC] p-5 rounded-xl shadow-sm">
        <h4 className="font-serif text-sm font-bold text-[#1B2E26] mb-3">Initiate a Query or Discussion</h4>
        <input 
          type="text"
          placeholder="Topic (e.g. Inquiring regarding asymptotic complexity)"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="w-full bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl px-3.5 py-2.5 text-xs mb-3 focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/60"
          required
        />
        <textarea
          placeholder="Articulate your question or observation with context..."
          value={newText}
          onChange={e => setNewText(e.target.value)}
          rows={3}
          className="w-full bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl px-3.5 py-2.5 text-xs mb-3 focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#556960]/60 resize-none"
          required
        ></textarea>
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isPosting}
            className="bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isPosting ? "Posting Query..." : <><Send size={14} /> Submit Query</>}
          </button>
        </div>
      </form>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-8 text-[#556960] bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl text-sm">
            No queries presented for this lecture yet. Be the first scholar to inquire!
          </div>
        ) : (
          discussions.map(discussion => (
            <div key={discussion.id} className="bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl overflow-hidden transition-all shadow-sm">
              <div 
                className="p-4 cursor-pointer hover:bg-[#F8F4EC] flex items-start gap-4 transition-colors"
                onClick={() => setExpandedId(expandedId === discussion.id ? null : discussion.id)}
              >
                <div className="w-10 h-10 bg-[#DCE6D8] text-[#24483C] rounded-xl flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                  {discussion.userId?.avatar ? (
                    <img src={discussion.userId.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-sm text-[#1B2E26] mb-1">{discussion.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#556960]">
                    <span className="font-semibold text-[#1B2E26]">{discussion.userId?.name || 'Anonymous Scholar'}</span>
                    {discussion.userId?.role === 'admin' || discussion.userId?.role === 'superadmin' ? (
                      <span className="bg-[#24483C] text-[#F8F4EC] px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">FACULTY</span>
                    ) : null}
                    <span>• {new Date(discussion.createdAt).toLocaleDateString()}</span>
                    <span>• {discussion.replies?.length || 0} replies</span>
                  </div>
                </div>
                <div className="shrink-0 text-[#556960]">
                  {expandedId === discussion.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {expandedId === discussion.id && (
                <div className="border-t border-[#E9DFCC] p-4 bg-[#F8F4EC]">
                  <p className="text-[#1B2E26] text-xs mb-5 whitespace-pre-wrap leading-relaxed">{discussion.text}</p>
                  
                  {/* Replies */}
                  <div className="space-y-3 ml-4 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-[#E9DFCC] mb-5">
                    {discussion.replies?.map((reply: any, rIdx: number) => (
                      <div key={rIdx} className="flex gap-3">
                        <div className="w-7 h-7 bg-[#E9DFCC] text-[#24483C] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {reply.userId?.avatar ? (
                            <img src={reply.userId.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User size={13} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] mb-0.5">
                            <span className="font-bold text-[#1B2E26]">{reply.userId?.name || 'Scholar'}</span>
                            {reply.userId?.role === 'admin' || reply.userId?.role === 'superadmin' ? (
                              <span className="bg-[#24483C] text-[#F8F4EC] px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">FACULTY</span>
                            ) : null}
                            <span className="text-[#556960]">• {new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[#1B2E26] text-xs leading-relaxed">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <div className="flex gap-3 ml-4 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-[#E9DFCC]">
                    <div className="w-7 h-7 bg-[#DCE6D8] text-[#24483C] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <User size={13} />}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Contribute a reply..." 
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        className="flex-1 bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#24483C] text-[#1B2E26]"
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleReply(discussion.id);
                        }}
                      />
                      <button 
                        disabled={isReplying}
                        onClick={() => handleReply(discussion.id)}
                        className="bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
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
