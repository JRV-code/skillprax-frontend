'use client';

import { useState, useEffect, useRef } from 'react';

export interface StepPackStatus {
  locked: boolean;
  packStatus: 'NOT_BUILT' | 'BUILDING' | 'READY' | 'FAILED';
  packStage: string | null;
  packError: string | null;
  quizStatus: 'NOT_BUILT' | 'BUILDING' | 'READY' | 'FAILED';
  quizError?: string | null;
  timedOut?: boolean;
}

export function usePackStatus(stepId: string | null | undefined) {
  const [status, setStatus] = useState<StepPackStatus>({
    locked: false,
    packStatus: 'NOT_BUILT',
    packStage: null,
    packError: null,
    quizStatus: 'NOT_BUILT',
    quizError: null,
    timedOut: false,
  });
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!stepId) return;

    startTimeRef.current = Date.now();
    let isMounted = true;

    const poll = async () => {
      const elapsed = Date.now() - startTimeRef.current;
      // Give up after 4 minutes (240,000 ms) with a Retry state
      if (elapsed > 240000) {
        if (isMounted) {
          setStatus((prev) => ({
            ...prev,
            packStatus: 'FAILED',
            packError: 'Build timed out after 4 minutes. Please click Retry.',
            timedOut: true,
          }));
        }
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const res = await fetch(`/api/steps/${stepId}/status`, {
          cache: 'no-store',
          signal: abortControllerRef.current.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setStatus({
              locked: data.locked ?? false,
              packStatus: data.packStatus || 'NOT_BUILT',
              packStage: data.packStage || null,
              packError: data.packError || null,
              quizStatus: data.quizStatus || 'NOT_BUILT',
              quizError: data.quizError || null,
              timedOut: false,
            });

            // If still BUILDING, schedule next poll
            if (data.packStatus === 'BUILDING') {
              const pollInterval = elapsed > 90000 ? 5000 : 2000;
              timerRef.current = setTimeout(poll, pollInterval);
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          // If fetch fails, schedule retry
          timerRef.current = setTimeout(poll, 4000);
        }
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stepId]);

  const retry = async () => {
    if (!stepId) return;
    setLoading(true);
    try {
      await fetch(`/api/steps/${stepId}/level-up-resources`, {
        method: 'POST',
        cache: 'no-store',
      });
      startTimeRef.current = Date.now();
      setStatus((prev) => ({
        ...prev,
        packStatus: 'BUILDING',
        packStage: 'QUEUED',
        packError: null,
        timedOut: false,
      }));
    } catch (_) {}
    setLoading(false);
  };

  return { ...status, loading, retry };
}
