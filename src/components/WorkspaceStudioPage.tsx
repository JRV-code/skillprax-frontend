'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SkillTrack, FlowchartNode, AIEngine, StudyResource, QuizQuestion } from '@/types';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { AIEngineSelectorModal } from '@/components/AIEngineSelectorModal';
import { QuizAndEvaluationEngine } from '@/components/QuizAndEvaluationEngine';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { InAppYouTubePlayerModal } from '@/components/InAppYouTubePlayerModal';
import { InAppContentReaderModal } from '@/components/InAppContentReaderModal';
import { SportsStepTracker } from '@/components/workspace/SportsStepTracker';
import { DrillCardWithTimer } from '@/components/sports/DrillCardWithTimer';
import { StepApproachBrief, ApproachBrief } from '@/components/workspace/StepApproachBrief';
import { StudyBook, TopicItem, ResourceItem } from '@/components/workspace/StudyBook';
import { warmUpYouTube } from '@/components/InAppYouTubePlayerModal';
import {
  Activity,
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
import confetti from 'canvas-confetti';

interface WorkspaceStudioPageProps {
  currentTrack: SkillTrack;
  rawWorkspace?: any;
  onNavigate: (page: 'landing' | 'profile' | 'studio') => void;
  selectedEngine: AIEngine;
  onSelectEngine: (engine: AIEngine) => void;
  onPassEvaluation: () => void;
}

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
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

  // Raw database steps sorted by index
  const dbSteps = useMemo(() => {
    if (!rawWorkspace?.steps || !Array.isArray(rawWorkspace.steps) || rawWorkspace.steps.length === 0) {
      return [];
    }
    return [...rawWorkspace.steps].sort((a: any, b: any) => (a.stepIndex || 0) - (b.stepIndex || 0));
  }, [rawWorkspace]);

  // ACTIVE STEP: Current database milestone being worked through
  const activeStepIndex = useMemo(() => {
    if (dbSteps.length === 0) return currentTrack.currentStep || 1;
    const firstUnpassed = dbSteps.find((s: any) => s.status !== 'PASSED');
    return firstUnpassed ? (firstUnpassed.stepIndex || 1) : dbSteps.length;
  }, [dbSteps, currentTrack.currentStep]);

  // VIEWING STEP: Decoupled milestone currently inspected on screen
  const [viewingStepIndex, setViewingStepIndex] = useState<number>(activeStepIndex);

  // Sync viewingStepIndex if activeStepIndex advances after passing
  useEffect(() => {
    setViewingStepIndex(activeStepIndex);
  }, [activeStepIndex]);

  // Flowchart node graph state
  const [nodes, setNodes] = useState<FlowchartNode[]>([]);
  const [lockedShakeId, setLockedShakeId] = useState<string | null>(null);

  // Hydrate flowchart nodes dynamically from database steps with strict decoupled states
  useEffect(() => {
    if (dbSteps.length > 0) {
      const mappedNodes: FlowchartNode[] = dbSteps.map((step: any, idx: number) => {
        const stepNum = step.stepIndex || idx + 1;
        const isPassed = step.status === 'PASSED' || stepNum < activeStepIndex;
        const isActive = stepNum === activeStepIndex;

        let nodeStatus: 'completed' | 'active' | 'locked' = 'locked';
        if (isPassed) {
          nodeStatus = 'completed';
        } else if (isActive) {
          nodeStatus = 'active';
        }

        const acusList = Array.isArray(step.acus)
          ? step.acus.map((a: any) => typeof a === 'string' ? a : (a.title || 'ACU'))
          : Array.isArray(step.assessableUnits)
            ? step.assessableUnits.map((a: any) => typeof a === 'string' ? a : (a.title || 'ACU'))
            : [];

        return {
          id: step.id || `node-${stepNum}`,
          label: `Step ${stepNum}: ${step.title}`,
          subLabel: step.title || `Milestone ${stepNum}`,
          status: nodeStatus,
          x: 80 + idx * 280,
          y: 110,
          width: 210,
          height: 85,
          tier: stepNum,
          objectives: acusList.length > 0 ? acusList : [`Master step ${stepNum} competencies`],
          acus: acusList.length > 0 ? acusList : [`ACU-${stepNum}01: Core Invariants`, `ACU-${stepNum}02: Verification`],
          aiSummary: isPassed ? 'Milestone cleared.' : isActive ? 'Active study milestone.' : 'Locked milestone.',
        };
      });
      setNodes(mappedNodes);
    } else {
      // Fallback 4 initial nodes
      const fallbackNodes: FlowchartNode[] = [
        {
          id: 'node-1',
          label: 'Step 1: Core Fundamentals & Stance',
          subLabel: 'Core Mechanics & First Principles',
          status: activeStepIndex > 1 ? 'completed' : 'active',
          x: 80,
          y: 110,
          width: 210,
          height: 85,
          tier: 1,
          objectives: ['Master fundamental principles and initial posture', 'Verify prerequisite safety and mechanics'],
          acus: ['ACU-101: Foundation mechanics verification', 'ACU-102: Execution audit'],
          aiSummary: 'Core fundamental baseline established.',
        },
        {
          id: 'node-2',
          label: 'Step 2: Core Dynamics & Execution',
          subLabel: 'Active Socratic Learning Node',
          status: activeStepIndex === 2 ? 'active' : activeStepIndex > 2 ? 'completed' : 'locked',
          x: 360,
          y: 110,
          width: 210,
          height: 85,
          tier: 2,
          objectives: ['Execute primary operational steps under steady-state conditions'],
          acus: ['ACU-201: Procedural synthesis execution', 'ACU-202: Trajectory verification'],
          aiSummary: 'Active study node currently loaded.',
        },
        {
          id: 'node-3',
          label: 'Step 3: Socratic Diagnostic Synthesis',
          subLabel: 'Formative Gate & Misconceptions',
          status: 'locked',
          x: 640,
          y: 110,
          width: 210,
          height: 85,
          tier: 3,
          objectives: ['Isolate false intuitive assumptions under high-pressure scenarios'],
          acus: ['ACU-301: Misconception diagnostic analysis', 'ACU-302: Edge-case fault recovery'],
          aiSummary: 'Diagnostic synthesis gate locked.',
        },
      ];
      setNodes(fallbackNodes);
    }
  }, [dbSteps, activeStepIndex]);

  // Selected step object corresponding to VIEWING step index
  const viewingStepObj = useMemo(() => {
    if (dbSteps.length === 0) return null;
    return dbSteps.find((s: any) => s.stepIndex === viewingStepIndex) || dbSteps[0];
  }, [dbSteps, viewingStepIndex]);

  const viewingStepId = viewingStepObj?.id || currentTrack.id;
  const viewingStepNum = viewingStepObj?.stepIndex || viewingStepIndex;
  const viewingStepTitle = viewingStepObj?.title || `Milestone ${viewingStepIndex}`;

  // Check if learner is in Retrospective Review Mode
  const isReviewMode = viewingStepIndex < activeStepIndex && viewingStepObj?.status === 'PASSED';

  // Check if active skill has physical/athletic dual-gate requirements
  const isPhysical = useMemo(() => {
    const dCat = currentTrack.domainCategory || (rawWorkspace as any)?.domainCategory || (rawWorkspace as any)?.category || '';
    const dName = (currentTrack as any)?.domain || (rawWorkspace as any)?.domain || '';
    const sCat = (rawWorkspace as any)?.skill_category || '';
    const title = (currentTrack.title || (rawWorkspace as any)?.title || '').toLowerCase();
    const isSportTitle = ['cricket', 'football', 'soccer', 'swimming', 'tennis', 'badminton', 'basketball', 'sprint', 'athletics'].some(s => title.includes(s));
    return dCat === 'Athletics' || dName === 'Athletics' || sCat === 'physical' || isSportTitle;
  }, [currentTrack, rawWorkspace]);

  const viewingStepAcus: { id: string; title: string; description: string }[] = useMemo(() => {
    if (viewingStepObj?.acus && Array.isArray(viewingStepObj.acus) && viewingStepObj.acus.length > 0) {
      return viewingStepObj.acus.map((a: any, idx: number) => ({
        id: a.id || `acu-${idx + 1}`,
        title: typeof a === 'string' ? a : (a.title || `ACU ${idx + 1}`),
        description: typeof a === 'string' ? `Assessable concept unit ${idx + 1}` : (a.description || 'ACU description'),
      }));
    }
    if (viewingStepObj?.assessableUnits && Array.isArray(viewingStepObj.assessableUnits)) {
      return viewingStepObj.assessableUnits.map((a: any, idx: number) => ({
        id: a.id || `acu-${idx + 1}`,
        title: typeof a === 'string' ? a : (a.title || `ACU ${idx + 1}`),
        description: typeof a === 'string' ? `Assessable concept unit ${idx + 1}` : (a.description || 'ACU description'),
      }));
    }
    return [
      { id: 'acu-1', title: 'Baseline Competency', description: 'Core invariant model' },
      { id: 'acu-2', title: 'Diagnostic Verification', description: 'Misconception gate' },
    ];
  }, [viewingStepObj]);

  const [checkedACUs, setCheckedACUs] = useState<Record<string, boolean>>({});
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [energyBeamFired, setEnergyBeamFired] = useState<boolean>(false);
  const [levelUpData, setLevelUpData] = useState<{
    score: number;
    xpEarned: number;
    isFinalStep: boolean;
    nextStepIndex: number | null;
  } | null>(null);

  // In-App Modal States
  const [activeYouTubeModal, setActiveYouTubeModal] = useState<{
    isOpen: boolean;
    videoId: string | null;
    title: string;
    channelOrAuthor: string;
    focusNote?: string;
    takeaway: string;
    embeddable?: boolean;
  }>({
    isOpen: false,
    videoId: null,
    title: '',
    channelOrAuthor: '',
    takeaway: '',
    embeddable: true,
  });

  const [activeReaderModal, setActiveReaderModal] = useState<{
    isOpen: boolean;
    title: string;
    documentId?: string;
    sourceUrl: string;
    sourceBadge: string;
    sourceType?: string;
    takeaway: string;
    corePrinciple: string;
    mechanics: string[];
    commonTraps: string[];
    fullContentMarkdown?: string;
    documentationQuadrants?: any;
    documentationMarkdown?: string;
    documentationSourceUrl?: string;
    focusNote?: string;
    initialTopicKey?: string;
    topicMap?: TopicItem[];
  }>({
    isOpen: false,
    title: '',
    sourceUrl: '',
    sourceBadge: 'Documentation',
    takeaway: '',
    corePrinciple: '',
    mechanics: [],
    commonTraps: [],
  });

  // Step Guide and Study Book State Map (Keyed strictly by Step ID)
  interface StepGuideState {
    stepId: string;
    difficultyTier?: string;
    approachViewedAt?: string | null;
    resources: any[];
    document?: any;
    topicMap: TopicItem[];
    approachBrief: ApproachBrief | null;
  }
  const [stepGuides, setStepGuides] = useState<Record<string, StepGuideState>>({});
  const [isGeneratingApproach, setIsGeneratingApproach] = useState<boolean>(false);

  const handleNodeClick = (node: FlowchartNode) => {
    if (node.status === 'locked') {
      setLockedShakeId(node.id);
      setTimeout(() => setLockedShakeId(null), 500);
      return;
    }
    // Decoupled state: clicking passed or active milestone sets viewingStepIndex without modifying database activeStepIndex
    setViewingStepIndex(node.tier);
  };

  const handleStepPassed = (score: number, passPayload?: any) => {
    const totalCount = nodes.length || 5;
    const isFinal = passPayload?.isFinalStep || viewingStepNum >= totalCount;
    const nextIdx = passPayload?.nextStepIndex || activeStepIndex + 1;

    setLevelUpData({
      score,
      xpEarned: passPayload?.xpEarned || viewingStepNum * 500,
      isFinalStep: isFinal,
      nextStepIndex: isFinal ? null : nextIdx,
    });

    if (typeof window !== 'undefined') {
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.55 },
        });
      } catch (_) {}
    }

    setEnergyBeamFired(true);
    setTimeout(() => setEnergyBeamFired(false), 2500);

    // If passed the active milestone, update progression and advance
    if (viewingStepIndex === activeStepIndex) {
      onPassEvaluation();
      setViewingStepIndex(nextIdx);
    }
  };

  const handleAdvanceToNextMilestone = () => {
    if (levelUpData?.nextStepIndex) {
      const nextIdx = levelUpData.nextStepIndex;
      setNodes((prev) =>
        prev.map((n) => {
          if (n.tier < nextIdx) return { ...n, status: 'completed' as const };
          if (n.tier === nextIdx) return { ...n, status: 'active' as const };
          return n;
        })
      );
      setViewingStepIndex(nextIdx);
      setLevelUpData(null);
      setActiveTab('roadmap');
    }
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
      width: 210,
      height: 85,
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

  // Fetch Step Guide with Study Book & Game Plan strictly keyed by stepId (no shared cache)
  const fetchStepGuide = useCallback(async (stepId: string) => {
    if (!stepId) return;
    try {
      const res = await fetch(`/api/steps/${stepId}/guide`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStepGuides((prev) => ({
          ...prev,
          [stepId]: {
            stepId: data.stepId || stepId,
            difficultyTier: data.difficultyTier,
            approachViewedAt: data.approachViewedAt,
            resources: Array.isArray(data.resources) ? data.resources : [],
            document: data.document,
            topicMap: Array.isArray(data.topicMap) ? data.topicMap : [],
            approachBrief: data.approachBrief || null,
          },
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch guide for step:', stepId, err);
    }
  }, []);

  useEffect(() => {
    if (viewingStepId) {
      fetchStepGuide(viewingStepId);
    }
  }, [viewingStepId, fetchStepGuide]);
  const [physicalDrills, setPhysicalDrills] = useState<any[]>([]);
  const [loadingDrills, setLoadingDrills] = useState<boolean>(false);

  useEffect(() => {
    if (!isPhysical) return;

    let isMounted = true;
    async function loadDrills() {
      try {
        setLoadingDrills(true);
        const res = await fetch('/api/sports/drills/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sportName: currentTrack.title || 'Athletics',
            stepNumber: viewingStepNum,
            stepTitle: viewingStepTitle,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.drills) && data.drills.length > 0 && isMounted) {
            setPhysicalDrills(
              data.drills.map((d: any, idx: number) => ({
                id: d.id || `drill-${viewingStepNum}-${idx + 1}`,
                title: d.title || `${currentTrack.title} Step ${viewingStepNum} Drill ${idx + 1}`,
                durationMinutes: d.durationMinutes || 12,
                technicalFocusPoints: Array.isArray(d.instructions) && d.instructions.length > 0
                  ? d.instructions.slice(0, 3)
                  : Array.isArray(d.focusPoints) && d.focusPoints.length > 0
                  ? d.focusPoints.slice(0, 3)
                  : [
                      'Maintain low center of gravity and athletic alignment',
                      'Execute fluid kinetic energy transfer through core levers',
                      'Decelerate smoothly at end range without joint locking',
                    ],
                isCompleted: Boolean(d.completed),
              }))
            );
            return;
          }
        }
      } catch (err) {
        console.warn('Drill fetch error:', err);
      } finally {
        if (isMounted) setLoadingDrills(false);
      }

      if (isMounted) {
        setPhysicalDrills([
          {
            id: `drill-${viewingStepNum}-1`,
            title: `${currentTrack.title} Step ${viewingStepNum} — Foundational Mechanical Stance`,
            durationMinutes: 10,
            technicalFocusPoints: [
              'Feet shoulder-width apart, knees unlocked and active',
              'Core firmly engaged to stabilize rotational torque',
              'Rhythmic nasal breathing to manage heart-rate spikes',
            ],
            isCompleted: false,
          },
          {
            id: `drill-${viewingStepNum}-2`,
            title: `${currentTrack.title} Step ${viewingStepNum} — Dynamic Kinetic Sequencing`,
            durationMinutes: 15,
            technicalFocusPoints: [
              'Initiate acceleration burst from lower kinetic chain',
              'Follow through clean line toward target coordinate',
              'Execute 8 reps per set with 45s recovery intervals',
            ],
            isCompleted: false,
          },
          {
            id: `drill-${viewingStepNum}-3`,
            title: `${currentTrack.title} Step ${viewingStepNum} — Fatigue Resistance Pressure Test`,
            durationMinutes: 12,
            technicalFocusPoints: [
              'Maintain postural precision under elevated heart rate',
              'Track and eliminate mechanical form breakdown cues',
              'Conclude with 3-minute tissue mobility cooldown',
            ],
            isCompleted: false,
          },
        ]);
      }
    }

    loadDrills();
    return () => {
      isMounted = false;
    };
  }, [isPhysical, viewingStepNum, viewingStepTitle, currentTrack.title]);

  const handlePhysicalDrillComplete = async (drillTitle: string) => {
    setPhysicalDrills((prev) =>
      prev.map((d) => (d.title === drillTitle ? { ...d, isCompleted: true } : d))
    );

    try {
      const res = await fetch('/api/sports/drills/complete-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: currentTrack.id,
          stepNumber: viewingStepNum,
          drillTitle,
          userId: typeof window !== 'undefined' ? localStorage.getItem('skillprax_active_profile_id') || 'default-profile' : 'default-profile',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (viewingStepObj) {
          viewingStepObj.practiceDaysCompleted = data.practiceDaysCompleted;
          viewingStepObj.practice_days_completed = data.practiceDaysCompleted;
        }
      }
    } catch (err) {
      console.warn('Failed to sync complete-day API:', err);
    }
  };

  const handleSynthesizeMaterials = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch(`/api/steps/${viewingStepId}/level-up-resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepIndex: viewingStepNum,
          title: viewingStepTitle,
          workspaceTitle: currentTrack.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStepGuides((prev) => ({
          ...prev,
          [viewingStepId]: {
            stepId: viewingStepId,
            difficultyTier: data.tier || data.step?.difficultyTier,
            approachViewedAt: data.step?.approachViewedAt,
            resources: Array.isArray(data.resources) ? data.resources : [],
            document: data.document,
            topicMap: Array.isArray(data.topicMap) ? data.topicMap : [],
            approachBrief: data.approachBrief || null,
          },
        }));
      }
    } catch (err) {
      console.error('Failed to synthesize resources:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleApproachViewed = async () => {
    try {
      await fetch(`/api/steps/${viewingStepId}/approach-viewed`, { method: 'POST' });
      setStepGuides((prev) => ({
        ...prev,
        [viewingStepId]: {
          ...(prev[viewingStepId] || { stepId: viewingStepId, topicMap: [], resources: [], approachBrief: null }),
          approachViewedAt: new Date().toISOString(),
        },
      }));
    } catch (_) {}
  };

  const handleGenerateApproach = async () => {
    setIsGeneratingApproach(true);
    try {
      const res = await fetch(`/api/steps/${viewingStepId}/approach`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStepGuides((prev) => ({
          ...prev,
          [viewingStepId]: {
            ...(prev[viewingStepId] || { stepId: viewingStepId, topicMap: [], resources: [] }),
            approachBrief: data.approachBrief,
            approachViewedAt: data.approachViewedAt || null,
          },
        }));
      }
    } catch (err) {
      console.warn('Failed to generate approach brief:', err);
    } finally {
      setIsGeneratingApproach(false);
    }
  };

  const handleRetryTopic = async (topicKey: string) => {
    try {
      const res = await fetch(`/api/steps/${viewingStepId}/topics/${topicKey}/retry`, { method: 'POST' });
      if (res.ok) {
        await fetchStepGuide(viewingStepId);
      }
    } catch (err) {
      console.warn('Failed to retry topic:', err);
    }
  };

  const handleReplaceResource = async (resourceId: string) => {
    try {
      const res = await fetch(`/api/resources/${resourceId}/replace`, { method: 'POST' });
      if (res.ok) {
        await fetchStepGuide(viewingStepId);
      }
    } catch (err) {
      console.warn('Failed to replace resource:', err);
    }
  };

  // Current step's scoped guide and resources (zero leakage across steps)
  const currentGuide = stepGuides[viewingStepId];
  const currentTopicMap: TopicItem[] = currentGuide?.topicMap || [];
  const currentApproachBrief = currentGuide?.approachBrief || null;
  const currentApproachViewedAt = currentGuide?.approachViewedAt || viewingStepObj?.approachViewedAt || null;
  const currentDifficultyTier = currentGuide?.difficultyTier || viewingStepObj?.difficultyTier || 'FOUNDATIONS';
  const hasGuideMarkdown = Boolean(currentGuide?.document?.markdown);

  const studyBookResources: ResourceItem[] = useMemo(() => {
    const raw = (currentGuide?.resources && currentGuide.resources.length > 0)
      ? currentGuide.resources
      : (viewingStepObj?.resources ? (Array.isArray(viewingStepObj.resources) ? viewingStepObj.resources : []) : []);

    return raw.map((r: any, idx: number) => {
      const vId = r.videoId || extractYouTubeId(r.url);
      const isVideo = r.type === 'VIDEO' || r.type === 'video' || Boolean(vId);
      return {
        id: r.id || `res-${idx}`,
        type: isVideo ? 'video' : 'doc',
        title: r.title || 'Curated Study Resource',
        url: r.url || '#',
        videoId: vId,
        channelName: r.channelName || r.platform || null,
        embeddable: r.embeddable !== false,
        topicKey: r.topicKey || null,
        focusNote: r.focusNote || r.takeaway || r.subtitle || null,
        snippet: r.snippet || null,
        linkStatus: r.linkStatus || 'UNCHECKED',
        checkedAt: r.checkedAt,
        sourceType: r.sourceType,
      };
    });
  }, [currentGuide?.resources, viewingStepObj?.resources]);

  const activeStepResources: StudyResource[] = useMemo(() => {
    return studyBookResources.map((r, idx) => ({
      id: r.id || `res-${idx}`,
      type: r.type === 'video' ? 'youtube' : 'doc',
      title: r.title,
      subtitle: r.focusNote || 'Verified Study Resource',
      url: r.url,
      durationOrPages: r.type === 'video' ? 'YouTube Tutorial' : 'Documentation',
      viewsOrCitation: r.channelName || 'SKILL-TRACK Verified',
      verified: r.linkStatus === 'VERIFIED',
      organization: 'SKILL-TRACK Verified',
    }));
  }, [studyBookResources]);

  const handleOpenReader = (chapterTopicKey?: string, viewMode?: 'summary' | 'full') => {
    const doc = currentGuide?.document;
    setActiveReaderModal({
      isOpen: true,
      title: viewingStepTitle,
      documentId: doc?.id,
      sourceUrl: doc?.sourceUrl || '#',
      sourceBadge: doc?.sourceType === 'WIKIPEDIA' ? 'Wikipedia Pedagogy' : 'Verified Pedagogy',
      sourceType: doc?.sourceType || 'TAVILY',
      corePrinciple: doc?.quadrants?.principle || undefined,
      mechanics: Array.isArray(doc?.quadrants?.mechanics) ? doc.quadrants.mechanics : undefined,
      commonTraps: Array.isArray(doc?.quadrants?.traps) ? doc.quadrants.traps : undefined,
      takeaway: doc?.quadrants?.principle || undefined,
      fullContentMarkdown: doc?.markdown || '',
      documentationQuadrants: doc?.quadrants || {},
      documentationMarkdown: doc?.markdown || '',
      documentationSourceUrl: doc?.sourceUrl || '#',
      initialTopicKey: chapterTopicKey,
      topicMap: currentTopicMap,
    });
  };

  const handleOpenPlayer = (videoId: string, title?: string, channel?: string, focusNote?: string) => {
    setActiveYouTubeModal({
      isOpen: true,
      videoId,
      title: title || viewingStepTitle,
      channelOrAuthor: channel || 'Curated Video Tutorial',
      focusNote: focusNote || undefined,
      takeaway: focusNote || 'Focus on the mechanics and execution demonstrated.',
      embeddable: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-transparent text-slate-800 pb-20 relative overflow-x-hidden"
    >
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <SkillTrackLogo
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
            <span>ACTIVE MILESTONE</span>
            <span className="text-emerald-700">
              {activeStepIndex} / {currentTrack.totalSteps}
            </span>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.round(((activeStepIndex - 1) / (currentTrack.totalSteps || 5)) * 100)}%` }}
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

      {/* Tabs Navigation Strip */}
      <div className="sticky top-[57px] z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-8 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-start">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/90 shadow-2xs relative">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-heading font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer relative z-10 hover:scale-[1.02] active:scale-[0.96] ${activeTab === 'roadmap'
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
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-heading font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer relative z-10 hover:scale-[1.02] active:scale-[0.96] ${activeTab === 'resources'
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
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-heading font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer relative z-10 hover:scale-[1.02] active:scale-[0.96] ${activeTab === 'evaluation'
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
              <span>⚡ Socratic Gate (70%)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
        {/* RETROSPECTIVE REVIEW MODE PERSISTENT BANNER */}
        <AnimatePresence>
          {isReviewMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-amber-50/95 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-heading font-bold text-amber-950">
                    Viewing Milestone {viewingStepNum}: {viewingStepTitle} (Completed)
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    You can review past documentation, re-watch video tutorials, or retake the evaluation anytime without altering active progression.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingStepIndex(activeStepIndex)}
                className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.96]"
              >
                <span>Return to Current Active Milestone (Step {activeStepIndex})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
              {/* Stepper Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-600" />
                    <span>Interactive Living Flowchart Stepper</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click any passed milestone to enter Retrospective Review Mode, or click the active milestone to advance.
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

              {/* FLOWCHART CANVAS */}
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
                  {/* SVG CONNECTORS (Solid emerald for passed, dotted slate for locked) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="50%" stopColor="#0284C7" />
                        <stop offset="100%" stopColor="#10B981" />
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

                      const isPassedLine = node.status === 'completed' && next.status === 'completed';
                      const isActiveTransition = node.status === 'completed' && next.status === 'active';

                      return (
                        <g key={node.id}>
                          {/* Base connector line */}
                          <path
                            d={`M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`}
                            fill="none"
                            stroke={isPassedLine ? '#10B981' : isActiveTransition ? '#0284C7' : '#CBD5E1'}
                            strokeWidth={isPassedLine || isActiveTransition ? '3' : '2'}
                            strokeDasharray={isPassedLine ? 'none' : '6 6'}
                          />

                          {/* Glowing active flow particle */}
                          {isActiveTransition && (
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

                  {/* STEP NODES (PASSED, ACTIVE, LOCKED) */}
                  {nodes.map((node) => {
                    const isViewing = viewingStepIndex === node.tier;
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
                        className={`absolute rounded-2xl p-4 transition-all duration-200 cursor-pointer z-10 ${isShaking ? 'animate-shake' : ''
                          } ${isPassed
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 border border-emerald-400'
                            : isActive
                              ? 'bg-white text-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-100'
                              : 'bg-slate-100/90 text-slate-400 border border-slate-200/80 opacity-75 hover:opacity-100'
                          } ${isViewing ? 'ring-2 ring-sky-500 scale-105' : 'hover:scale-[1.02]'}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isPassed
                                ? 'bg-white/20 text-white'
                                : isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                          >
                            {isPassed ? 'PASSED ✓' : isActive ? 'ACTIVE STEP' : 'LOCKED'}
                          </span>

                          {isPassed ? (
                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : isActive ? (
                            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>

                        <h4
                          className={`text-xs font-heading font-bold leading-snug truncate ${isPassed ? 'text-white' : 'text-slate-900'
                            }`}
                        >
                          {node.label}
                        </h4>

                        <p
                          className={`text-[10px] truncate mt-0.5 ${isPassed ? 'text-emerald-100' : 'text-slate-500'
                            }`}
                        >
                          {node.subLabel}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* INSPECTOR CARD FOR CURRENTLY VIEWED MILESTONE */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                      <Target className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {isReviewMode ? 'REVIEW MODE' : viewingStepObj?.status || 'ACTIVE'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Milestone {viewingStepNum}</span>
                      </div>
                      <h3 className="text-lg font-heading font-bold text-slate-900 mt-0.5">
                        {viewingStepTitle}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isReviewMode ? 'Completed Milestone — Available for Retrospective Review' : 'Target Milestone Objectives & ACU Competencies'}
                      </p>
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
                  {/* Milestone Objectives */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span>Milestone Objectives</span>
                    </h4>
                    <div className="space-y-2">
                      {(viewingStepObj?.whatYouWillLearn ? [viewingStepObj.whatYouWillLearn] : [`Master milestone ${viewingStepNum} core operational standards`]).map((obj: string, i: number) => (
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

                  {/* Assessable Concept Units */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-sky-600" />
                      <span>Assessable Concept Units (ACUs)</span>
                    </h4>
                    <div className="space-y-2">
                      {viewingStepAcus.map((acu: { id: string; title: string; description: string }, i: number) => {
                        const isChecked = !!checkedACUs[acu.title];
                        return (
                          <div
                            key={i}
                            onClick={() =>
                              setCheckedACUs((prev) => ({ ...prev, [acu.title]: !prev[acu.title] }))
                            }
                            className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 cursor-pointer transition-all select-none ${isChecked
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${isChecked
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 bg-white'
                                  }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="truncate">{acu.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {isChecked ? 'Verified' : 'Audit'}
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
              {/* DUAL-GATE PRACTICE CALENDAR FOR PHYSICAL / ATHLETIC SKILLS */}
              {isPhysical && (
                <SportsStepTracker
                  skillId={currentTrack.id}
                  stepNumber={viewingStepNum}
                  stepTitle={viewingStepTitle}
                  skillCategory="physical"
                  requiredPracticeDays={viewingStepObj?.requiredPracticeDays || viewingStepObj?.required_practice_days || 3}
                  practiceDaysCompleted={viewingStepObj?.practiceDaysCompleted || viewingStepObj?.practice_days_completed || 0}
                  quizPassed={viewingStepObj?.quizPassed || viewingStepObj?.quiz_passed || (viewingStepObj?.status === 'PASSED')}
                  quizScore={viewingStepObj?.quizScore || viewingStepObj?.quiz_score || (viewingStepObj?.status === 'PASSED' ? 85 : null)}
                  dailyDietPlan={viewingStepObj?.dailyDietPlan || viewingStepObj?.daily_diet_plan || null}
                  onPracticeDayComplete={(days) => {
                    if (viewingStepObj) {
                      viewingStepObj.practiceDaysCompleted = days;
                      viewingStepObj.practice_days_completed = days;
                    }
                  }}
                  onAdvanceStep={() => {
                    handleStepPassed(100);
                  }}
                  onOpenQuiz={() => setActiveTab('evaluation')}
                />
              )}
              {/* IDLE / UNGENERATED LAUNCHPAD STATE */}
              {(!activeStepResources || activeStepResources.length === 0) && !isSynthesizing && (
                <div className="p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/90 shadow-xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
                    <Sparkles className="w-7 h-7 text-emerald-600 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-heading font-extrabold text-slate-900">Milestone Curriculum Ready</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      Synthesize live web resources curated specifically for "{viewingStepTitle}" using Tavily search and Groq pedagogy engine. Zero link rot guaranteed.
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="relative p-[1.5px] rounded-xl conic-beam shadow-md shadow-emerald-500/20 inline-block">
                      <button
                        onClick={handleSynthesizeMaterials}
                        disabled={isSynthesizing}
                        className="relative z-10 px-6 py-3 rounded-[10px] font-heading font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all flex items-center gap-2 cursor-pointer btn-shimmer"
                      >
                        <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>⚡ Build My Milestone Curriculum</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SYNTHESIZING SPINNER */}
              {isSynthesizing && (
                <div className="p-10 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/90 shadow-xl text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <h4 className="text-base font-heading font-bold text-slate-900">
                    Querying Tavily Web Search & Curating via Groq...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Harvesting technical documentation and video demonstrations tailored to "{viewingStepTitle}".
                  </p>
                </div>
              )}

              {/* CURRICULUM STUDY BOOK & PRE-STUDY GAME PLAN (MODULE D & E) */}
              {(studyBookResources.length > 0 || currentTopicMap.length > 0) && !isSynthesizing && (
                <div className="space-y-6">
                  {/* MODULE E: THE PRE-STUDY GAME PLAN (FIRST CARD BEFORE ANY RESOURCE) */}
                  <StepApproachBrief
                    stepId={viewingStepId}
                    stepTitle={viewingStepTitle}
                    tier={currentDifficultyTier}
                    approachBrief={currentApproachBrief}
                    approachViewedAt={currentApproachViewedAt}
                    onApproachViewed={handleApproachViewed}
                    onGenerateApproach={handleGenerateApproach}
                    isGenerating={isGeneratingApproach}
                  />

                  {/* MODULE D: THE BOOK — TOPIC MAP AND VERIFIED RESOURCE CARDS */}
                  <StudyBook
                    stepId={viewingStepId}
                    stepTitle={viewingStepTitle}
                    stepIndex={viewingStepNum}
                    topicMap={currentTopicMap}
                    resources={studyBookResources}
                    hasGuideMarkdown={hasGuideMarkdown}
                    onOpenReader={handleOpenReader}
                    onOpenPlayer={handleOpenPlayer}
                    onWarmUpYouTube={warmUpYouTube}
                    onStartEvaluation={() => setActiveTab('evaluation')}
                    onRetryTopic={handleRetryTopic}
                    onReplaceResource={handleReplaceResource}
                  />
                </div>
              )}

                  {/* SECTION 3: PRACTICAL EXECUTION DRILLS (With Embedded Step Timers) */}
                  {isPhysical && physicalDrills.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                            <Activity className="w-5 h-5"/>
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                              Step {viewingStepNum}: Practical Execution Drills
                            </h3>
                            <p className="text-xs text-slate-500">
                              Execute these physical biomechanical drills to build muscle memory before attempting the milestone gate.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {physicalDrills.filter((d) => d.isCompleted).length} of {physicalDrills.length} Drills Completed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {physicalDrills.map((drill, idx) => (
                          <DrillCardWithTimer
                            key={drill.id || idx}
                            drillNumber={idx + 1}
                            title={drill.title}
                            durationMinutes={drill.durationMinutes}
                            technicalFocusPoints={drill.technicalFocusPoints}
                            isCompleted={drill.isCompleted}
                            onDrillComplete={handlePhysicalDrillComplete}
                          />
                        ))}
                      </div>
                    </div>
                  )}

              {/* Ready for Quiz Prompt Banner */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-heading font-bold text-emerald-950">
                      Materials Mastered? Take the Socratic Competency Check
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Passing threshold is 75%. Score 100% or take the perfection drill to earn Grandmaster XP.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('evaluation')}
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
                stepId={viewingStepId}
                stepIndex={viewingStepNum}
                stepTitle={viewingStepTitle}
                acus={viewingStepAcus}
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
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200 inline-block">
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

              {/* Dynamic Score Radial */}
              <div className="relative inline-flex items-center justify-center mx-auto">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={38}
                    stroke="currentColor"
                    strokeWidth="7"
                    className="text-slate-100"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r={38}
                    stroke="url(#modalScoreGrad)"
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 38}
                    initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 38) * (1 - (levelUpData.score || 0) / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="modalScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black font-mono text-slate-900 tracking-tight">
                    {levelUpData.score}%
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                    Mastery
                  </span>
                </div>
              </div>

              {/* XP Gain Bar */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-emerald-500/30 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px]">Verified XP Reward</span>
                  <span className="text-amber-400 font-mono font-extrabold text-sm">+{levelUpData.xpEarned} XP</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                </div>
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
                  <span>Advance to Next Level →</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Standalone In-App Modals */}
      <InAppYouTubePlayerModal
        isOpen={activeYouTubeModal.isOpen}
        onClose={() => setActiveYouTubeModal((prev) => ({ ...prev, isOpen: false }))}
        videoId={activeYouTubeModal.videoId}
        videoTitle={activeYouTubeModal.title}
        channelOrAuthor={activeYouTubeModal.channelOrAuthor}
        focusNote={activeYouTubeModal.focusNote}
        takeaway={activeYouTubeModal.takeaway}
        embeddable={activeYouTubeModal.embeddable !== false}
      />

      <InAppContentReaderModal
        isOpen={activeReaderModal.isOpen}
        onClose={() => setActiveReaderModal((prev) => ({ ...prev, isOpen: false }))}
        title={activeReaderModal.title}
        documentId={activeReaderModal.documentId}
        sourceUrl={activeReaderModal.sourceUrl}
        sourceBadge={activeReaderModal.sourceBadge}
        sourceType={activeReaderModal.sourceType}
        takeaway={activeReaderModal.takeaway}
        corePrinciple={activeReaderModal.corePrinciple}
        mechanics={activeReaderModal.mechanics}
        commonTraps={activeReaderModal.commonTraps}
        fullContentMarkdown={activeReaderModal.fullContentMarkdown}
        documentationQuadrants={activeReaderModal.documentationQuadrants}
        documentationMarkdown={activeReaderModal.documentationMarkdown}
        documentationSourceUrl={activeReaderModal.documentationSourceUrl}
        focusNote={activeReaderModal.focusNote}
        initialTopicKey={activeReaderModal.initialTopicKey}
        topicMap={activeReaderModal.topicMap}
      />

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
          } catch { }
          onNavigate('studio');
          window.location.href = `/workspace/${newTrack.id}`;
        }}
      />
    </motion.div>
  );
};

export default WorkspaceStudioPage;
