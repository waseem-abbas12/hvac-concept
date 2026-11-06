'use client';

import React from 'react';
import { ProjectProvider } from '@/context/ProjectContext';
import { WhiteLabelOnboardingView } from '@/components/modules/WhiteLabelOnboardingView';

export default function OnboardingPage() {
  return (
    <ProjectProvider initialModule="overview">
      <WhiteLabelOnboardingView />
    </ProjectProvider>
  );
}
