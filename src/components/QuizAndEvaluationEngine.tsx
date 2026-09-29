import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, BookOpen, 
  Video, ArrowRight, RotateCcw, ShieldCheck, ExternalLink, Target, Flame, XCircle, Shield
} from 'lucide-react';

interface ACU {
  id: string;
  title: string;
  description: string;
}

interface Question {
  id: string;
  prompt: string;
  options: {
    id: string;
    text: string;
  }[];
  acuId?: string;
}

interface WeakAreaDiagnosis {
  topic: string;
  misconceptionAnalysis: string;
  coreConcept: string;
  resources: {
    docTitle: string;
    docUrl: string;
    videoTitle: string;
    videoUrl: string;
    criticalTakeaway: string;
  };
}

interface DiagnosticPrescription {
  overallDiagnosis: string;
  weakAreas: WeakAreaDiagnosis[];
}

interface QuizAndEvaluationEngineProps {
  stepId: string;
  stepIndex: number;
  stepTitle: string;
  acus: ACU[];
  onStepPassed: (score: number, passPayload?: any) => void;
  onRemediationStateChange?: (isRemediation: boolean) => void;
}

type EngineState = 
  | 'STANDBY_UNGENERATED'
  | 'GENERATING_QUIZ'
  | 'ACTIVE_EVALUATION'
  | 'SUBMITTING'
  | 'PASSED_VIEW'
  | 'TARGETED_REMEDIATION';

