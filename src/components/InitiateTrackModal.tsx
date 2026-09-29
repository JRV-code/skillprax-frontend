'use client';

import React from 'react';
import { EnrollSkillModal } from './EnrollSkillModal';
import { SkillTrack } from '@/types';

interface InitiateTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll?: (track: SkillTrack) => void;
}

export function InitiateTrackModal({ isOpen, onClose, onEnroll }: InitiateTrackModalProps) {
  return (
    <EnrollSkillModal
      isOpen={isOpen}
      onClose={onClose}
      onEnroll={(track) => {
        if (onEnroll) onEnroll(track);
        else {
          try {
            const saved = localStorage.getItem('skillprax_tracks');
            const current = saved ? JSON.parse(saved) : [];
            localStorage.setItem('skillprax_tracks', JSON.stringify([...current, track]));
          } catch {}
          window.location.href = `/workspace/${track.id}`;
        }
      }}
    />
  );
}

export default InitiateTrackModal;
