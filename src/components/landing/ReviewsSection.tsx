'use client';

import React from 'react';
import { Star, ShieldCheck, MessageSquare } from 'lucide-react';
import { Review } from '@/types';

export interface ReviewsSectionProps {
  reviews: Review[];
  loading?: boolean;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  loading = false,
}) => {
  return (
    <section className="relative z-10 max-w-7xl mx-auto w-full pt-6 pb-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
          COMMUNITY FEEDBACK & SOCIAL PROOF
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mt-2">
          Wall of Love & Verified Mastery Reviews
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Read authentic experiences from learners who mastered technical skills and athletic drills on SKILL-TRACK.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading community feedback...</p>
        </div>
      ) : reviews.length === 0 ? (
        /* Authentic Empty-State UI Rendering */
        <div className="p-12 sm:p-16 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300 mb-1">
            <MessageSquare className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            Community Reviews
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            No learner reviews submitted yet.
          </p>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Be the first to complete a skill milestone or sports drill and share your verified experience.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white font-bold text-sm flex items-center justify-center overflow-hidden border border-emerald-300">
                    {rev.avatarUrl ? (
                      <img
                        src={rev.avatarUrl}
                        alt={rev.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{rev.userName ? rev.userName.slice(0, 2).toUpperCase() : 'LR'}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{rev.userName}</span>
                      {rev.isVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/60">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Skill: <strong className="text-slate-600">{rev.skillTag || 'General Track'}</strong>
                    </span>
                  </div>
                </div>

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
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{rev.reviewText}"
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
