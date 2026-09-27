import {
  WorkspaceDTO,
  SkillStepDTO,
  QuizQuestion,
  AdminKeysDTO,
  TestConnectionResponse,
  AIProvider,
} from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>),
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let parsedMessage = errorText;
    try {
      const errObj = JSON.parse(errorText);
      if (errObj.error) parsedMessage = errObj.error;
    } catch (_) {}
    throw new Error(parsedMessage || `API Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return {} as T;
}

export const api = {
  admin: {
    getKeys: (adminSecret: string) =>
      apiRequest<AdminKeysDTO>('/api/admin/keys', {
        headers: { 'x-admin-secret': adminSecret },
      }),

    updateKeys: (
      data: {
        groqKey?: string;
        openaiKey?: string;
        anthropicKey?: string;
        geminiKey?: string;
        defaultProvider?: AIProvider;
      },
      adminSecret: string
    ) =>
      apiRequest<{ success: boolean; message: string; defaultProvider?: string }>(
        '/api/admin/keys',
        {
          method: 'POST',
          headers: { 'x-admin-secret': adminSecret },
          body: JSON.stringify(data),
        }
      ),

    testConnection: (provider: string, key?: string) =>
      apiRequest<TestConnectionResponse>('/api/admin/test-connection', {
        method: 'POST',
        body: JSON.stringify({ provider, key }),
      }),
  },

  workspaces: {
    getAll: () => apiRequest<WorkspaceDTO[]>('/api/workspaces'),

    getById: (id: string) => apiRequest<WorkspaceDTO>(`/api/workspaces/${id}`),

    initiate: (payload: {
      title: string;
      category: string;
      baselineKnowledge: string;
      targetGoal: string;
      preferredProvider?: string;
    }) =>
      apiRequest<WorkspaceDTO>('/api/workspaces/initiate', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    generateNextStep: (workspaceId: string) =>
      apiRequest<{ step: SkillStepDTO; workspaceMastered: boolean; currentStepIndex: number }>(
        `/api/workspaces/${workspaceId}/generate-next-step`,
        { method: 'POST' }
      ),
  },

  steps: {
    promptQuiz: (stepId: string, questionCount?: number) =>
      apiRequest<{ stepId: string; questionCount?: number; questions: QuizQuestion[] }>(
        `/api/steps/${stepId}/prompt-quiz`,
        {
          method: 'POST',
          body: JSON.stringify({ questionCount }),
        }
      ),

    evaluate: (
      stepId: string,
      userAnswers: Array<{ questionId: string; selectedOptionIndex: number }>
    ) =>
      apiRequest<{
        passed: boolean;
        score: number;
        passingScore: number;
        canAdvance?: boolean;
        diagnosticReport?: string;
        weakConcepts?: string[];
        remedialResources?: Array<{ title: string; url: string; type: string; focusArea?: string }>;
        attemptId?: string;
      }>(`/api/steps/${stepId}/evaluate`, {
        method: 'POST',
        body: JSON.stringify({ userAnswers }),
      }),

    remedialQuiz: (stepId: string) =>
      apiRequest<{ stepId: string; weakConcepts: string[]; questions: QuizQuestion[] }>(
        `/api/steps/${stepId}/remedial-quiz`,
        { method: 'POST' }
      ),
  },
};

export default api;
