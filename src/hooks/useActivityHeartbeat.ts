'use client';

import { useEffect } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com';

export function useActivityHeartbeat() {
  useEffect(() => {
    const sendPing = () => {
      if (document.visibilityState === 'visible') {
        fetch(`${API_BASE}/api/activity/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
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
