'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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
  const isMountedRef = useRef<boolean>(true);

  const poll = useCallback(async () => {
    if (!stepId || !isMountedRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    // Give up after 4 minutes (240,000 ms) with a Retry state
    if (elapsed > 240000) {
      if (isMountedRef.current) {
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
        if (isMountedRef.current) {
          setStatus({
            locked: data.locked ?? false,
            packStatus: data.packStatus || 'NOT_BUILT',
            packStage: data.packStage || null,
            packError: data.packError || null,
            quizStatus: data.quizStatus || 'NOT_BUILT',
            quizError: data.quizError || null,
            timedOut: false,
          });

          // If still BUILDING, schedule next poll (2s normally, 5s after 90s)
          if (data.packStatus === 'BUILDING') {
            const pollInterval = elapsed > 90000 ? 5000 : 2000;
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(poll, pollInterval);
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (isMountedRef.current) {
          setStatus((prev) => ({
            ...prev,
            packStatus: 'FAILED',
            packError: errData.error || `Status request failed (HTTP ${res.status})`,
          }));
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && isMountedRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(poll, 3000);
      }
    }
  }, [stepId]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!stepId) return;

    startTimeRef.current = Date.now();
    poll();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stepId, poll]);

  const startBuild = useCallback(async () => {
    if (!stepId) {
      console.warn('[usePackStatus] Cannot start build: stepId is null');
      return;
    }
    setLoading(true);
    startTimeRef.current = Date.now();

    // 1. Immediately set local status to BUILDING & stage PLANNING so UI transitions instantly
    setStatus((prev) => ({
      ...prev,
      packStatus: 'BUILDING',
      packStage: 'PLANNING',
      packError: null,
      timedOut: false,
    }));

    // 2. Fire backend level-up-resources endpoint
    try {
      const res = await fetch(`/api/steps/${stepId}/level-up-resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        cache: 'no-store',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errorMsg = errData.error || `Server returned HTTP ${res.status} when initiating search`;
        console.error('[usePackStatus] Search start failed:', errorMsg);
        if (isMountedRef.current) {
          setStatus((prev) => ({
            ...prev,
            packStatus: 'FAILED',
            packError: errorMsg,
          }));
        }
        return;
      }
    } catch (err: any) {
      console.warn('Failed to start pack build:', err);
      if (isMountedRef.current) {
        setStatus((prev) => ({
          ...prev,
          packStatus: 'FAILED',
          packError: err.message || 'Network error triggering resource search',
        }));
      }
      return;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }

    // 3. Immediately poll after short delay and continue 2s cycle
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(poll, 800);
  }, [stepId, poll]);

  const retry = useCallback(async () => {
    await startBuild();
  }, [startBuild]);

  return { ...status, loading, retry, startBuild };
}

export default usePackStatus;
