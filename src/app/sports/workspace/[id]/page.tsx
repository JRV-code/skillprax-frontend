'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SportsWorkspaceStudioPage } from '@/components/sports/SportsWorkspaceStudioPage';

export default function SportsWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.id as string;

  const [dbWorkspace, setDbWorkspace] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveWorkspace = async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      setError(null);

      // Try sports workspace endpoint first
      let res = await fetch(`/api/sports-workspace/${workspaceId}`);
      if (!res.ok) {
        // Fallback to standard workspace endpoint
        res = await fetch(`/api/workspaces/${workspaceId}`);
      }

      if (!res.ok) {
        throw new Error(`Sports Workspace "${workspaceId}" not found.`);
      }

      const data = await res.json();
      setDbWorkspace(data.workspace || data);
    } catch (err: any) {
      console.error('Failed to load sports workspace:', err);
      setError(err.message || 'Failed to fetch sports workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveWorkspace();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
            Hydrating Sports Training Studio...
          </span>
        </div>
      </div>
    );
  }

  if (error || !dbWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md bg-white p-6 rounded-3xl border border-red-200 shadow-xl text-center space-y-4">
          <h2 className="text-lg font-heading font-bold text-slate-900">
            Sports Workspace Unavailable
          </h2>
          <p className="text-xs text-slate-500">
            {error || 'Unable to locate requested athletic training track.'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/sports')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Return to Sports Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <SportsWorkspaceStudioPage
      rawWorkspace={dbWorkspace}
      onNavigate={(page) => {
        if (page === 'sports') router.push('/sports');
        else if (page === 'profile') router.push('/profile');
        else router.push('/sports');
      }}
      onPassEvaluation={() => {
        fetchLiveWorkspace();
      }}
    />
  );
}
