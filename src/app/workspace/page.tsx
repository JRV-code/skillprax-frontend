'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function WorkspaceRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skillId = searchParams.get('skillId') || searchParams.get('id');

  useEffect(() => {
    if (skillId) {
      router.replace(`/workspace/${skillId}`);
      return;
    }

    const profileId = typeof window !== 'undefined'
      ? (localStorage.getItem('skillprax_active_profile_id') || 'default-profile')
      : 'default-profile';

    fetch(`/api/profiles/${profileId}/telemetry`)
      .then((res) => res.json())
      .then((data) => {
        const enrolled = data.enrolledWorkspaces || [];
        const cognitive = enrolled.filter((w: any) => {
          const dom = (w.domainCategory || w.domain || '').toLowerCase();
          return !dom.includes('athletic') && !dom.includes('sport');
        });
        if (cognitive.length > 0) {
          router.replace(`/workspace/${cognitive[0].id}`);
        } else {
          router.replace('/skills');
        }
      })
      .catch(() => {
        router.replace('/skills');
      });
  }, [skillId, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono font-bold text-slate-500 tracking-wider">
          Directing to Studio Workspace...
        </span>
      </div>
    </div>
  );
}

export default function WorkspaceHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WorkspaceRedirect />
    </Suspense>
  );
}
