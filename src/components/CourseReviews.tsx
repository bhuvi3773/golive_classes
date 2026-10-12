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

  if (loading) return <div className="text-slate-500 py-4">Loading reviews...</div>;

  return (
    <div className="glass-card p-8 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Student Reviews</h2>
      
      {/* Review Form */}
      {isPurchased ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-slate-900/50 p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Leave a Review</h3>
          {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-4">{error}</div>}
          {success && <div className="bg-teal-500/10 text-teal-400 p-3 rounded-lg text-sm mb-4">Thank you for your review!</div>}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star size={24} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-700"} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Comment</label>
            <textarea 
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-200 placeholder:text-slate-500"
              placeholder="What did you think of this course?"
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={submitting}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : <><Send size={16} /> Submit Review</>}
          </button>
        </form>
      ) : (
        <div className="mb-10 bg-slate-900/50 p-6 rounded-2xl border border-white/10 text-center">
          <p className="text-slate-400">You must purchase this course to leave a review.</p>
        </div>
      )}
      
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No reviews yet. Be the first to review this course!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                  {review.userId?.avatar ? (
                    <img src={review.userId.avatar} alt={review.userId?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-teal-300 font-bold text-lg">{review.userId?.name?.charAt(0) || 'A'}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white">{review.userId?.name || 'Anonymous User'}</h4>
                    <span className="text-xs text-slate-400">• {new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-700"} />
                    ))}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
