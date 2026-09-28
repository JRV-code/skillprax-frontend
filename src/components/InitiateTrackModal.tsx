'use client';

import React from 'react';
import { NewSkillModal } from './NewSkillModal';

interface InitiateTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InitiateTrackModal({ isOpen, onClose }: InitiateTrackModalProps) {
  return <NewSkillModal isOpen={isOpen} onClose={onClose} />;
}
