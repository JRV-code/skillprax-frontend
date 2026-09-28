'use client';

import { useActivityHeartbeat } from '@/hooks/useActivityHeartbeat';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useActivityHeartbeat();
  return <>{children}</>;
}
