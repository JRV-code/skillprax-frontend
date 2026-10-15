export type DomainCategory = 
  | 'Science' 
  | 'Athletics' 
  | 'Art' 
  | 'Homemaking' 
  | 'Cognitive Logic';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  gender?: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say' | string;
  educationBoard: string;
  grade: string;
  activeMonths: number;
  streakDays: number;
  freezeShields: number;
  targetHours: number;
  targetMinutes: number;
  alertNotification: string;
  createdAt: string;
  updatedAt: string;
  age?: number;
  profession?: string;
  avatarUrl?: string;
  dailyReminderTime?: string;
  notificationsEnabled?: boolean;
  activeDays?: number;
  followingsCount?: number;
  flameStreak?: number;
  activeFreezes?: number;
  maxFreezes?: number;
  skillsCompleted?: number;
  studyCadence?: any[];
  dietaryPreference?: 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian' | 'Vegan' | 'Jain' | string;
  medicalConditions?: string;
  healthConditions?: string;
  ageCategory?: 'U-14' | 'U-17' | 'U-19' | 'Open' | string;
  onboardingCompleted?: boolean;
  totalXp?: number;
  level?: number;
  totalQuizzesTaken?: number;
  totalQuestionsAttempted?: number;
  totalQuestionsCorrect?: number;
  avgQuizAccuracy?: number;
  preferredLanguage?: SupportedLanguage;
  totalSkillsCompleted?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: string;
  dateOfBirth?: string;
  date_of_birth?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  city?: string;
  state?: string;
  xp?: number;
}

export type SupportedLanguage = 'en' | 'hi' | 'gu' | 'mr' | 'kn' | 'ta' | 'te' | 'fr' | 'es' | 'de';

export interface Review {
  id: string;
  profileId?: string;
  userName: string;
  avatarUrl?: string;
  rating: number;
  reviewText: string;
  skillTag?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface SportDrill {
  id: string;
  title: string;
  durationMinutes: number;
  durationSeconds?: number;
  objective?: string;
  biomechanicalFocus?: string;
  instructions?: string[] | string;
  recommendedSets?: string;
  intensityLevel?: 'Low' | 'Medium' | 'High' | string;
  focusPoints?: string[];
  completed: boolean;
}

export interface SportWorkoutPlan {
  sportName: string;
  subGenre: string;
  drills: SportDrill[];
}

export interface ACU {
  id: string;
  stepId?: string;
  title: string;
  description: string;
}

export interface StepResource {
  id: string;
  stepId?: string;
  type: 'DOCUMENT' | 'VIDEO' | 'youtube' | 'doc';
  title: string;
  url: string;
  takeaway: string;
  subtitle?: string;
  durationOrPages?: string;
  viewsOrCitation?: string;
  verified?: boolean;
  organization?: string;
}

export interface Step {
  id: string;
  workspaceId: string;
  stepIndex: number;
  title: string;
  status: 'LOCKED' | 'STUDY_UNGENERATED' | 'STUDY_READY' | 'EVAL_UNGENERATED' | 'EVAL_ACTIVE' | 'FAILED_REMEDIATION' | 'PASSED' | 'IN_PROGRESS';
  acus: ACU[];
  resources: StepResource[];
  description?: string;
}

export interface Workspace {
  id: string;
  title: string;
  subTitle: string;
  domain?: DomainCategory;
  domainCategory?: DomainCategory;
  progress: number;
  profileId: string;
  steps: Step[];
  createdAt: string;
  currentStep?: number;
  totalSteps?: number;
  level?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface EvaluationQuestion {
  id: string;
  prompt: string;
  options: QuestionOption[];
  acuId?: string;
}

export interface WeakAreaDiagnosis {
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

export interface DiagnosticPrescription {
  overallDiagnosis: string;
  weakAreas: WeakAreaDiagnosis[];
}

export type AIProvider = 'groq' | 'openai' | 'anthropic' | 'gemini' | 'openrouter';

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

export type WorkspaceDTO = Workspace;
export type SkillStepDTO = Step;
export type QuizQuestion = EvaluationQuestion;
