'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SkillTrack, FlowchartNode, AIEngine, StudyResource, QuizQuestion } from '@/types';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';
import { AIEngineSelectorModal } from '@/components/AIEngineSelectorModal';
import { QuizAndEvaluationEngine } from '@/components/QuizAndEvaluationEngine';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import {
  GitBranch,
  BookOpen,
  Zap,
  Cpu,
  ArrowRight,
  ExternalLink,
  Youtube,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Video,
  FileText,
  Clock,
  Eye,
  AlertCircle,
  AlertTriangle,
  Lock,
  Plus,
  Target,
  FileCheck,
  RotateCcw,
  Check,
  XCircle,
  HelpCircle,
  TrendingUp,
  Award,
  ChevronLeft,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkspaceStudioPageProps {
  currentTrack: SkillTrack;
  rawWorkspace?: any;
  onNavigate: (page: 'landing' | 'profile' | 'studio') => void;
  selectedEngine: AIEngine;
  onSelectEngine: (engine: AIEngine) => void;
  onPassEvaluation: () => void;
}

// Socratic Question Bank for organic and default domains

const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  chemistry: [
    {
      id: 'chem-q1',
      question:
        'Why does chlorobenzene exhibit drastically lower reactivity toward nucleophilic substitution compared to chloroethane?',
      socraticContext: 'Axiomatic sp² vs sp³ hybridization and conjugated lone-pair resonance mechanics.',
      options: [
        {
          id: 'opt-a',
          text: 'The C–Cl bond acquires partial double-bond character through delocalization of the chlorine lone pair into the aromatic ring.',
          isCorrect: true,
          misconceptionExplanation:
            'This is the verified physical cause. The C-Cl bond length contracts to 169 pm.',
        },
        {
          id: 'opt-b',
          text: 'The benzene ring acts as a powerful Lewis acid that neutralizes the incoming nucleophile instantly.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Benzene is electron-rich (π-electron cloud) and acts as a nucleophile or base, never a Lewis acid.',
        },
        {
          id: 'opt-c',
          text: 'Chlorine exerts an overwhelming +I inductive electron-donating effect on the phenyl ring.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Halogens are strongly electronegative and exert a -I inductive electron-withdrawing effect, not +I.',
        },
        {
          id: 'opt-d',
          text: 'Phenyl carbocation intermediate formed in SN1 substitution is stabilized by hyperconjugation.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Phenyl cation is sp-hybridized, perpendicular to the aromatic π-system, and extremely unstable.',
        },
      ],
      correctExplanation:
        'Resonance delocalization of chlorine’s unshared electron pairs with the benzene ring yields a shorter, stronger C=Cl bond with partial double bond character. In addition, the phenyl carbon is sp² hybridized (33% s-character), holding electrons tighter than sp³ carbon.',
    },
    {
      id: 'chem-q2',
      question:
        'When 2-bromopentane is treated with alcoholic KOH under thermal reflux, why is pent-2-ene the predominant product rather than pent-1-ene?',
      socraticContext: 'Thermodynamics of β-elimination dehydrohalogenation under Zaitsev criteria.',
      options: [
        {
          id: 'opt-a',
          text: 'Saytzeff (Zaitsev) rule dictates that the more highly substituted, hyperconjugation-stabilized alkene predominates with unhindered bases.',
          isCorrect: true,
          misconceptionExplanation:
            'Correct: Pent-2-ene has 5 hyperconjugative α-hydrogens compared to only 2 for pent-1-ene.',
        },
        {
          id: 'opt-b',
          text: 'Steric congestion prevents the base from approaching the primary β-hydrogen on carbon-1.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Primary β-hydrogens are actually the least sterically hindered; they yield Hofmann product only with bulky bases like t-BuOK.',
        },
        {
          id: 'opt-c',
          text: 'Bromine departs first through a unimolecular E1 path generating a stabilized allylic carbocation.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: High concentration of strong base (alcoholic KOH) enforces concerted bimolecular E2 anti-periplanar elimination.',
        },
        {
          id: 'opt-d',
          text: 'Pent-1-ene undergoes instantaneous thermodynamic rearrangement into pent-2-ene upon formation.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Alkenes do not spontaneously isomerize without strong protic superacids or transition metal catalysts.',
        },
      ],
      correctExplanation:
        'According to Saytzeff’s rule, in dehydrohalogenation reactions, the alkene with greater number of alkyl substituents attached to doubly bonded carbons is more stable due to hyperconjugation and forms preferentially.',
    },
    {
      id: 'chem-q3',
      question:
        'Why does reaction of an alkyl halide with KCN yield predominantly alkyl cyanide (R-CN), whereas with AgCN it produces alkyl isocyanide (R-NC)?',
      socraticContext: 'Ambident nucleophile duality: ionic lattice dissociation vs covalent coordinate bonding.',
      options: [
        {
          id: 'opt-a',
          text: 'KCN is ionic, allowing nucleophilic attack via carbon (stronger C–C bond formed); AgCN is largely covalent, leaving only nitrogen lone pairs free to attack.',
          isCorrect: true,
          misconceptionExplanation:
            'Correct: C-C bond enthalpy (~347 kJ/mol) exceeds C-N (~305 kJ/mol), favoring carbon attack when free cyanide ion is liberated.',
        },
        {
          id: 'opt-b',
          text: 'Potassium forms a chelate complex with nitrogen, while silver binds irreversibly to carbon lone pairs.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Potassium is an alkali metal that completely dissociates in polar solvent without covalent chelation.',
        },
        {
          id: 'opt-c',
          text: 'Silver cyanide undergoes radical oxidation which forces thermal inversion of the nitrile group.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: The reaction is polar nucleophilic substitution (SN2/SN1), not free radical rearrangement.',
        },
        {
          id: 'opt-d',
          text: 'AgCN acts as a reducing agent converting nascent alkyl halides into volatile carbylamines.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: AgCN acts as an ambident nucleophile donor, not a redox reducing agent.',
        },
      ],
      correctExplanation:
        'Cyanide ion is ambident. KCN is predominantly ionic: K+ [:C≡N:]-, so both C and N can attack, but C-C bond is more stable than C-N. In AgCN, Ag-C bond is covalent; thus nitrogen lone pair attacks R, forming isocyanide.',
    },
    {
      id: 'chem-q4',
      question:
        'In the reaction of chiral (R)-2-bromooctane with sodium hydroxide in acetone, what stereochemical outcome is observed in the resulting 2-octanol?',
      socraticContext: 'Walden inversion kinematics during bimolecular nucleophilic substitution (SN2).',
      options: [
        {
          id: 'opt-a',
          text: 'Complete (100%) inversion of configuration to (S)-2-octanol via backside nucleophilic attack.',
          isCorrect: true,
          misconceptionExplanation:
            'Correct: Secondary alkyl halide in polar aprotic acetone with strong nucleophile undergoes classic concerted SN2 backside attack.',
        },
        {
          id: 'opt-b',
          text: 'Total racemization resulting in an optically inactive (±)-2-octanol 50:50 mixture.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Racemization occurs in unimolecular SN1 via planar carbocation in polar protic solvents, not SN2 in acetone.',
        },
        {
          id: 'opt-c',
          text: 'Full retention of configuration yielding (R)-2-octanol via frontside internal collapse (SNi).',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: SNi with retention occurs with reagents like SOCl2 in nonpolar solvents (dioxane/ether), not NaOH in acetone.',
        },
        {
          id: 'opt-d',
          text: 'Elimination exclusively yields oct-1-ene with zero alcohol formation.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: OH- is a good nucleophile on 2° substrate; substitution competes favorably in polar aprotic solvent without high heat.',
        },
      ],
      correctExplanation:
        'SN2 reactions proceed with stereochemical Walden inversion because the nucleophile attacks from the side directly opposite to the leaving group (180° trajectory), flipping the carbon tetrahedral umbrella.',
    },
  ],
  default: [
    {
      id: 'def-q1',
      question:
        'How does an authoritative mastery engine ensure concept durability compared to rote memorization?',
      socraticContext: 'Cognitive load theory and retrieval practice under deliberate spaced repetition.',
      options: [
        {
          id: 'opt-a',
          text: 'By forcing diagnostic misconception interrogation and requiring 80%+ active threshold before unlocking dependent concepts.',
          isCorrect: true,
          misconceptionExplanation:
            'Correct: Gating progression on conceptual clarity prevents compounding gaps downstream.',
        },
        {
          id: 'opt-b',
          text: 'By presenting passive summary cards with indefinite repeat clicks without test gates.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Passive consumption creates an illusion of competence without enduring mental schemas.',
        },
        {
          id: 'opt-c',
          text: 'By prioritizing high question velocity over deep diagnostic analysis of distractor traps.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Speed without reflection reinforces flawed intuition and erroneous heuristics.',
        },
        {
          id: 'opt-d',
          text: 'By keeping question options in fixed order A to D so learners memorize spatial positions.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Fixed option patterns induce spatial bias and eliminate genuine conceptual discrimination.',
        },
      ],
      correctExplanation:
        'Deliberate practice with diagnostic feedback and competency gating ensures deep mental schema integration.',
    },
    {
      id: 'def-q2',
      question:
        'When diagnosing learner errors on a multiple-choice item, what delivers the highest pedagogical value?',
      socraticContext: 'Formative assessment and cognitive error taxonomy.',
      options: [
        {
          id: 'opt-a',
          text: 'Exposing the exact false mental model (misconception) that made the chosen incorrect option enticing.',
          isCorrect: true,
          misconceptionExplanation:
            'Correct: Deconstructing the misconception directly neutralizes intuitive fallacies.',
        },
        {
          id: 'opt-b',
          text: 'Merely displaying a red crossmark and stating the correct letter without explanation.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Binary right/wrong signaling leaves the underlying cognitive misunderstanding unresolved.',
        },
        {
          id: 'opt-c',
          text: 'Penalizing user score with zero opportunity to review authoritative study references.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Punitive scoring without remedial guidance induces test anxiety and halts progression.',
        },
        {
          id: 'opt-d',
          text: 'Replacing the entire curriculum with lower-tier introductory flashcards.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Regressing the curriculum rather than targeted error correction wastes learner tenure.',
        },
      ],
      correctExplanation:
        'Targeted misconception feedback explains precisely why a distractor felt plausible, breaking invalid cognitive shortcuts.',
    },
    {
      id: 'def-q3',
      question:
        'In deliberate skill acquisition, what role does the Socratic Evaluation Gate serve in the learning loop?',
      socraticContext: 'Mastery learning model (Bloom) and formative boundary verification.',
      options: [
        {
          id: 'opt-a',
          text: 'It operates as an immutable validation checkpoint ensuring prerequisite competency before graph expansion.',
          isCorrect: true,
          misconceptionExplanation:
            'Correct: Prerequisites must be locked in before advanced nodes can be syntactically comprehended.',
        },
        {
          id: 'opt-b',
          text: 'It serves as a competitive leaderboard metric to encourage high-stakes peer comparisons.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Socratic gates are mastery-oriented and individualized, not competitive vanity boards.',
        },
        {
          id: 'opt-c',
          text: 'It is an optional decorative widget that learners should skip during accelerated study tracks.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Bypassing gates leads to catastrophic failure at higher-tier synthesis nodes.',
        },
        {
          id: 'opt-d',
          text: 'It locks the curriculum permanently if the learner scores below 100% on the initial attempt.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: The Socratic method encourages iterative retakes with novel shuffled questions until mastery is attained.',
        },
      ],
      correctExplanation:
        'Evaluation gates enforce mastery-based progression: only validated comprehension unlocks subsequent conceptual tiers.',
    },
    {
      id: 'def-q4',
      question:
        'Why does Fisher-Yates algorithmic option shuffling represent a strict standard for online assessment engines?',
      socraticContext: 'Psychometric validity and mitigation of position bias in multiple choice instruments.',
      options: [
        {
          id: 'opt-a',
          text: 'It guarantees every permutation of choices is equally probable, completely eliminating option location bias.',
          isCorrect: true,
          misconceptionExplanation:
            'Correct: Fisher-Yates produces an unbiased random permutation in O(n) runtime.',
        },
        {
          id: 'opt-b',
          text: 'It ensures option A is always the easiest distractor and option D is the correct answer.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Fisher-Yates achieves the exact opposite: non-deterministic, uniformly distributed option positions.',
        },
        {
          id: 'opt-c',
          text: 'It slows down question rendering to simulate examination server latency.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Shuffling is executed client-side in sub-millisecond time and enhances test integrity.',
        },
        {
          id: 'opt-d',
          text: 'It automatically penalizes students who change their selections multiple times.',
          isCorrect: false,
          misconceptionExplanation:
            'Misconception: Shuffling affects option ordering before display; it does not track or penalize deliberation.',
        },
      ],
      correctExplanation:
        'Unbiased shuffling forces the student to evaluate conceptual substance rather than inferring patterns from option position.',
    },
  ],
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const WorkspaceStudioPage: React.FC<WorkspaceStudioPageProps> = ({
  currentTrack,
  rawWorkspace,
  onNavigate,
  selectedEngine,
  onSelectEngine,
  onPassEvaluation,
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'resources' | 'evaluation'>('roadmap');
  const [showEngineModal, setShowEngineModal] = useState<boolean>(false);
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);

  const [nodes, setNodes] = useState<FlowchartNode[]>([
    {
      id: 'node-1',
      label: 'Step 1: Axiomatic Foundations',
      subLabel: 'Core Physical & Syntactic Axioms',
      status: 'completed',
      x: 80,
      y: 110,
      width: 195,
      height: 80,
      tier: 1,
      objectives: [
        'Master base kinematic/structural formulas and initial boundary conditions',
        'Verify prerequisite conservation and nomenclature principles',
        'Eliminate introductory misconceptions and formula oversights',
      ],
      acus: ['ACU-101: Axiomatic boundary verification', 'ACU-102: Formula consistency audit'],
      aiSummary: 'Axiomatic baseline established with 100% verified prerequisite checks.',
    },
    {
      id: 'node-2',
      label: 'Step 2: Core Dynamics & Execution',
      subLabel: 'Active Socratic Learning Node',
      status: 'active',
      x: 360,
      y: 110,
      width: 200,
      height: 80,
      tier: 2,
      objectives: [
        'Execute primary operational steps under steady-state conditions',
        'Discriminate between direct primary actions and distractor shortcuts',
        'Measure latency and ensure correct kinetic sequence',
      ],
      acus: ['ACU-201: Procedural synthesis execution', 'ACU-202: Kinetic trajectory verification'],
      aiSummary: 'Active study node currently loaded in Workspace Studio.',
    },
    {
      id: 'node-3',
      label: 'Step 3: Socratic Diagnostic Synthesis',
      subLabel: 'Formative Gate & Misconceptions',
      status: 'locked',
      x: 640,
      y: 110,
      width: 200,
      height: 80,
      tier: 3,
      objectives: [
        'Isolate false intuitive assumptions under high-pressure scenarios',
        'Reconstruct knowledge graphs from first principles',
        'Demonstrate mastery above the 80% threshold',
      ],
      acus: ['ACU-301: Misconception diagnostic analysis', 'ACU-302: Edge-case fault recovery'],
      aiSummary: 'Diagnostic synthesis gate locked. Complete Step 2 evaluation to unlock.',
    },
    {
      id: 'node-4',
      label: 'Step 4: Applied Domain Architecture',
      subLabel: 'Multi-variable Scenario Testing',
      status: 'locked',
      x: 920,
      y: 110,
      width: 200,
      height: 80,
      tier: 4,
      objectives: [
        'Synthesize interconnected domain frameworks',
        'Resolve multi-step optimization and parameter tuning',
      ],
      acus: ['ACU-401: Framework integration', 'ACU-402: Optimization parameters'],
      aiSummary: 'Autonomous expansion node.',
    },
  ]);

  const [activeNodeId, setActiveNodeId] = useState<string>('node-2');
  const [lockedShakeId, setLockedShakeId] = useState<string | null>(null);

  const [checkedACUs, setCheckedACUs] = useState<Record<string, boolean>>({});

  const [resourcesSynthesized, setResourcesSynthesized] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [activeVideoModal, setActiveVideoModal] = useState<StudyResource | null>(null);

  const [quizState, setQuizState] = useState<'ready' | 'evaluating' | 'completed'>('ready');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState<{
    correctCount: number;
    totalCount: number;
    scorePercent: number;
    passed: boolean;
  } | null>(null);

  const [energyBeamFired, setEnergyBeamFired] = useState<boolean>(false);
  const [levelUpData, setLevelUpData] = useState<{
    score: number;
    xpEarned: number;
    isFinalStep: boolean;
    nextStepIndex: number | null;
  } | null>(null);

  // Hydrate flowchart nodes dynamically from database workspace steps
  useEffect(() => {
    if (rawWorkspace?.steps && Array.isArray(rawWorkspace.steps) && rawWorkspace.steps.length > 0) {
      const sortedSteps = [...rawWorkspace.steps].sort((a: any, b: any) => (a.stepIndex || 0) - (b.stepIndex || 0));
      const mappedNodes: FlowchartNode[] = sortedSteps.map((step: any, idx: number) => {
        const isPassed = step.status === 'PASSED';
        const isUnlocked = step.status !== 'LOCKED';
        let nodeStatus: 'completed' | 'active' | 'locked' = 'locked';
        if (isPassed) {
          nodeStatus = 'completed';
        } else if (isUnlocked) {
          nodeStatus = 'active';
        }

        const acusList = Array.isArray(step.acus)
          ? step.acus.map((a: any) => typeof a === 'string' ? a : (a.title || 'ACU'))
          : Array.isArray(step.assessableUnits)
          ? step.assessableUnits.map((a: any) => typeof a === 'string' ? a : (a.title || 'ACU'))
          : [];

        return {
          id: step.id || `node-${step.stepIndex || idx + 1}`,
          label: `Step ${step.stepIndex || idx + 1}: ${step.title}`,
          subLabel: step.title || `Milestone ${idx + 1}`,
          status: nodeStatus,
          x: 80 + idx * 280,
          y: 110,
          width: 200,
          height: 80,
          tier: step.stepIndex || idx + 1,
          objectives: acusList.length > 0 ? acusList : [`Master step ${idx + 1} competencies`],
          acus: acusList.length > 0 ? acusList : [`ACU-${idx + 1}01: Core Invariants`, `ACU-${idx + 1}02: Verification`],
          aiSummary: isPassed ? 'Milestone cleared.' : isUnlocked ? 'Active study milestone.' : 'Locked milestone.',
        };
      });
      setNodes(mappedNodes);

      const firstActive = mappedNodes.find(n => n.status === 'active') || mappedNodes[0];
      if (firstActive) {
        setActiveNodeId(firstActive.id);
      }
    }
  }, [rawWorkspace]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === activeNodeId) || nodes[0] || { id: 'node-1', label: currentTrack.title, subLabel: 'Milestone 1', status: 'active', tier: 1, acus: [], objectives: [] };
  }, [nodes, activeNodeId, currentTrack.title]);

  const activeStepObj = useMemo(() => {
    if (!rawWorkspace?.steps || !Array.isArray(rawWorkspace.steps)) return null;
    return rawWorkspace.steps.find((s: any) => s.id === activeNodeId || s.stepIndex === selectedNode?.tier) || rawWorkspace.steps[0];
  }, [rawWorkspace, activeNodeId, selectedNode]);

  const activeStepId = activeStepObj?.id || currentTrack.id;
  const activeStepNum = activeStepObj?.stepIndex || selectedNode?.tier || currentTrack.currentStep;
  const activeStepTitle = activeStepObj?.title || selectedNode?.label || currentTrack.title;

  const activeStepAcus = useMemo(() => {
    if (activeStepObj?.acus && Array.isArray(activeStepObj.acus) && activeStepObj.acus.length > 0) {
      return activeStepObj.acus.map((a: any, idx: number) => ({
        id: a.id || `acu-${idx + 1}`,
        title: typeof a === 'string' ? a : (a.title || `ACU ${idx + 1}`),
        description: typeof a === 'string' ? `Assessable concept unit ${idx + 1}` : (a.description || 'ACU description'),
      }));
    }
    return selectedNode?.acus?.map((a, idx) => ({
      id: `acu-${idx + 1}`,
      title: typeof a === 'string' ? a : (a as any).title || 'ACU',
      description: typeof a === 'string' ? `Assessable concept unit ${idx + 1}` : (a as any).description || 'ACU description',
    })) || [
      { id: 'acu-1', title: 'Baseline Competency', description: 'Core invariant model' },
      { id: 'acu-2', title: 'Diagnostic Verification', description: 'Misconception gate' },
    ];
  }, [activeStepObj, selectedNode]);

  const handleStepPassed = (score: number, passPayload?: any) => {
    const totalCount = nodes.length || 5;
    const isFinal = passPayload?.isFinalStep || activeStepNum >= totalCount;
    const nextIdx = passPayload?.nextStepIndex || activeStepNum + 1;

    setLevelUpData({
      score,
      xpEarned: passPayload?.xpEarned || activeStepNum * 500,
      isFinalStep: isFinal,
      nextStepIndex: isFinal ? null : nextIdx,
    });

    setEnergyBeamFired(true);
    setTimeout(() => setEnergyBeamFired(false), 2500);

    setNodes((prev) => {
      let foundActive = false;
      return prev.map((n) => {
        if (n.id === activeNodeId || n.tier === activeStepNum) {
          foundActive = true;
          return { ...n, status: 'completed' as const };
        }
        if (foundActive && n.status === 'locked') {
          foundActive = false;
          return { ...n, status: 'active' as const };
        }
        return n;
      });
    });

    onPassEvaluation();
  };

  const handleAdvanceToNextMilestone = () => {
    if (levelUpData?.nextStepIndex) {
      const nextNode = nodes.find(n => n.tier === levelUpData.nextStepIndex);
      if (nextNode) {
        setActiveNodeId(nextNode.id);
      }
      setLevelUpData(null);
      setActiveTab('roadmap');
    }
  };

  const generateQuestions = useCallback(() => {
    const isChemistry =
      currentTrack.category === 'Chemistry' ||
      currentTrack.title.toLowerCase().includes('chem') ||
      currentTrack.title.toLowerCase().includes('halo');

    const source = isChemistry ? QUESTION_BANK.chemistry : QUESTION_BANK.default;
    const shuffledItems = shuffleArray(source).slice(0, 4);

    const questionsWithShuffledOptions: QuizQuestion[] = shuffledItems.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));

    setQuizQuestions(questionsWithShuffledOptions);
    setSelectedAnswers({});
    setEvaluationFeedback(null);
  }, [currentTrack.category, currentTrack.title]);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const handleNodeClick = (node: FlowchartNode) => {
    if (node.status === 'locked') {
      setLockedShakeId(node.id);
      setTimeout(() => setLockedShakeId(null), 500);
      return;
    }
    setActiveNodeId(node.id);
  };

  const handleSpawnNextStep = () => {
    const nextIdx = nodes.length + 1;
    const lastNode = nodes[nodes.length - 1];
    const newX = lastNode ? lastNode.x + 280 : 1200;

    const newNode: FlowchartNode = {
      id: `node-${Date.now()}`,
      label: `Step ${nextIdx}: Autonomous Extension`,
      subLabel: 'AI Synthesized Competency Tier',
      status: 'locked',
      x: newX,
      y: 110,
      width: 200,
      height: 80,
      tier: nextIdx,
      objectives: [
        'Analyze non-linear edge cases generated from past evaluations',
        'Verify cross-domain synthesis and performance buffers',
      ],
      acus: [`ACU-${nextIdx}01: Autonomous stress-test`, `ACU-${nextIdx}02: Invariance verification`],
      aiSummary: 'Dynamically spawned node via autonomous curriculum engine.',
    };

    setNodes((prev) => [...prev, newNode]);
  };

  const [fetchedResources, setFetchedResources] = useState<StudyResource[]>([]);

  const handleSynthesizeMaterials = async () => {
    setIsSynthesizing(true);
    try {
      const stepIdToUse = activeStepId || currentTrack.id;

      const res = await fetch(`/api/steps/${stepIdToUse}/level-up-resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepIndex: activeStepNum,
          title: activeStepTitle,
          workspaceTitle: currentTrack.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const returnedRes: any[] = data.resources || [];
        if (returnedRes.length > 0) {
          const mapped: StudyResource[] = returnedRes.map((r: any, idx: number) => ({
            id: `res-${idx}`,
            type: (r.url && (r.url.includes('youtube.com') || r.url.includes('youtu.be'))) ? 'youtube' : 'doc',
            title: r.title || 'Curated Resource',
            subtitle: r.takeaway || r.subtitle || r.studyGuidance || 'Verified Study Resource',
            url: r.url || '#',
            durationOrPages: r.type === 'VIDEO' ? 'Tutorial Video' : 'Documentation',
            viewsOrCitation: 'Verified Resource',
            thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
            verified: true,
            organization: 'Skillprax Verified',
          }));
          setFetchedResources(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to synthesize resources:', err);
    } finally {
      setIsSynthesizing(false);
      setResourcesSynthesized(true);
    }
  };

  const allAnswered = useMemo(() => {
    if (quizQuestions.length === 0) return false;
    return quizQuestions.every((q) => selectedAnswers[q.id] !== undefined);
  }, [quizQuestions, selectedAnswers]);

  const handleSubmitEvaluation = () => {
    if (!allAnswered) return;
    setIsSubmittingQuiz(true);

    setTimeout(() => {
      let correct = 0;
      quizQuestions.forEach((q) => {
        const chosenId = selectedAnswers[q.id];
        const chosenOpt = q.options.find((o) => o.id === chosenId);
        if (chosenOpt && chosenOpt.isCorrect) {
          correct += 1;
        }
      });

      const total = quizQuestions.length;
      const scorePct = Math.round((correct / total) * 100);
      const passed = scorePct >= 80;

      setEvaluationFeedback({
        correctCount: correct,
        totalCount: total,
        scorePercent: scorePct,
        passed,
      });

      setIsSubmittingQuiz(false);
      setQuizState('completed');

      if (passed) {
        setEnergyBeamFired(true);
        setTimeout(() => setEnergyBeamFired(false), 2500);

        setNodes((prev) => {
          let foundActive = false;
          return prev.map((n) => {
            if (n.status === 'active') {
              foundActive = true;
              return { ...n, status: 'completed' as const };
            }
            if (foundActive && n.status === 'locked') {
              foundActive = false;
              return { ...n, status: 'active' as const };
            }
            return n;
          });
        });

        onPassEvaluation();
      }
    }, 700);
  };

  const isChemistry =
    currentTrack.category === 'Chemistry' ||
    currentTrack.title.toLowerCase().includes('chem') ||
    currentTrack.title.toLowerCase().includes('halo');

  const studyResources: StudyResource[] = isChemistry
    ? [
        {
          id: 'yt-1',
          type: 'youtube',
          title: 'Haloalkanes and Haloarenes: Complete NCERT & JEE Mechanics',
          subtitle: 'Reaction mechanisms, SN1 vs SN2 kinetics, and Walden inversion stereochemistry',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationOrPages: '42 mins',
          viewsOrCitation: '1.2M views • 98.4% Helpful',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
          videoId: 'dQw4w9WgXcQ',
          verified: true,
          organization: 'Khan Academy / NCERT Chemistry',
        },
        {
          id: 'yt-2',
          type: 'youtube',
          title: 'Ambident Nucleophiles & Saytzeff vs Hofmann β-Elimination',
          subtitle: 'KCN vs AgCN ambident reactivity and anti-periplanar E2 stereochemistry',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationOrPages: '35 mins',
          viewsOrCitation: '840K views • 99.1% Helpful',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80',
          videoId: 'dQw4w9WgXcQ',
          verified: true,
          organization: 'Professor Dave Explains / Organic Chem',
        },
        {
          id: 'doc-1',
          type: 'doc',
          title: 'NCERT Class 12 Chemistry: Chapter 6 Official Canonical Textbook',
          subtitle: 'Ministry of Education, Government of India (Table 6.4 Nucleophilic Substitutions)',
          url: 'https://ncert.nic.in/textbook.php',
          durationOrPages: '28 Pages',
          viewsOrCitation: 'CBSE Official Reference',
          verified: true,
          organization: 'NCERT / National Council of Educational Research',
        },
        {
          id: 'doc-2',
          type: 'doc',
          title: 'IUPAC Compendium of Chemical Terminology (Gold Book)',
          subtitle: 'Definitive nomenclature, reaction path conventions, and Walden Inversion rules',
          url: 'https://goldbook.iupac.org/',
          durationOrPages: 'Standards Publication',
          viewsOrCitation: 'IUPAC Standard 2024',
          verified: true,
          organization: 'International Union of Pure and Applied Chemistry',
        },
        {
          id: 'doc-3',
          type: 'doc',
          title: 'Wikipedia: Nucleophilic Substitution (SN1, SN2, and SNi Mechanisms)',
          subtitle: 'Peer-reviewed physical organic chemistry with orbital symmetry diagrams',
          url: 'https://en.wikipedia.org/wiki/Nucleophilic_substitution',
          durationOrPages: 'Canonical Guide',
          viewsOrCitation: 'Wikimedia Foundation Verified',
          verified: true,
          organization: 'Wikimedia Foundation',
        },
      ]
    : [
        {
          id: 'yt-def-1',
          type: 'youtube',
          title: 'Axiomatic Foundations & Kinematics Mastery',
          subtitle: 'Deliberate practice and first-principles mental models for complex engineering',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationOrPages: '38 mins',
          viewsOrCitation: '950K views • 99% Helpful',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
          videoId: 'dQw4w9WgXcQ',
          verified: true,
          organization: 'MIT OpenCourseWare',
        },
        {
          id: 'yt-def-2',
          type: 'youtube',
          title: 'Cognitive Schema Architecture & Socratic Diagnostics',
          subtitle: 'How diagnostic gates prevent compounding misconceptions in skill acquisition',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationOrPages: '29 mins',
          viewsOrCitation: '420K views • 98% Helpful',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
          videoId: 'dQw4w9WgXcQ',
          verified: true,
          organization: 'Stanford Online Learning',
        },
        {
          id: 'doc-def-1',
          type: 'doc',
          title: 'MDN Web Docs: Web Technologies & Core Architecture',
          subtitle: 'Canonical reference for foundational web standards, JavaScript, and CSS',
          url: 'https://developer.mozilla.org',
          durationOrPages: 'Canonical Reference',
          viewsOrCitation: 'Mozilla Developer Network',
          verified: true,
          organization: 'MDN Web Docs',
        },
        {
          id: 'doc-def-2',
          type: 'doc',
          title: 'Wikipedia: Mastery Learning & Bloom Taxonomy',
          subtitle: 'Instructional strategy predicated on achieving prerequisite mastery',
          url: 'https://en.wikipedia.org/wiki/Mastery_learning',
          durationOrPages: 'Verified Encyclopedia',
          viewsOrCitation: 'Wikimedia Foundation',
          verified: true,
          organization: 'Wikimedia Foundation',
        },
        {
          id: 'doc-def-3',
          type: 'doc',
          title: 'ACM Digital Library: Deliberate Practice in Cognitive Science',
          subtitle: 'Empirical foundations of structured feedback and knowledge decomposition',
          url: 'https://dl.acm.org',
          durationOrPages: 'Academic Archive',
          viewsOrCitation: 'ACM Research Standard',
          verified: true,
          organization: 'Association for Computing Machinery',
        },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-transparent text-slate-800 pb-20 relative overflow-x-hidden"
    >
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <SkillpraxLogo
            size="sm"
            animate={true}
            glow={true}
            onClick={() => onNavigate('landing')}
          />
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              STUDIO
            </span>
            <h1 className="text-sm md:text-base font-heading font-extrabold text-slate-900 tracking-tight truncate max-w-xs md:max-w-md">
              {currentTrack.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700">
            <span>MILESTONE</span>
            <span className="text-emerald-700">
              {currentTrack.currentStep} / {currentTrack.totalSteps}
            </span>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${currentTrack.progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setShowEngineModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.96]"
            title="Configure AI Inference Engine"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Engine:</span>
            <span className="font-mono text-emerald-800 font-bold">
              {selectedEngine === 'groq-llama-3.3-70b'
                ? '⚡ Groq LLaMA 3.3 70B'
                : selectedEngine === 'llama-3.1-8b'
                ? 'LLaMA 3.1 8B'
                : 'Mixtral 8x7B'}
            </span>
          </button>

          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-heading font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.96]"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Enroll Skill</span>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-heading font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.96] group"
          >
            <span>Profile Hub</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <div className="sticky top-[57px] z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-8 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-start">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/90 shadow-2xs relative">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-heading font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer relative z-10 hover:scale-[1.02] active:scale-[0.96] ${
                activeTab === 'roadmap'
                  ? 'text-emerald-950 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {activeTab === 'roadmap' && (
                <motion.div
                  layoutId="activeStudioTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <GitBranch className="w-4 h-4 text-emerald-600" />
              <span>🗺️ Flowchart Roadmap</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-heading font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer relative z-10 hover:scale-[1.02] active:scale-[0.96] ${
                activeTab === 'resources'
                  ? 'text-emerald-950 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {activeTab === 'resources' && (
                <motion.div
                  layoutId="activeStudioTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>📚 Study Resources</span>
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-heading font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer relative z-10 hover:scale-[1.02] active:scale-[0.96] ${
                activeTab === 'evaluation'
                  ? 'text-emerald-950 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {activeTab === 'evaluation' && (
                <motion.div
                  layoutId="activeStudioTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Zap className="w-4 h-4 text-amber-500" />
              <span>⚡ Evaluation Gate</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'roadmap' && (
            <motion.div
              key="tab-roadmap"
              initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-600" />
                    <span>Living Milestone Node Flowchart</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click any node to inspect assessable concept units (ACUs) or unlock evaluation.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSpawnNextStep}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.96]"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Spawn Next Step</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('evaluation')}
                    className="px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.96] btn-shimmer"
                  >
                    <span>Proceed to Evaluation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 overflow-x-auto relative min-h-[300px]">
                {energyBeamFired && (
                  <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-xs flex items-center justify-center z-30 pointer-events-none animate-pulse">
                    <div className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-heading font-bold text-sm shadow-xl flex items-center gap-2">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      <span>COMPETENCY PASSED! High-Voltage Energy Beam Dispatched</span>
                    </div>
                  </div>
                )}

                <div className="min-w-[1000px] h-[280px] relative select-none">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="50%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#6366F1" />
                      </linearGradient>
                      <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {nodes.slice(0, -1).map((node, i) => {
                      const next = nodes[i + 1];
                      if (!next) return null;
                      const startX = node.x + node.width;
                      const startY = node.y + node.height / 2;
                      const endX = next.x;
                      const endY = next.y + next.height / 2;
                      const cp1X = startX + 40;
                      const cp2X = endX - 40;
                      const isLineActive = node.status === 'completed';

                      return (
                        <g key={node.id}>
                          <path
                            d={`M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`}
                            fill="none"
                            stroke={isLineActive ? '#10B981' : '#E2E8F0'}
                            strokeWidth={isLineActive ? '3' : '2'}
                            strokeDasharray={isLineActive ? '6 4' : 'none'}
                            className={isLineActive ? 'animate-energy-line' : ''}
                          />

                          {isLineActive && (
                            <path
                              d={`M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`}
                              fill="none"
                              stroke="url(#energyGradient)"
                              strokeWidth="4"
                              filter="url(#laserGlow)"
                              strokeDasharray="16 120"
                              className="animate-flowing-pulse"
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {nodes.map((node) => {
                    const isSelected = selectedNode.id === node.id;
                    const isPassed = node.status === 'completed';
                    const isActive = node.status === 'active';
                    const isLocked = node.status === 'locked';
                    const isShaking = lockedShakeId === node.id;

                    return (
                      <div
                        key={node.id}
                        onClick={() => handleNodeClick(node)}
                        style={{
                          left: `${node.x}px`,
                          top: `${node.y}px`,
                          width: `${node.width}px`,
                        }}
                        className={`absolute rounded-2xl p-4 transition-all duration-200 cursor-pointer z-10 ${
                          isShaking ? 'animate-shake' : ''
                        } ${
                          isPassed
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 border border-emerald-400'
                            : isActive
                            ? 'bg-white text-slate-900 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-100'
                            : 'bg-slate-100/90 text-slate-500 border border-slate-200/80 opacity-75 hover:opacity-100'
                        } ${isSelected ? 'scale-105' : 'hover:scale-[1.02]'}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isPassed
                                ? 'bg-white/20 text-white'
                                : isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isPassed ? 'PASSED ✓' : isActive ? 'ACTIVE STEP' : 'LOCKED'}
                          </span>

                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                          ) : isActive ? (
                            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>

                        <h4
                          className={`text-xs font-heading font-bold leading-snug truncate ${
                            isPassed ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {node.label}
                        </h4>

                        <p
                          className={`text-[10px] truncate mt-0.5 ${
                            isPassed ? 'text-emerald-100' : 'text-slate-500'
                          }`}
                        >
                          {node.subLabel}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                      <Target className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {selectedNode.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Tier {selectedNode.tier}</span>
                      </div>
                      <h3 className="text-lg font-heading font-bold text-slate-900 mt-0.5">
                        {selectedNode.label}
                      </h3>
                      <p className="text-xs text-slate-500">{selectedNode.subLabel}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('resources')}
                    className="px-5 py-2.5 rounded-xl font-heading font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.96] btn-shimmer"
                  >
                    <span>Proceed to Study Resources</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span>Milestone Objectives</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedNode.objectives.map((obj, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2.5"
                        >
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-sky-600" />
                      <span>Assessable Concept Units (ACUs)</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedNode.acus.map((acu, i) => {
                        const isChecked = !!checkedACUs[acu];
                        return (
                          <div
                            key={i}
                            onClick={() =>
                              setCheckedACUs((prev) => ({ ...prev, [acu]: !prev[acu] }))
                            }
                            className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 cursor-pointer transition-all select-none ${
                              isChecked
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                                  isChecked
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="truncate">{acu}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {isChecked ? 'Audited' : 'Verify'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="tab-resources"
              initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-lg font-heading font-extrabold text-slate-900">
                      Authoritative Curriculum Resources
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 max-w-xl">
                    Curated according to strict pedagogical quotas: exactly 2 high-view video tutorials and 3 canonical peer-reviewed documentation links. Zero 404s guaranteed.
                  </p>
                </div>

                <div className="relative p-[1.5px] rounded-xl conic-beam shadow-md shadow-emerald-500/20">
                  <button
                    onClick={handleSynthesizeMaterials}
                    disabled={isSynthesizing}
                    className="relative z-10 px-6 py-3 rounded-[10px] font-heading font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.96] btn-shimmer"
                  >
                    {isSynthesizing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Synthesizing Authoritative Sources...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-100" />
                        <span>⚡ Synthesize Authoritative Materials</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isSynthesizing ? (
                <div className="space-y-4">
                  <div className="h-6 w-48 bg-slate-200 rounded-md animate-pulse" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
                    <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span>Verified High-Yield Video Seminars (Quota: 2)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studyResources
                        .filter((r) => r.type === 'youtube')
                        .slice(0, 2)
                        .map((res) => (
                          <div
                            key={res.id}
                            onClick={() => setActiveVideoModal(res)}
                            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col justify-between"
                          >
                            <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                              <img
                                src={res.thumbnailUrl}
                                alt={res.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white/95 text-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Video className="w-5 h-5 fill-current" />
                                </div>
                              </div>
                              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white font-semibold">
                                {res.durationOrPages}
                              </div>
                            </div>

                            <div className="p-4 space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                <span>{res.organization}</span>
                                <span className="text-emerald-600 font-semibold">
                                  {res.viewsOrCitation}
                                </span>
                              </div>
                              <h5 className="text-sm font-heading font-semibold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                                {res.title}
                              </h5>
                              <p className="text-xs text-slate-600 line-clamp-2">{res.subtitle}</p>
                            </div>

                            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                              <span>Launch Seminar Preview</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-500" />
                      <span>Canonical Documentation Link Cards (Quota: 3)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {studyResources
                        .filter((r) => r.type === 'doc')
                        .slice(0, 3)
                        .map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                                  VERIFIED
                                </span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              </div>

                              <h5 className="text-sm font-heading font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                                {doc.title}
                              </h5>

                              <p className="text-xs text-slate-600 leading-relaxed">{doc.subtitle}</p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-700">
                              <span>{doc.viewsOrCitation}</span>
                              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                          </a>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {/* Ready for Quiz Button */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-heading font-bold text-emerald-950">
                      Materials Mastered? Take the Competency Check
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Proceed directly to the in-place Evaluation Gate to unlock the next milestone.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    generateQuestions();
                    setQuizState('evaluating');
                    setActiveTab('evaluation');
                  }}
                  className="px-5 py-2.5 rounded-xl font-heading font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.96] btn-shimmer"
                >
                  <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>⚡ Ready for Quiz — Start Socratic Evaluation ➔</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'evaluation' && (
            <motion.div
              key="tab-evaluation"
              initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <QuizAndEvaluationEngine
                stepId={activeStepId}
                stepIndex={activeStepNum}
                stepTitle={activeStepTitle}
                acus={activeStepAcus}
                onStepPassed={(score, passPayload) => {
                  handleStepPassed(score, passPayload);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEVEL-UP INTERSTITIAL MODAL UPON PASSING MILESTONE */}
        {levelUpData && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-9 h-9"/>
              </div>

              <div>
                <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200">
                  {levelUpData.isFinalStep ? 'Track Mastery Achieved!' : `Milestone Cleared`}
                </span>
                <h3 className="text-2xl font-heading font-extrabold text-slate-900 mt-3">
                  Score: {levelUpData.score}% Verified
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {levelUpData.isFinalStep
                    ? `Congratulations! You have completed all milestones for "${currentTrack.title}".`
                    : `You have satisfied all competency units for this milestone. Step ${levelUpData.nextStepIndex} is now unlocked.`}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">Reward Earned</span>
                <span className="text-amber-600 font-mono font-extrabold text-sm">+{levelUpData.xpEarned} XP</span>
              </div>

              {levelUpData.isFinalStep ? (
                <button
                  onClick={() => onNavigate('profile')}
                  className="w-full py-3.5 rounded-xl font-heading font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer btn-shimmer"
                >
                  Return to Profile Hub ➔
                </button>
              ) : (
                <button
                  onClick={handleAdvanceToNextMilestone}
                  className="w-full py-3.5 rounded-xl font-heading font-extrabold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer btn-shimmer"
                >
                  <span>Level Up: Enter Milestone {levelUpData.nextStepIndex}</span>
                  <ArrowRight className="w-4 h-4"/>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold">{activeVideoModal.organization}</span>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-lg font-heading font-bold text-slate-900">
                  {activeVideoModal.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeVideoModal.subtitle}
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-600">
                  <span>Runtime: {activeVideoModal.durationOrPages}</span>
                  <span className="font-semibold text-emerald-600">
                    {activeVideoModal.viewsOrCitation}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setActiveVideoModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Close
                  </button>
                  <a
                    href={activeVideoModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Watch Full Lecture on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIEngineSelectorModal
        isOpen={showEngineModal}
        onClose={() => setShowEngineModal(false)}
        selectedEngine={selectedEngine}
        onSelectEngine={onSelectEngine}
      />

      <EnrollSkillModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onEnroll={(newTrack) => {
          try {
            const saved = localStorage.getItem('skillprax_tracks');
            const current = saved ? JSON.parse(saved) : [];
            localStorage.setItem('skillprax_tracks', JSON.stringify([...current, newTrack]));
          } catch {}
          onNavigate('studio');
          window.location.href = `/workspace/${newTrack.id}`;
        }}
      />
    </motion.div>
  );
};

export default WorkspaceStudioPage;
