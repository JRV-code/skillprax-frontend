export interface LearningConfig {
  passThresholdPercent: number;
  quizMinQuestions: number;
  languages: string[];
}

let cachedConfig: LearningConfig | null = null;

export async function fetchLearningConfig(): Promise<LearningConfig> {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch('/api/config/learning', { cache: 'no-store' });
    if (res.ok) {
      cachedConfig = await res.json();
      return cachedConfig!;
    }
  } catch (err) {
    console.warn('Failed to fetch /api/config/learning:', err);
  }
  // Safe fallback if network is offline
  return {
    passThresholdPercent: 70,
    quizMinQuestions: 8,
    languages: ['en', 'hi', 'gu', 'mr', 'kn', 'ta', 'te', 'fr', 'es', 'de'],
  };
}

export function getCachedPassThreshold(): number {
  return cachedConfig?.passThresholdPercent ?? 70;
}
