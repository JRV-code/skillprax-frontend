'use client';

import { useEffect, useRef } from 'react';

const engagedStepsThisSession = new Set<string>();

export function useEngagement(stepId: string | null | undefined, isUnlocked = true, isReady = false) {
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSecondsRef = useRef<number>(0);

  const triggerEngaged = async () => {
    if (!stepId || engagedStepsThisSession.has(stepId)) return;
    engagedStepsThisSession.add(stepId);

    try {
      await fetch(`/api/steps/${stepId}/engaged`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch (_) {}
  };

  useEffect(() => {
    if (!stepId || !isUnlocked || !isReady || engagedStepsThisSession.has(stepId)) return;

    const timer = setTimeout(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        triggerEngaged();
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [stepId, isUnlocked, isReady]);

  return { triggerEngagedManual: triggerEngaged };
}
