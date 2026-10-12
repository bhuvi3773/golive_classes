"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Send } from "lucide-react";

export default function CourseReviews({ courseId, isPurchased }: { courseId: string, isPurchased: boolean }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPurchased) return;
    
    setSubmitting(true);
    setError("");
    setSuccess(false);
    
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setComment("");
        setRating(5);
        fetchReviews(); // Refresh list
      } else {
        setError(data.error || "Failed to submit review");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-[#72857C] py-4 text-sm">Loading academic reviews...</div>;

  return (
    <div className="bg-[#FFFFFF] border border-[#E9DFCC] rounded-2xl p-8 mt-8 shadow-sm">
      <h2 className="text-2xl font-bold text-[#1B2E26] mb-6">Student Peer Reviews</h2>
      
      {/* Review Form */}
      {isPurchased ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-[#FDFCF9] p-6 rounded-xl border border-[#E9DFCC]">
          <h3 className="text-base font-bold text-[#1B2E26] mb-4">Submit Course Evaluation</h3>
          {error && <div className="bg-red-500/10 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-500/20">{error}</div>}
          {success && <div className="bg-[#DCE6D8] text-[#24483C] p-3 rounded-lg text-sm mb-4 border border-[#BED1B7]">Thank you for your feedback!</div>}
          
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5E54] mb-2">Rating</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star size={22} className={star <= rating ? "fill-[#C96F4A] text-[#C96F4A]" : "text-[#D8CCB5]"} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5E54] mb-2">Review Summary</label>
            <textarea 
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E9DFCC] rounded-lg px-4 py-3 focus:outline-none focus:border-[#24483C] text-[#1B2E26] placeholder:text-[#72857C] text-sm"
              placeholder="Reflect on lecture clarity, assignments, and curriculum pacing..."
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={submitting}
            className="flex items-center gap-2 bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            {submitting ? "Submitting..." : <><Send size={15} /> Publish Review</>}
          </button>
        </form>
      ) : (
        <div className="mb-10 bg-[#F4EFE6] p-5 rounded-xl border border-[#E9DFCC] text-center">
          <p className="text-[#4A5E54] text-sm">Enrollment in this course is required to submit a peer evaluation.</p>
        </div>
      )}
      
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-[#72857C] text-center py-6 text-sm">No evaluations submitted yet. Be the first to share your learning experience!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-[#E9DFCC] pb-6 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#EEF3EC] text-[#24483C] rounded-full flex items-center justify-center shrink-0 overflow-hidden font-bold border border-[#DCE6D8]">
                  {review.userId?.avatar ? (
                    <img src={review.userId.avatar} alt={review.userId?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{review.userId?.name?.charAt(0) || 'A'}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#1B2E26] text-sm">{review.userId?.name || 'Anonymous Learner'}</h4>
                    <span className="text-xs text-[#72857C]">• {new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={13} className={star <= review.rating ? "fill-[#C96F4A] text-[#C96F4A]" : "text-[#D8CCB5]"} />
                    ))}
                  </div>
                  <p className="text-[#4A5E54] leading-relaxed text-sm">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
