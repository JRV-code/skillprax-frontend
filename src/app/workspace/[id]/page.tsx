'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WorkspaceStudioPage from '@/components/WorkspaceStudioPage';
import { SkillTrack, AIEngine } from '@/types';

const INITIAL_TRACKS: SkillTrack[] = [
  {
    id: 'track-haloalkanes',
    title: 'NCERT Class 12 Chemistry: Haloalkanes and Haloarenes',
    category: 'Chemistry',
    tags: ['Chemistry', 'NCERT', 'JEE Advanced', 'Mechanisms'],
    currentStep: 2,
    totalSteps: 6,
    progressPercent: 33,
    colorScheme: 'amber',
    icon: 'FlaskConical',
    milestones: [
      {
        id: 'm-chem-1',
        stepNumber: 1,
        title: 'Classification & Nomenclature',
        description: 'Aliphatic, allylic, benzylic, vinylic, and arylic halide structures.',
        status: 'completed',
        acus: ['ACU-1: sp³ vs sp² C-X classification', 'ACU-2: IUPAC haloarene numbering'],
      },
      {
        id: 'm-chem-2',
        stepNumber: 2,
        title: 'Methods of Preparation & Halogen Exchange',
        description: 'Darzens SOCl₂ process, Finkelstein NaI/acetone, and Swarts AgF fluorination.',
        status: 'active',
        acus: ['ACU-3: Darzens gaseous byproducts', 'ACU-4: Finkelstein acetone precipitation'],
      },
      {
        id: 'm-chem-3',
        stepNumber: 3,
        title: 'Nucleophilic Substitution Mechanics (SN1 vs SN2)',
        description: 'Walden inversion, pentacoordinate transition state, and planar carbocation stability.',
        status: 'locked',
        acus: ['ACU-5: Polar aprotic solvent acceleration', 'ACU-6: Optical inversion criteria'],
      },
      {
        id: 'm-chem-4',
        stepNumber: 4,
        title: 'Ambident Nucleophiles & Saytzeff Elimination',
        description: 'KCN vs AgCN ambident reactivity, and anti-periplanar E2 dehydrohalogenation.',
        status: 'locked',
        acus: ['ACU-7: Ionic vs covalent ambident control', 'ACU-8: Zaitsev hyperconjugation rule'],
      },
      {
        id: 'm-chem-5',
        stepNumber: 5,
        title: 'Aromatic Wing & Haloarene Low Reactivity',
        description: 'Resonance delocalization, sp² hybridization, Dow’s process, and EAS orientation.',
        status: 'locked',
        acus: ['ACU-9: Phenyl cation instability', 'ACU-10: Ortho/para activating resonance'],
      },
      {
        id: 'm-chem-6',
        stepNumber: 6,
        title: 'Organometallics & Polyhalogen Environmental Profile',
        description: 'Wurtz, Fittig, Grignard reagents, Chloroform oxidation, and p,p\'-DDT bioaccumulation.',
        status: 'locked',
        acus: ['ACU-11: Grignard protic quenching', 'ACU-12: DDT synthesis & persistence'],
      },
    ],
  },
  {
    id: 'track-athletics',
    title: 'Athletics & Kinematic Acceleration',
    category: 'Athletics',
    tags: ['Athletics', 'Biomechanics', 'Sprint'],
    currentStep: 1,
    totalSteps: 5,
    progressPercent: 20,
    colorScheme: 'emerald',
    icon: 'Zap',
    milestones: [
      {
        id: 'm-ath-1',
        stepNumber: 1,
        title: 'Sprint Mechanics & Block Clearance',
        description: 'Biomechanical foot strike angle and initial block projection impulse.',
        status: 'active',
        acus: ['ACU-1: Block angle clearance', 'ACU-2: Acute ground vector'],
      },
      {
        id: 'm-ath-2',
        stepNumber: 2,
        title: 'Max Velocity Phase & Pelvic Kinematics',
        description: 'Maintaining elastic recoil without premature vertical posture.',
        status: 'locked',
        acus: ['ACU-3: Elastic energy storage', 'ACU-4: Hip extension velocity'],
      },
      {
        id: 'm-ath-3',
        stepNumber: 3,
        title: 'Speed Endurance & Deceleration Buffer',
        description: 'Lactate buffering and stride frequency retention.',
        status: 'locked',
        acus: ['ACU-5: Glycolytic pacing'],
      },
      {
        id: 'm-ath-4',
        stepNumber: 4,
        title: 'Competition Cadence Optimization',
        description: 'Environmental wind and neural pre-activation.',
        status: 'locked',
        acus: ['ACU-6: CNS potentiating'],
      },
      {
        id: 'm-ath-5',
        stepNumber: 5,
        title: 'Championship Mastery Synthesis',
        description: 'Integrated physiological peak execution.',
        status: 'locked',
        acus: ['ACU-7: Race-day tapering protocol'],
      },
    ],
  },
  {
    id: 'track-algorithms',
    title: 'Autonomous Graph Theory & Algorithmic Complexity',
    category: 'Programming',
    tags: ['Programming', 'Graph Theory', 'Algorithms', 'Mastery'],
    currentStep: 5,
    totalSteps: 5,
    progressPercent: 100,
    colorScheme: 'amber',
    icon: 'Code',
    milestones: [
      {
        id: 'm-algo-1',
        stepNumber: 1,
        title: 'Asymptotic Analysis & Big-O Axioms',
        description: 'Time and space complexity invariants across recursion trees.',
        status: 'completed',
        acus: ['ACU-1: Recurrence relations', 'ACU-2: Master theorem bounds'],
      },
      {
        id: 'm-algo-2',
        stepNumber: 2,
        title: 'Graph Traversal & Topological DAGs',
        description: 'Depth-first search, cycle detection, and strongly connected components.',
        status: 'completed',
        acus: ['ACU-3: Tarjan articulation points', 'ACU-4: Kahn topological order'],
      },
      {
        id: 'm-algo-3',
        stepNumber: 3,
        title: 'Shortest Path & Network Flows',
        description: 'Dijkstra with indexed priority queues and Ford-Fulkerson max flow.',
        status: 'completed',
        acus: ['ACU-5: Potential functions', 'ACU-6: Residual network cuts'],
      },
      {
        id: 'm-algo-4',
        stepNumber: 4,
        title: 'Dynamic Programming & Memoized Schemas',
        description: 'Subproblem optimal substructure and state space reduction.',
        status: 'completed',
        acus: ['ACU-7: Bitmask transitions', 'ACU-8: Monotonic queue optimization'],
      },
      {
        id: 'm-algo-5',
        stepNumber: 5,
        title: 'Apex Algorithmic Synthesis & Verification',
        description: 'Comprehensive mastery of competitive algorithmic structures.',
        status: 'completed',
        acus: ['ACU-9: Convex hull trick', 'ACU-10: Splay trees & Link-cut'],
      },
    ],
  },
];

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = (params?.id as string) || 'track-haloalkanes';

  const [tracks, setTracks] = useState<SkillTrack[]>(INITIAL_TRACKS);
  const [selectedEngine, setSelectedEngine] = useState<AIEngine>('groq-llama-3.3-70b');

  useEffect(() => {
    try {
      const savedTracks = localStorage.getItem('skillprax_tracks');
      if (savedTracks) {
        setTracks(JSON.parse(savedTracks));
      }
    } catch {
      // Use defaults
    }
  }, []);

  const currentTrack = tracks.find((t) => t.id === workspaceId) || tracks[0];

  const handleNavigate = (page: 'landing' | 'profile' | 'studio') => {
    if (page === 'landing') router.push('/');
    else if (page === 'profile') router.push('/profile');
    else router.push(`/workspace/${currentTrack.id}`);
  };

  const handlePassEvaluation = () => {
    setTracks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === currentTrack.id) {
          const nextStep = Math.min(t.totalSteps, t.currentStep + 1);
          const nextPercent = Math.round((nextStep / t.totalSteps) * 100);
          return {
            ...t,
            currentStep: nextStep,
            progressPercent: nextPercent,
            milestones: t.milestones.map((m, idx) => {
              if (idx < nextStep) return { ...m, status: 'completed' as const };
              if (idx === nextStep) return { ...m, status: 'active' as const };
              return m;
            }),
          };
        }
        return t;
      });
      try {
        localStorage.setItem('skillprax_tracks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <WorkspaceStudioPage
      currentTrack={currentTrack}
      onNavigate={handleNavigate}
      selectedEngine={selectedEngine}
      onSelectEngine={setSelectedEngine}
      onPassEvaluation={handlePassEvaluation}
    />
  );
}
