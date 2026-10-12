'use client';

import React from 'react';
import { useActivityHeartbeat } from '@/hooks/useActivityHeartbeat';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LanguageProvider } from '@/context/LanguageContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useActivityHeartbeat();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';

  if (!googleClientId) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[SKILL-TRACK Auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured. Google Sign-In disabled.'
      );
    }
    return <LanguageProvider>{children}</LanguageProvider>;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}
