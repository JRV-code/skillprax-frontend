import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  socraticContext: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    misconceptionExplanation?: string;
  }[];
  correctExplanation: string;
}

interface QuizInterspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack?: any;
  nodeTitle?: string;
  acuTitle?: string;
  onPassEvaluation?: () => void;
}

export const QuizInterspaceModal: React.FC<QuizInterspaceModalProps> = ({
  isOpen,
  onClose,
  currentTrack = { title: 'Chemistry & Kinematics', icon: '⚗️' },
  nodeTitle,
  acuTitle,
  onPassEvaluation,
}) => {
  const [timeLeft, setTimeLeft] = useState(600);
  const [timerActive, setTimerActive] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const rawQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question:
        'In nucleophilic substitution of an optically active 2-bromobutane with aqueous KOH, what stereochemical outcome confirms an SN2 pathway over SN1?',
      socraticContext:
        'Socratic probe testing the spatial orbital overlap and rear-side attack mechanics.',
      options: [
        {
          id: 'opt-a',
          text: 'Complete Walden inversion of configuration with no racemization',
          isCorrect: true,
          misconceptionExplanation: '',
        },
        {
          id: 'opt-b',
          text: '50:50 racemic mixture of enantiomers due to carbocation intermediate',
          isCorrect: false,
          misconceptionExplanation:
            'A racemic mixture is characteristic of an SN1 planar carbocation intermediate, not a concerted single-step SN2 backside attack.',
        },
        {
          id: 'opt-c',
          text: 'Complete retention of the original stereochemical configuration',
          isCorrect: false,
          misconceptionExplanation:
            'Retention of configuration occurs in intramolecular SNi reactions (e.g., SOCl2 in ether), not bimolecular SN2 substitution.',
        },
        {
          id: 'opt-d',
          text: 'Elimination product 2-butene as the sole stoichiometric output',
          isCorrect: false,
          misconceptionExplanation:
            'Aqueous KOH favors nucleophilic substitution; alcoholic KOH or strong sterically hindered bases favor E2 beta-elimination.',
        },
      ],
      correctExplanation:
        'SN2 proceeds through a single concerted transition state with backside nucleophilic attack, yielding 100% Walden inversion.',
    },
    {
      id: 'q2',
      question:
        'Why does haloarene C-X bond resist nucleophilic substitution under standard ambient conditions in Dow’s Process?',
      socraticContext:
        'Evaluating resonance delocalization and hybrid orbital electronegativity constraints.',
      options: [
        {
          id: 'opt-a',
          text: 'Partial double bond character from resonance delocalization and sp2 carbon electronegativity',
          isCorrect: true,
          misconceptionExplanation: '',
        },
        {
          id: 'opt-b',
          text: 'Steric hindrance caused by ortho hydrogen atoms blocking rear approach only',
          isCorrect: false,
          misconceptionExplanation:
            'While rear attack is geometrically blocked by the aromatic ring, the primary thermodynamic resistance is the resonance partial double bond and strong sp2 C-Cl bond.',
        },
        {
          id: 'opt-c',
          text: 'Instability of the phenyl anion formed during heterolytic bond cleavage',
          isCorrect: false,
          misconceptionExplanation:
            'Heterolytic cleavage in SN1 would form a highly unstable phenyl cation, not a phenyl anion, which prevents the unimolecular route.',
        },
        {
          id: 'opt-d',
          text: 'Excess electron deficiency in the benzene ring repelling the nucleophile',
          isCorrect: false,
          misconceptionExplanation:
            'The pi-electron cloud has high electron density, which repels electron-rich nucleophiles, not electron deficiency.',
        },
      ],
      correctExplanation:
        'The lone pairs on halogen delocalize into the aromatic pi-system, giving the C-Cl bond partial double bond character with a shorter, stronger 169pm bond length.',
    },
    {
      id: 'q3',
      question:
        'In biomechanical sprint acceleration, what is the critical determinant of horizontal propulsion in the first 0–10 meters?',
      socraticContext:
        'Testing understanding of ground contact force vectors versus frequency bias.',
      options: [
        {
          id: 'opt-a',
          text: 'High horizontal ground reaction force vector applied through low acute body lean angle',
          isCorrect: true,
          misconceptionExplanation: '',
        },
        {
          id: 'opt-b',
          text: 'Maximizing vertical stride frequency regardless of foot strike angle',
          isCorrect: false,
          misconceptionExplanation:
            'High stride frequency without horizontal propulsive impulse leads to upright spinning with poor acceleration.',
        },
        {
          id: 'opt-c',
          text: 'Immediate upright torso transition to expand lung volume',
          isCorrect: false,
          misconceptionExplanation:
            'Premature upright posture redirects ground reaction forces vertically rather than horizontally, killing acceleration momentum.',
        },
        {
          id: 'opt-d',
          text: 'Landing on the heels to absorb braking impulse forces',
          isCorrect: false,
          misconceptionExplanation:
            'Heel strikes produce high braking impulse that halts forward momentum; ball-of-foot plantar force is required.',
        },
      ],
      correctExplanation:
        'Kinematic acceleration requires directing the net ground reaction force vector as horizontally as possible (45° angle) with powerful hip extension.',
    },
  ];

  const shuffleOptions = (qs: QuizQuestion[]) => {
    return qs.map((q) => {
      const array = [...q.options];
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return { ...q, options: array };
    });
  };

  const [questions, setQuestions] = useState<QuizQuestion[]>(() => shuffleOptions(rawQuestions));
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen || !timerActive || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timerActive, isSubmitted]);

  useEffect(() => {
    if (isOpen) {
      setQuestions(shuffleOptions(rawQuestions));
      setSelectedAnswers({});
      setIsSubmitted(false);
      setTimeLeft(600);
      setTimerActive(true);
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectAnswer = (qId: string, optId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleSubmitEvaluation = () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert('Please answer all questions before submitting your Socratic evaluation.');
      return;
    }
    setIsSubmitted(true);
    setTimerActive(false);

    const allCorrect = questions.every((q) => {
      const opt = q.options.find((o) => o.id === selectedAnswers[q.id]);
      return opt?.isCorrect;
    });

    if (allCorrect && onPassEvaluation) {
      onPassEvaluation();
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      const opt = q.options.find((o) => o.id === selectedAnswers[q.id]);
      if (opt?.isCorrect) score++;
    });
    return score;
  };

  const score = calculateScore();
  const passed = score === questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md view-transition-enter overflow-y-auto font-sans">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-emerald-200/90 ring-1 ring-black/5 my-6 max-h-[94vh] overflow-y-auto flex flex-col justify-between">
        {/* Arena Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
              {currentTrack?.icon || '⚗️'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-900 rounded-full">
                  QUIZ INTERSPACE
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {currentTrack?.title || 'Skillprax Track'} • {nodeTitle || 'Active Milestone'}
                </span>
              </div>
              <h2 className="text-lg font-heading font-bold text-slate-900">
                {acuTitle ? `Socratic Gate: ${acuTitle}` : 'Autonomous Socratic Evaluation Duel'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                timeLeft < 120
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="py-3">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-500">
              Question <strong className="text-emerald-800">{currentIndex + 1}</strong> of {questions.length}
            </span>
            <span className="font-mono text-emerald-700 font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Question Area */}
        <div className="py-4 space-y-4 flex-1">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentIndex + 1}
              </span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Socratic Challenge Probe
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-heading font-semibold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
            <p className="text-xs text-slate-500 italic">
              Context: {currentQ.socraticContext}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, optIndex) => {
              const selectedOptId = selectedAnswers[currentQ.id];
              const isSelected = selectedOptId === opt.id;
              const letter = String.fromCharCode(65 + optIndex);

              let style = 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/20';
              if (isSelected) {
                style = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200 shadow-xs';
              }
              if (isSubmitted) {
                if (opt.isCorrect) {
                  style = 'bg-emerald-100/90 border-emerald-500 text-emerald-950 font-semibold ring-2 ring-emerald-300';
                } else if (isSelected && !opt.isCorrect) {
                  style = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-200';
                }
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectAnswer(currentQ.id, opt.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${style}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-transform ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 scale-105'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {isSubmitted && opt.isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : letter}
                  </div>
                  <span className="flex-1 pt-0.5 leading-relaxed">{opt.text}</span>
                </div>
              );
            })}
          </div>

          {/* Misconception Feedback */}
          {isSubmitted && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                {currentQ.options.find((o) => o.id === selectedAnswers[currentQ.id])?.isCorrect ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Correct Socratic Deduction!
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                    Cognitive Misconception Analysis
                  </span>
                )}
              </div>

              {!currentQ.options.find((o) => o.id === selectedAnswers[currentQ.id])?.isCorrect && (
                <p className="text-xs text-rose-800 bg-rose-50/80 p-2.5 rounded-xl leading-relaxed border border-rose-100">
                  <strong>Why this distractor failed: </strong>
                  {currentQ.options.find((o) => o.id === selectedAnswers[currentQ.id])?.misconceptionExplanation ||
                    'This answer breaches spatial geometry or velocity conservation invariants.'}
                </p>
              )}

              <p className="text-xs text-slate-700 pt-1">
                <strong>Socratic Truth: </strong>
                {currentQ.correctExplanation}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            {!isSubmitted ? (
              <div className="relative p-[1.5px] rounded-2xl conic-beam">
                <button
                  onClick={handleSubmitEvaluation}
                  className="relative z-10 px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white rounded-[14px] text-xs font-bold uppercase tracking-wider shadow-lg btn-tactile btn-shimmer cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Submit Socratic Diagnosis</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Score: {score} / {questions.length} {passed ? '🎉 PASSED' : '⚠️ REVIEW'}
                </span>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md btn-tactile cursor-pointer"
                >
                  Return to Roadmap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterspaceModal;
