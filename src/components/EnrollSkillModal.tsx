'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Zap, Target, Layers, Check, 
  Atom, Activity, Palette, Home, Brain, Tag, Compass, Clock, Award, AlertCircle 
} from 'lucide-react';
import { SkillTrack, DomainCategory } from '@/types';

export interface EnrollSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll?: (newTrack: SkillTrack) => void;
  initialTitle?: string;
  initialDomain?: string;
  initialSubGenre?: string;
  restrictToDomain?: DomainCategory; // e.g. for Sports hub
  excludeSports?: boolean; // When in Skills section, sports are excluded
}

const DOMAINS: Array<{
  id: DomainCategory;
  label: string;
  icon: any;
  description: string;
  placeholder: string;
  gradient: string;
}> = [
  {
    id: 'Science',
    label: 'Science',
    icon: Atom,
    description: 'Physics, Chemistry, Molecular Biology, Advanced Calculus',
    placeholder: 'e.g., Rotational Dynamics, Quantum Mechanics, Organic Synthesis',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'Athletics',
    label: 'Athletics & Sports',
    icon: Activity,
    description: 'Sprint Bio-Kinetics, Football Tactics, Cricket Drills, Conditioning',
    placeholder: 'e.g., Football Dribbling, Fast Bowling, Sprint Acceleration',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'Art',
    label: 'Art & Design',
    icon: Palette,
    description: 'Digital Illustration, Design Systems, Animation, Color Theory',
    placeholder: 'e.g., Dynamic Figure Drawing, Vector Design Systems, 3D UV Mapping',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'Homemaking',
    label: 'Homemaking & Life Skills',
    icon: Home,
    description: 'Culinary Science, Nutrition Engineering, Spatial Organization, Budgeting',
    placeholder: 'e.g., Macronutrient Optimization, Culinary Thermodynamics',
    gradient: 'from-rose-500 to-amber-600',
  },
  {
    id: 'Cognitive Logic',
    label: 'Cognitive Logic & Tech',
    icon: Brain,
    description: 'Algorithms, Critical Reasoning, Web Dev, System Architecture',
    placeholder: 'e.g., Distributed System Consensus, Next.js Full Stack, Graph Traversal',
    gradient: 'from-blue-500 to-indigo-600',
  },
];

const MASTERY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional Mastery',
] as const;

const EXPERIENCE_LEVELS = [
  'Absolute Beginner',
  'Some Foundational Knowledge',
  'Intermediate Practitioner',
  'Experienced / Advanced',
] as const;