export const QuizAndEvaluationEngine: React.FC<QuizAndEvaluationEngineProps> = ({
  stepId,
  stepIndex,
  stepTitle,
  acus,
  onStepPassed,
  onRemediationStateChange,
}) => {
  const [engineState, setEngineState] = useState<EngineState>('STANDBY_UNGENERATED');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [lastScore, setLastScore] = useState<number>(0);
  const [prescription, setPrescription] = useState<DiagnosticPrescription | null>(null);
  const [reviewedResources, setReviewedResources] = useState<Record<string, boolean>>({});
  const [isRetestMode, setIsRetestMode] = useState<boolean>(false);

  // Cleanly reset engine when user selects or advances to another step
  React.useEffect(() => {
    setEngineState('STANDBY_UNGENERATED');
    setQuestions([]);
    setSelectedAnswers({});
    setLastScore(0);
    setPrescription(null);
    setReviewedResources({});
    setIsRetestMode(false);
    if (onRemediationStateChange) onRemediationStateChange(false);
  }, [stepId]);

  // Fisher-Yates Shuffle algorithm
  const shuffleOptions = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // 1. Lazy Generate Socratic Evaluation (Token-Saver)
  const handleGenerateEvaluation = async (retest: boolean = false) => {
    setEngineState('GENERATING_QUIZ');
    try {
      let res = await fetch(`/api/steps/${stepId}/level-up-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retestMode: retest,
          priorityAcus: retest && prescription ? prescription.weakAreas.map(w => w.topic) : [],
        }),
      });

      if (!res.ok) {
        res = await fetch(`/api/steps/${stepId}/prompt-quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            retestMode: retest,
            focusAcus: retest && prescription ? prescription.weakAreas.map(w => w.topic) : [],
          }),
        });
      }

      if (!res.ok) throw new Error('Evaluation generation failed');
      const data = await res.json();

      // Apply Fisher-Yates shuffling on options
      const formattedQuestions: Question[] = (data.questions || []).map((q: any) => ({
        id: q.id,
        prompt: q.prompt || q.scenario || q.question || 'Scenario Evaluation',
        options: shuffleOptions(q.options || []),
        acuId: q.acuId,
      }));

      setQuestions(formattedQuestions);
      setSelectedAnswers({});
      setIsRetestMode(retest);
      setEngineState('ACTIVE_EVALUATION');
      onRemediationStateChange?.(false);
    } catch (err) {
      console.error(err);
      setEngineState('STANDBY_UNGENERATED');
    }
  };

  // 2. Submit Socratic Evaluation
  const handleSubmitEvaluation = async () => {
    setEngineState('SUBMITTING');
    try {
      const payload = {
        answers: Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      };

      const res = await fetch(`/api/steps/${stepId}/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Evaluation submission failed');
      const data = await res.json();
      const score = data.scorePercentage ?? data.score ?? 0;
      setLastScore(score);

      if (data.passed) {
        setEngineState('PASSED_VIEW');
        onRemediationStateChange?.(false);
        onStepPassed(score, data);
      } else {
        setPrescription(data.diagnosticPrescription || null);
        setReviewedResources({});
        setEngineState('TARGETED_REMEDIATION');
        onRemediationStateChange?.(true);
      }
    } catch (err) {
      console.error(err);
      setEngineState('ACTIVE_EVALUATION');
    }
  };

  // 3. Track remediation resource reviews
  const markResourceReviewed = (key: string, url: string) => {
    setReviewedResources(prev => ({ ...prev, [key]: true }));
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const allPrescribedResourcesReviewed = (): boolean => {
    if (!prescription || !prescription.weakAreas) return true;
    for (let i = 0; i < prescription.weakAreas.length; i++) {
      if (!reviewedResources[`doc_${i}`] || !reviewedResources[`video_${i}`]) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="w-full transition-all duration-300">
      {/* --- STATE 1: STANDBY UNGENERATED (LAUNCHPAD) --- */}
      {engineState === 'STANDBY_UNGENERATED' && (
        <div className="view-transition-enter p-8 md:p-10 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-xl shadow-emerald-950/5 text-center relative overflow-hidden wobble-card">
          {/* Ambient Auroral Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 via-sky-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            {/* Target Beacon Icon */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/25">
                <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-emerald-600">
                  <Target className="w-10 h-10 animate-pulse" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Socratic Milestone Gate {stepIndex}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                {stepTitle} Evaluation Gate
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
                Evaluates your mastery across {acus.length || 'core'} targeted competency units with scenario-based challenges. Passing threshold is 80%.
              </p>
            </div>

            {/* Metric Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                  {acus.length ? Math.min(Math.max(acus.length, 3), 6) : '3-6'}
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-slate-900">ACU Items</div>
                  <div className="text-[11px] text-slate-500">Fisher-Yates shuffled</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                  80%
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-slate-900">Passing Threshold</div>
                  <div className="text-[11px] text-slate-500">Unlocks next step</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-slate-900">Misconceptions</div>
                  <div className="text-[11px] text-slate-500">In-place debunks</div>
                </div>
              </div>
            </div>

            {/* Hero Conic Beam Button */}
            <div className="pt-3">
              <div className="relative p-[2px] rounded-2xl conic-beam shadow-xl shadow-emerald-500/20 inline-block">
                <button
                  onClick={() => handleGenerateEvaluation(false)}
                  className="relative z-10 px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-extrabold text-sm sm:text-base rounded-xl btn-shimmer flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
                >
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>⚡ Generate Socratic Evaluation</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STATE 2: LOADING SKELETON --- */}
      {engineState === 'GENERATING_QUIZ' && (
        <div className="view-transition-enter p-12 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-xl text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <h4 className="text-base font-heading font-bold text-slate-900">
            Synthesizing Scenario Evaluation...
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Balancing equal-length options and mapping distractors to tested competencies.
          </p>
        </div>
      )}

      {/* --- STATE 3: ACTIVE EVALUATION --- */}
      {engineState === 'ACTIVE_EVALUATION' && (
        <div className="view-transition-enter space-y-6">
          {/* Progress Strip */}
          <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200">
                {isRetestMode ? 'Adaptive Retest Active' : `Evaluation • Milestone ${stepIndex}`}
              </span>
              <h4 className="text-base font-heading font-bold text-slate-900 mt-1">{stepTitle}</h4>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                {Object.keys(selectedAnswers).length} of {questions.length} Answered
              </span>
            </div>
          </div>

          {/* Questions Container */}
          <div className="space-y-5">
            {questions.map((q, qIndex) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;

              return (
                <div key={q.id} className="p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm space-y-4 wobble-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      Question {qIndex + 1} of {questions.length}
                    </span>
                    {isAnswered ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Response Selected
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pending Response
                      </span>
                    )}
                  </div>

                  <p className="text-base font-heading font-semibold text-slate-900 leading-snug">
                    {q.prompt}
                  </p>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = selectedAnswers[q.id] === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                          className={`p-4 rounded-xl border text-xs cursor-pointer transition-all duration-200 flex items-start gap-3.5 select-none ${
                            isSelected 
                              ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 font-medium ring-2 ring-emerald-400/30 shadow-xs scale-[1.01]' 
                              : 'border-slate-200/90 hover:border-emerald-300 bg-slate-50/60 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md text-xs font-bold font-mono flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border border-slate-300 text-slate-600'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="leading-relaxed pt-0.5 flex-1">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Submit Dock */}
          <div className="p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/90 shadow-md flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-600">
              {Object.keys(selectedAnswers).length === questions.length
                ? 'All questions recorded. Ready for Socratic submission.'
                : `Complete all questions (${Object.keys(selectedAnswers).length}/${questions.length}) to submit.`}
            </span>
            <div className={`relative p-[1.5px] rounded-xl ${Object.keys(selectedAnswers).length === questions.length ? 'conic-beam shadow-md shadow-emerald-500/20' : ''}`}>
              <button
                onClick={handleSubmitEvaluation}
                disabled={Object.keys(selectedAnswers).length < questions.length}
                className={`px-6 py-3 rounded-[10px] font-heading font-bold text-xs tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
                  Object.keys(selectedAnswers).length === questions.length
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white btn-shimmer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Submit Evaluation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STATE 4: SUBMITTING SPINNER --- */}
      {engineState === 'SUBMITTING' && (
        <div className="view-transition-enter p-12 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-xl text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <h4 className="text-base font-heading font-bold text-slate-900">
            Diagnosing Mental Models & Verifying Mastery...
          </h4>
          <p className="text-xs text-slate-500">
            Synthesizing item-by-item diagnostic feedback.
          </p>
        </div>
      )}

      {/* --- STATE 5: PASSED VIEW --- */}
      {engineState === 'PASSED_VIEW' && (
        <div className="view-transition-enter p-8 md:p-10 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border border-emerald-300 rounded-3xl text-center shadow-xl space-y-5 relative overflow-hidden">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#10B981"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - (lastScore / 100))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-heading font-extrabold text-slate-900">{lastScore}%</span>
              <span className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider">Passed</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-white bg-emerald-600 px-3 py-1 rounded-full shadow-xs inline-block">
              Mastery Verified
            </span>
            <h3 className="text-2xl font-heading font-bold text-slate-900 pt-2">
              Score: {lastScore}% • Milestone Passed!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              You have satisfied the competency requirements for Milestone {stepIndex}. The next milestone map node is now unlocked.
            </p>
          </div>
        </div>
      )}

      {/* --- STATE 6: TARGETED REMEDIATION GATE (FAILED TEST) --- */}
      {engineState === 'TARGETED_REMEDIATION' && prescription && (
        <div className="view-transition-enter space-y-6">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-br from-amber-50 via-white to-rose-50/40 border border-amber-300 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-md">
                  Competency Gap Detected • Score: {lastScore}%
                </span>
              </div>
              <h3 className="text-lg font-heading font-bold text-slate-900 mt-2">
                Targeted Remediation Required
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                You do not need to restart the entire step. Review the diagnosed weak areas below to unlock your retest.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-white/90 px-3.5 py-2 rounded-xl border border-amber-200 shadow-xs shrink-0 self-start md:self-center">
              Passing Threshold: 80%
            </span>
          </div>

          {/* Diagnostic Weakness Cards */}
          <div className="space-y-4">
            {(prescription.weakAreas || []).map((area, idx) => {
              const docKey = `doc_${idx}`;
              const videoKey = `video_${idx}`;
              const isDocReviewed = reviewedResources[docKey];
              const isVideoReviewed = reviewedResources[videoKey];

              return (
                <div key={idx} className="p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm space-y-4 wobble-card">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Deficit Area: {area.topic}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">Unit Focus {idx + 1}</span>
                  </div>

                  {/* Socratic Feedback Side-by-Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-4 bg-rose-50/80 border border-rose-200/80 rounded-2xl space-y-1">
                      <span className="font-heading font-bold text-rose-900 block mb-1">Identified Misconception:</span>
                      <p className="text-rose-950 leading-relaxed">{area.misconceptionAnalysis}</p>
                    </div>
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-1">
                      <span className="font-heading font-bold text-emerald-900 block mb-1">Target Mental Model:</span>
                      <p className="text-emerald-950 leading-relaxed">{area.coreConcept}</p>
                    </div>
                  </div>

                  {/* Laser-Targeted Resources */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Documentation Card */}
                    <button
                      type="button"
                      onClick={() => markResourceReviewed(docKey, area.resources?.docUrl || '#')}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                        isDocReviewed
                          ? 'border-emerald-400 bg-emerald-50/50 text-slate-800'
                          : 'border-slate-200 hover:border-cyan-400 bg-white text-slate-700 shadow-xs'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${isDocReviewed ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-50 text-cyan-700'} flex-shrink-0`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-cyan-800 tracking-wider">Reference Doc</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        </div>
                        <p className="text-xs font-heading font-bold text-slate-900 mt-1 truncate">{area.resources?.docTitle || 'Canonical Reference'}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{area.resources?.criticalTakeaway || 'Targeted study reference.'}</p>
                        <span className={`text-[10px] font-bold mt-2 inline-block ${isDocReviewed ? 'text-emerald-700' : 'text-cyan-700'}`}>
                          {isDocReviewed ? '✓ Reviewed' : 'Read Section →'}
                        </span>
                      </div>
                    </button>

                    {/* Video Card */}
                    <button
                      type="button"
                      onClick={() => markResourceReviewed(videoKey, area.resources?.videoUrl || '#')}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                        isVideoReviewed
                          ? 'border-emerald-400 bg-emerald-50/50 text-slate-800'
                          : 'border-slate-200 hover:border-rose-400 bg-white text-slate-700 shadow-xs'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${isVideoReviewed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-700'} flex-shrink-0`}>
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-rose-800 tracking-wider">Video Tutorial</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        </div>
                        <p className="text-xs font-heading font-bold text-slate-900 mt-1 truncate">{area.resources?.videoTitle || 'Video Walkthrough'}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Canonical Video Demonstration</p>
                        <span className={`text-[10px] font-bold mt-2 inline-block ${isVideoReviewed ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isVideoReviewed ? '✓ Watched' : 'Watch Segment →'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gated Retest Bar */}
          <div className="p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${allPrescribedResourcesReviewed() ? 'text-emerald-500' : 'text-slate-300'}`} />
              <span>
                {allPrescribedResourcesReviewed()
                  ? 'Remedial review complete. You can now take the adaptive retest.'
                  : 'Open each prescribed doc and video above to unlock your retest.'}
              </span>
            </div>
            <div className={`relative p-[1.5px] rounded-xl w-full sm:w-auto ${allPrescribedResourcesReviewed() ? 'conic-beam-amber shadow-md shadow-amber-500/20' : ''}`}>
              <button
                type="button"
                onClick={() => handleGenerateEvaluation(true)}
                disabled={!allPrescribedResourcesReviewed()}
                className={`w-full sm:w-auto px-6 py-3 rounded-[10px] font-heading font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  allPrescribedResourcesReviewed()
                    ? 'bg-amber-500 hover:bg-amber-600 text-white btn-shimmer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>⚡ Take Targeted Retest</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAndEvaluationEngine;
