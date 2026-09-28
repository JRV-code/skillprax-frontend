export type AIProvider = 'groq' | 'openai' | 'anthropic' | 'gemini' | 'openrouter';

export interface BookRecommendation {
  title: string;
  author: string;
  whyRead: string;
  searchUrl: string;
}

export interface ResourceItem {
  priority?: number;
  badge?: string;
  title: string;
  url: string;
  type: 'video' | 'pdf' | 'wiki' | 'guide' | 'website' | 'interactive' | 'code_repo' | string;
  pedagogicalRole?: string;
  studyGuidance?: string;
  whyThisFirst?: string;
  summary?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  conceptTested?: string;
}

export interface QuizAttemptDTO {
  id: string;
  stepId: string;
  score: number;
  passed: boolean;
  targetWeakAreasOnly?: boolean;
  userAnswers: Array<{ questionId: string; selectedOptionIndex: number }>;
  diagnosticReport?: string | null;
  weakConcepts?: string[] | null;
  remedialResources?: Array<{
    title: string;
    url: string;
    type: string;
    focusArea?: string;
  }> | null;
  createdAt: string;
}

export interface SkillStepDTO {
  id: string;
  workspaceId: string;
  stepIndex: number;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery' | string;
  whatYouWillLearn: string;
  coreKeyTakeaways: string[];
  practicalApplication: string;
  assessableUnits?: string[];
  estimatedMinutes: number;
  resources: ResourceItem[];
  status: 'IN_PROGRESS' | 'READY_FOR_QUIZ' | 'PASSED' | string;
  passingScore: number;
  questionCount: number;
  attempts?: QuizAttemptDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceDTO {
  id: string;
  userId?: string;
  title: string;
  category?: string;
  domainCategory?: string;
  baselineKnowledge?: string;
  targetGoal?: string;
  aiProvider?: AIProvider | string;
  aiModel?: string | null;
  status?: 'ACTIVE' | 'MASTERED' | 'ARCHIVED' | string;
  estimatedTotalSteps?: number;
  currentStepIndex?: number;
  recommendedBooks?: BookRecommendation[] | null;
  steps?: SkillStepDTO[];
  passedStepsCount?: number;
  completionPercentage?: number;
  currentStep?: number;
  totalSteps?: number;
  progress?: number;
  engine?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminKeysDTO {
  defaultProvider: AIProvider;
  keys: {
    groq?: string | null;
    openai?: string | null;
    anthropic?: string | null;
    gemini?: string | null;
    openrouter?: string | null;
    tavily?: string | null;
  };
  configured: {
    groq: boolean;
    openai: boolean;
    anthropic: boolean;
    gemini: boolean;
    openrouter?: boolean;
    tavily?: boolean;
  };
}

export interface TestConnectionResponse {
  ok: boolean;
  latencyMs: number;
  error?: string;
}
