'use client';

import { useState } from 'react';
import { AppShell } from '@/src/components/layout/AppShell';
import { OnboardingModal } from '@/src/features/onboarding/screens/OnboardingModal';
import { HeroBanner } from '../components/HeroBanner';
import { RadarBanner } from '../components/RadarBanner';
import { SkillsGapCard } from '../components/SkillsGapCard';
import { ActionPlanCard } from '../components/ActionPlanCard';
import { WellbeingCard } from '../components/WellbeingCard';
import { SkillsGapModal } from '../components/SkillsGapModal';
import { CheckinModal } from '../components/CheckinModal';

interface Props {
  nombre: string;
  shouldOpenOnboarding: boolean;
}

export default function DashboardClient({
  nombre,
  shouldOpenOnboarding,
}: Props) {
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinMood, setCheckinMood] = useState('');
  const [checkinStartStep, setCheckinStartStep] = useState<1 | 2 | 3>(1);
  const [onboardingOpen, setOnboardingOpen] = useState(shouldOpenOnboarding);

  return (
    <AppShell
      onCheckinClick={() => {
        setCheckinMood('');
        setCheckinStartStep(1);
        setCheckinModalOpen(true);
      }}
    >
      <div className='space-y-6'>
        <HeroBanner nombre={nombre} />

        <RadarBanner />

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <SkillsGapCard
            onVerDetalles={() => setSkillsModalOpen(true)}
          />
          <ActionPlanCard />
          <WellbeingCard
            onEmojiClick={(moodId) => {
              setCheckinMood(moodId);
              setCheckinStartStep(2);
              setCheckinModalOpen(true);
            }}
          />
        </div>
      </div>

      {onboardingOpen && <OnboardingModal defaultOpen locked />}

      <SkillsGapModal
        open={skillsModalOpen}
        onOpenChange={setSkillsModalOpen}
      />

      <CheckinModal
        open={checkinModalOpen}
        onOpenChange={(v) => {
          setCheckinModalOpen(v);
          if (!v) {
            setCheckinMood('');
            setCheckinStartStep(1);
          }
        }}
        initialMood={checkinMood}
        startAtStep={checkinStartStep}
      />
    </AppShell>
  );
}
