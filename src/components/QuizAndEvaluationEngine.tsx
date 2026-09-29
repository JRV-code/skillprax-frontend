import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, BookOpen, 
  Video, ArrowRight, RotateCcw, ShieldCheck, ExternalLink 
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
  onStepPassed: (score: number) => void;
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
}) => {
  const [engineState, setEngineState] = useState<EngineState>('STANDBY_UNGENERATED');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [lastScore, setLastScore] = useState<number>(0);
  const [prescription, setPrescription] = useState<DiagnosticPrescription | null>(null);
  const [reviewedResources, setReviewedResources] = useState<Record<string, boolean>>({});
  const [isRetestMode, setIsRetestMode] = useState<boolean>(false);

  // Fisher-Yates Shuffle
  const shuffleOptions = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // 1. Lazy Generate Evaluation
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

      // Apply Fisher-Yates shuffling on options and normalize prompt
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
    } catch (err) {
      console.error(err);
      setEngineState('STANDBY_UNGENERATED');
    }
  };

  // 2. Submit Evaluation
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
        onStepPassed(score);
      } else {
        setPrescription(data.diagnosticPrescription || null);
        setReviewedResources({});
        setEngineState('TARGETED_REMEDIATION');
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
      {/* --- STATE 1: UNGENERATED STANDBY --- */}
      {engineState === 'STANDBY_UNGENERATED' && (
        <div className="view-transition-enter p-8 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Milestone {stepIndex} Competency Evaluation
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Evaluates your mastery across {acus.length || 'core'} targeted competency units with 
            scenario-based challenges. Passing threshold is 80%.
          </p>
          <button
            onClick={() => handleGenerateEvaluation(false)}
            className="btn-primary"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Socratic Evaluation
          </button>
        </div>
      )}

      {/* --- STATE 2: LOADING SKELETON --- */}
      {engineState === 'GENERATING_QUIZ' && (
        <div className="view-transition-enter p-12 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 text-center">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-base font-semibold text-slate-800">
            Synthesizing Scenario Evaluation...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Balancing equal-length options and mapping distractors to tested competencies.
          </p>
        </div>
      )}

      {/* --- STATE 3: ACTIVE EVALUATION --- */}
      {engineState === 'ACTIVE_EVALUATION' && (
        <div className="view-transition-enter space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                {isRetestMode ? 'Adaptive Retest Active' : `Evaluation • Step ${stepIndex}`}
              </span>
              <h4 className="text-base font-semibold text-slate-800 mt-1">{stepTitle}</h4>
            </div>
            <span className="text-xs text-slate-500">
              {Object.keys(selectedAnswers).length} of {questions.length} Answered
            </span>
          </div>

          {questions.map((q, qIndex) => (
            <div key={q.id} className="p-6 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-sm">
              <p className="text-sm font-semibold text-slate-900 mb-4">
                <span className="text-emerald-700 mr-2">Q{qIndex + 1}.</span>
                {q.prompt}
              </p>
              <div className="space-y-2.5">
                {q.options.map(opt => {
                  const isSelected = selectedAnswers[q.id] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                      className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm cursor-pointer transition-all duration-150 ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-medium' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmitEvaluation}
              disabled={Object.keys(selectedAnswers).length < questions.length}
              className="btn-primary"
            >
              Submit Evaluation
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* --- STATE 4: PASSED VIEW --- */}
      {engineState === 'PASSED_VIEW' && (
        <div className="view-transition-enter p-8 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Mastery Verified
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            Score: {lastScore}% • Milestone Passed!
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
            You have satisfied the competency requirements for Step {stepIndex}.
            The next milestone is now unlocked.
          </p>
        </div>
      )}

      {/* --- STATE 5: TARGETED REMEDIATION GATE (FAILED TEST) --- */}
      {engineState === 'TARGETED_REMEDIATION' && prescription && (
        <div className="view-transition-enter space-y-6">
          {/* Header Banner */}
          <div className="p-6 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-md">
                  Competency Gap Detected • Score: {lastScore}%
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                Targeted Remediation Required
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                You do not need to restart the entire step. Review the diagnosed weak areas below to unlock your retest.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-amber-900 bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200">
                Passing Threshold: 80%
              </span>
            </div>
          </div>

          {/* Diagnostic Weakness Cards */}
          <div className="space-y-4">
            {(prescription.weakAreas || []).map((area, idx) => {
              const docKey = `doc_${idx}`;
              const videoKey = `video_${idx}`;
              const isDocReviewed = reviewedResources[docKey];
              const isVideoReviewed = reviewedResources[videoKey];

              return (
                <div key={idx} className="p-6 bg-white/95 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Deficit Area: {area.topic}
                    </h4>
                    <span className="text-xs text-slate-400">Unit Focus {idx + 1}</span>
                  </div>

                  {/* Socratic Feedback */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl">
                      <span className="font-bold text-rose-800 block mb-1">Identified Misconception:</span>
                      <p className="text-rose-900 leading-relaxed">{area.misconceptionAnalysis}</p>
                    </div>
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                      <span className="font-bold text-emerald-800 block mb-1">Target Mental Model:</span>
                      <p className="text-emerald-900 leading-relaxed">{area.coreConcept}</p>
                    </div>
                  </div>

                  {/* Laser-Targeted Resources */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Documentation Card */}
                    <button
                      onClick={() => markResourceReviewed(docKey, area.resources?.docUrl || '#')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        isDocReviewed
                          ? 'border-emerald-300 bg-emerald-50/40 text-slate-800'
                          : 'border-slate-200 hover:border-emerald-400 bg-slate-50/60 text-slate-700'
                      }`}
                    >
                      <BookOpen className={`w-5 h-5 mt-0.5 ${isDocReviewed ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold truncate">{area.resources?.docTitle || 'Curated Documentation'}</p>
                          <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{area.resources?.criticalTakeaway || 'Key conceptual breakdown'}</p>
                        <span className="text-[10px] font-bold text-emerald-600 mt-1 inline-block">
                          {isDocReviewed ? '✓ Reviewed' : 'Read Section →'}
                        </span>
                      </div>
                    </button>

                    {/* Video Card */}
                    <button
                      onClick={() => markResourceReviewed(videoKey, area.resources?.videoUrl || '#')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        isVideoReviewed
                          ? 'border-emerald-300 bg-emerald-50/40 text-slate-800'
                          : 'border-slate-200 hover:border-emerald-400 bg-slate-50/60 text-slate-700'
                      }`}
                    >
                      <Video className={`w-5 h-5 mt-0.5 ${isVideoReviewed ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold truncate">{area.resources?.videoTitle || 'Targeted Tutorial Video'}</p>
                          <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Canonical Video Segment</p>
                        <span className="text-[10px] font-bold text-emerald-600 mt-1 inline-block">
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
          <div className="p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className={`w-4 h-4 ${allPrescribedResourcesReviewed() ? 'text-emerald-500' : 'text-slate-300'}`} />
              <span>
                {allPrescribedResourcesReviewed()
                  ? 'Remedial review complete. You can now take the adaptive retest.'
                  : 'Open each prescribed doc and video above to unlock your retest.'}
              </span>
            </div>
            <button
              onClick={() => handleGenerateEvaluation(true)}
              disabled={!allPrescribedResourcesReviewed()}
              className="btn-gold w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Targeted Retest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAndEvaluationEngine;
