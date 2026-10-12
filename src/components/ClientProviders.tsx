'use client';

import React from 'react';
import { useActivityHeartbeat } from '@/hooks/useActivityHeartbeat';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { LanguageProvider } from '@/context/LanguageContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useActivityHeartbeat();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}
