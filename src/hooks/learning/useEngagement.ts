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

    activeSecondsRef.current = 0;

    const interval = setInterval(() => {
      // Check document visibility
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        activeSecondsRef.current += 1;
        if (activeSecondsRef.current >= 20) {
          triggerEngaged();
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [stepId, isUnlocked, isReady]);

  return { triggerEngagedManual: triggerEngaged };
}
