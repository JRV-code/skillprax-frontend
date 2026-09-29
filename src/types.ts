export interface UserProfile {
  id: string;
  name: string;
  age: number;
  profession: string;
  avatarUrl: string;
  targetHours: number;
  targetMinutes: number;
  dailyReminderTime: string;
  notificationsEnabled: boolean;
  activeDays: number;
  followingsCount: number;
  skillsCompleted: number;
  flameStreak: number;
  activeFreezes: number;
  maxFreezes: number;
  studyCadence: DayCadence[];
}

export interface DayCadence {
  day: string; // 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
  hours: number;
  minutes: number;
  focusArea: string;
  nodesCompleted: number;
}

export type SkillCategory = 'Athletics' | 'Programming' | 'Chemistry' | 'Custom';

export interface Milestone {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
  acus: string[]; // Assessable Concept Units
}

export interface SkillTrack {
  id: string;
  title: string;
  category: SkillCategory;
  tags: string[];
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  colorScheme: 'emerald' | 'blue' | 'amber';
  icon: string;
  milestones: Milestone[];
}

export interface FlowchartNode {
  id: string;
  label: string;
  subLabel?: string;
  status: 'locked' | 'active' | 'completed';
  x: number;
  y: number;
  width: number;
  height: number;
  tier: number;
  objectives: string[];
  acus: string[];
  aiSummary: string;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  animated?: boolean;
  label?: string;
}

export interface StudyResource {
  id: string;
  type: 'youtube' | 'doc';
  title: string;
  subtitle: string;
  url: string;
  durationOrPages?: string;
  viewsOrCitation?: string;
  thumbnailUrl?: string;
  videoId?: string;
  verified: boolean;
  organization?: string;
}

export interface QuizQuestion {
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

export type AIEngine = 'groq-llama-3.3-70b' | 'llama-3.1-8b' | 'mixtral-8x7b' | 'gemini-1.5-pro';
