'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, Trash2, Send, CheckCircle2, AlertCircle, 
  MessageSquare, Sparkles, RefreshCw, Edit3 
} from 'lucide-react';

export interface UserReviewItem {
  id: string;
  rating: number;
  comment?: string;
  reviewText?: string;
  skillTag?: string;
  createdAt: string;
  userName?: string;
}

export interface ProfileReviewsProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  enrolledSkills?: Array<{ id: string; title: string; subGenre?: string }>;
}

export function ProfileReviews({
  userId,
  userName,
  userAvatar,
  enrolledSkills = [],
}: ProfileReviewsProps) {
  const [reviews, setReviews] = useState<UserReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedSkillTag, setSelectedSkillTag] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Load reviews on mount
  useEffect(() => {
    if (userId) {
      loadUserReviews();
    }
  }, [userId]);

  // Set default skill tag if skills exist
  useEffect(() => {
    if (enrolledSkills.length > 0 && !selectedSkillTag) {
      setSelectedSkillTag(enrolledSkills[0].title);
    }
  }, [enrolledSkills]);

  const loadUserReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load user reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewText.trim().length < 10) {
      setFeedbackNotice({
        type: 'error',
        message: 'Review must be at least 10 characters long.',
      });
      return;
    }

    try {
      setSubmitting(true);
      setFeedbackNotice(null);

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          profileId: userId,
          userName: userName || 'Learner',
          userAvatar: userAvatar || '',
          rating,
          comment: reviewText.trim(),
          reviewText: reviewText.trim(),
          skillTag: selectedSkillTag || 'General Track',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit review.');
      }

      setFeedbackNotice({
        type: 'success',
        message: 'Your verified review has been published to the Community Wall of Love!',
      });
      setReviewText('');
      await loadUserReviews();
    } catch (err: any) {
      setFeedbackNotice({
        type: 'error',
        message: err.message || 'Submission failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to remove this review?')) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert('Failed to delete review.');
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 pt-4">
      {/* Review Submission Form Card */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md">
              COMMUNITY REPUTATION
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Verified Learner Peer Evaluations
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Your Feedback & Reviews
          </h3>
          <p className="text-xs text-slate-500">
            Share your authentic learning experience. Verified reviews are published directly to the public landing page.
          </p>
        </div>

        {feedbackNotice && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
              feedbackNotice.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 5-Star Interactive Rating Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Overall Experience Rating (1 - 5 Stars)
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 transition-all ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-black text-amber-600 ml-2 font-mono">
                {rating} of 5 Stars
              </span>
            </div>
          </div>

          {/* Skill Tag Dropdown */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Enrolled Skill or Sport Track
            </label>
            {enrolledSkills.length > 0 ? (
              <select
                value={selectedSkillTag}
                onChange={(e) => setSelectedSkillTag(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {enrolledSkills.map((s) => (
                  <option key={s.id} value={s.title}>
                    {s.title} {s.subGenre ? `(${s.subGenre})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="e.g. Python Programming, Cricket Fast Bowling, UI/UX"
                value={selectedSkillTag}
                onChange={(e) => setSelectedSkillTag(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            )}
          </div>

          {/* Review Textarea */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Review & Feedback Details (Minimum 10 Characters)
            </label>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Describe your progress, milestone breakthroughs, and how the pedagogical steps aided your mastery..."
              className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>{reviewText.trim().length} characters (10 minimum)</span>
              {reviewText.trim().length >= 10 && (
                <span className="text-emerald-600 font-bold">✓ Valid length</span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || reviewText.trim().length < 10}
            className="px-6 py-2.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing Review...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Verified Review</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Your Submitted Reviews Sub-List */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-black text-slate-900">
              Your Submitted Reviews
            </h4>
            <p className="text-xs text-slate-400">
              Manage your authored testimonials.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-300" />
            Loading your reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-500">No reviews authored yet.</p>
            <p className="text-[11px] text-slate-400">
              Submit your first review above to share your progress with the community!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md">
                      {rev.skillTag || 'Skill Track'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      disabled={deletingId === rev.id}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                  "{rev.comment || rev.reviewText}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileReviews;
