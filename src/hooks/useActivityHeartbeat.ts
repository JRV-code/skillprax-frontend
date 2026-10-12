'use client';

import { useEffect } from 'react';

export function useActivityHeartbeat() {
  useEffect(() => {
    const sendPing = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetch('/api/activity/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamp: Date.now() }),
        }).catch(() => {
          // Silent — never crash the UI over a missed heartbeat
        });
      }
    };

    // Immediate first ping, then every 60 seconds while tab is visible
    sendPing();
    const interval = setInterval(sendPing, 60_000);
    return () => clearInterval(interval);
  }, []);
}