export const EnrollSkillModal: React.FC<EnrollSkillModalProps> = ({
  isOpen,
  onClose,
  onEnroll,
  initialTitle = '',
  initialDomain = '',
  initialSubGenre = '',
  restrictToDomain,
  excludeSports = true,
}) => {
  const router = useRouter();

  const availableDomains = useMemo(() => {
    if (restrictToDomain) {
      return DOMAINS.filter((d) => d.id === restrictToDomain);
    }
    // Cognitive/general modal excludes Athletics (which has its own dedicated Sports Hub)
    return DOMAINS.filter((d) => d.id !== 'Athletics');
  }, [restrictToDomain]);

  const [selectedDomainId, setSelectedDomainId] = useState<DomainCategory>(
    restrictToDomain || (availableDomains[0]?.id as DomainCategory) || 'Science'
  );
  const [customTitle, setCustomTitle] = useState<string>('');
  const [subGenre, setSubGenre] = useState<string>('');
  const [masteryLevel, setMasteryLevel] = useState<string>('Intermediate');
  const [dailyHours, setDailyHours] = useState<number>(1);
  const [dailyMinutes, setDailyMinutes] = useState<number>(30);
  const [experienceLevel, setExperienceLevel] = useState<string>('Some Foundational Knowledge');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (restrictToDomain) {
      setSelectedDomainId(restrictToDomain);
    } else if (initialDomain && availableDomains.some((d) => d.id === initialDomain)) {
      setSelectedDomainId(initialDomain as DomainCategory);
    } else if (availableDomains.length > 0 && !availableDomains.some((d) => d.id === selectedDomainId)) {
      setSelectedDomainId(availableDomains[0].id as DomainCategory);
    }
    if (initialTitle) setCustomTitle(initialTitle);
    if (initialSubGenre) setSubGenre(initialSubGenre);
  }, [initialTitle, initialDomain, initialSubGenre, isOpen, restrictToDomain, availableDomains]);

  const [subgenreSuggestions, setSubgenreSuggestions] = useState<string[]>([]);
  const [isLoadingSubgenres, setIsLoadingSubgenres] = useState<boolean>(false);
  const [subgenreError, setSubgenreError] = useState<string | null>(null);

  // Dynamic Sub-Genre Engine: Debounce 600ms, min 3 chars, AbortController
  useEffect(() => {
    const trimmed = customTitle.trim();
    if (trimmed.length < 3) {
      setSubgenreSuggestions([]);
      setIsLoadingSubgenres(false);
      setSubgenreError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoadingSubgenres(true);
    setSubgenreError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/skills/suggest-subgenres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skill: trimmed, domain: selectedDomainId }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Could not load suggestions');
        const data = await res.json();
        setSubgenreSuggestions(Array.isArray(data.subgenres) ? data.subgenres : []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setSubgenreSuggestions([]);
          setSubgenreError('Unable to fetch suggestions. Please type your sub-genre below.');
        }
      } finally {
        setIsLoadingSubgenres(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [customTitle, selectedDomainId]);

  // Strict Validation Check (1.1: domain chosen, skill >= 3, sub-genre >= 3, level chosen, time 15m-16h, experience chosen)
  const validationStatus = useMemo(() => {
    if (!selectedDomainId) {
      return { valid: false, field: 'Core Domain', message: 'Please select a core learning domain.' };
    }
    if (!customTitle.trim() || customTitle.trim().length < 3) {
      return { valid: false, field: 'Skill Name', message: 'Skill name must be at least 3 characters.' };
    }
    if (!subGenre.trim() || subGenre.trim().length < 3) {
      return { valid: false, field: 'Target Sub-Genre', message: 'Sub-genre must be at least 3 characters.' };
    }
    if (!masteryLevel) {
      return { valid: false, field: 'Desired Mastery Level', message: 'Please choose a desired mastery level.' };
    }
    const totalMins = dailyHours * 60 + dailyMinutes;
    if (totalMins < 15 || totalMins > 960) {
      return { valid: false, field: 'Daily Commitment Time', message: 'Daily learning time must be between 15 minutes and 16 hours.' };
    }
    if (!experienceLevel) {
      return { valid: false, field: 'Current Experience Level', message: 'Please select your current experience level.' };
    }
    return { valid: true, field: null, message: null };
  }, [selectedDomainId, customTitle, subGenre, masteryLevel, dailyHours, dailyMinutes, experienceLevel]);

  if (!isOpen) return null;

  const currentDomain = DOMAINS.find((d) => d.id === selectedDomainId) || DOMAINS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!validationStatus.valid) {
      setValidationError(validationStatus.message || 'Please complete all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const activeProfileId = localStorage.getItem('skillprax_active_profile_id') || 'default-profile';
      const totalDailyMinutes = dailyHours * 60 + dailyMinutes;

      // Submit sends ALL six values
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfileId,
          title: customTitle.trim(),
          skill: customTitle.trim(),
          domain: selectedDomainId,
          subGenre: subGenre.trim(),
          desiredMastery: masteryLevel,
          desiredLevel: masteryLevel,
          targetGoal: `${masteryLevel} in ${subGenre.trim()}`,
          dailyHours: `${dailyHours}h ${dailyMinutes}m`,
          dailyMinutes: totalDailyMinutes,
          experienceLevel,
          currentExperience: experienceLevel,
          level: masteryLevel.toLowerCase(),
          section: selectedDomainId === 'Athletics' || restrictToDomain === 'Athletics' ? 'SPORTS' : 'SKILLS',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Skill roadmap generation failed. Check server connection.');
      }

      const data = await res.json();
      const workspaceId = data.workspace?.id || data.id;

      if (onEnroll && data.workspace) {
        onEnroll(data.workspace);
      }

      onClose();
      if (selectedDomainId === 'Athletics' || restrictToDomain === 'Athletics') {
        router.push(`/sports/workspace/${workspaceId}`);
      } else {
        router.push(`/workspace/${workspaceId}`);
      }
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'Roadmap generation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-8"
        >
          {/* Header Bar */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-heading font-extrabold tracking-tight">
                  {restrictToDomain === 'Athletics' ? '⚡ Generate Sport Practice Regimen' : '⚡ Generate Mastery Trajectory'}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-300">
                    SKILL-TRACK Context-Aware Curriculum Generator
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    3–8 Milestones
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Inline Validation Alert */}
            {!validationStatus.valid && customTitle.trim().length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Please define your <strong>{validationStatus.field}</strong> to construct your personalized curriculum.</span>
              </div>
            )}

            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Step 1: Select Domain (if not restricted) */}
            {!restrictToDomain && (
              <div className="space-y-3">
                <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>1. Core Human Domain *</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableDomains.map((dom) => {
                    const IconComp = dom.icon;
                    const isSelected = selectedDomainId === dom.id;

                    return (
                      <div
                        key={dom.id}
                        onClick={() => setSelectedDomainId(dom.id)}
                        className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-400/30'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${dom.gradient} text-white flex items-center justify-center shrink-0`}>
                          <IconComp className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-heading font-bold text-slate-900 truncate">
                              {dom.label}
                            </h4>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {dom.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Skill Title */}
            <div className="space-y-2">
              <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-sky-600" />
                <span>2. Selected Skill Name (Mandatory) *</span>
              </label>

              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={currentDomain.placeholder}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs md:text-sm font-medium text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Step 3: Dynamic Sub-Genre Selection & Contextual Pills */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>3. Target Sub-Genre Specialization (Mandatory) *</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-400">
                  Pick a suggestion chip or type freely
                </span>
              </div>

              {/* Dynamic suggestion chips */}
              {isLoadingSubgenres && (
                <div className="flex flex-wrap gap-1.5 animate-pulse">
                  <div className="h-6 w-24 bg-slate-200 rounded-full" />
                  <div className="h-6 w-32 bg-slate-200 rounded-full" />
                  <div className="h-6 w-28 bg-slate-200 rounded-full" />
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                </div>
              )}

              {!isLoadingSubgenres && subgenreSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {subgenreSuggestions.map((pill) => {
                    const isPillActive = subGenre.toLowerCase() === pill.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={pill}
                        onClick={() => setSubGenre(isPillActive ? '' : pill)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isPillActive
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                        }`}
                      >
                        {pill}
                      </button>
                    );
                  })}
                </div>
              )}

              {subgenreError && (
                <p className="text-[11px] text-amber-600 font-medium">
                  {subgenreError}
                </p>
              )}

              <input
                type="text"
                value={subGenre}
                onChange={(e) => setSubGenre(e.target.value)}
                placeholder="e.g. Fast Bowling, Next.js Server Components, Organic Reaction Mechanisms"
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-xs font-medium text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Step 4: Desired Mastery Level (Mandatory Segmented Buttons) */}
            <div className="space-y-2">
              <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>4. Desired Mastery Level (Mandatory) *</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MASTERY_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setMasteryLevel(lvl)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      masteryLevel === lvl
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Daily Commitment Time & Experience Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>5. Daily Learning Hours *</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={dailyHours}
                      onChange={(e) => setDailyHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full text-xs font-bold text-slate-800 bg-transparent text-center focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 font-semibold">hrs</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                    <input
                      type="number"
                      min="0"
                      max="55"
                      step="5"
                      value={dailyMinutes}
                      onChange={(e) => setDailyMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full text-xs font-bold text-slate-800 bg-transparent text-center focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 font-semibold">mins</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-purple-600" />
                  <span>6. Current Experience Level *</span>
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {EXPERIENCE_LEVELS.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting || !validationStatus.valid}
              className={`w-full py-4 text-white rounded-2xl font-heading font-bold text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                validationStatus.valid && !isSubmitting
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/25 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {selectedDomainId === 'Athletics' || restrictToDomain === 'Athletics'
                      ? 'Generating Sport Regimen (<2s)...'
                      : 'Synthesizing Context-Aware Mastery Trajectory...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {selectedDomainId === 'Athletics' || restrictToDomain === 'Athletics'
                      ? '⚡ Generate Sport Regimen ➔'
                      : 'Generate Mastery Trajectory ➔'}
                  </span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default EnrollSkillModal;
