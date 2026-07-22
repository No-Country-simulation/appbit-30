'use client';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppIcon,
  AppInput,
  AppShell,
  AuthBlob,
  Body,
  BodyMedium,
  BodySemibold,
  Caption,
  H1,
  H2,
  H3,
  PulseIndicator,
  AppChoiceChips,
  ChoiceChip,
  StepIndicator,
} from '@/src/components';

import { OnboardingModal } from '@/src/features/onboarding/screens/OnboardingModal';
import {
  HeroBanner,
  RadarBanner,
  SkillsGapCard,
  ActionPlanCard,
  WellbeingCard,
  SkillsGapModal,
  CheckinModal,
} from '@/src/features/dashboard/components';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

export default function PlaygroundScreen() {
  const t = useTranslations('Playground');
  const [key, setKey] = useState(0);
  const [selectedChip, setSelectedChip] = useState('react');
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinMood, setCheckinMood] = useState<string>('');
  const [checkinStartStep, setCheckinStartStep] = useState<1 | 2 | 3>(1);

  return (
    <AppShell
      onCheckinClick={() => {
        setCheckinMood('');
        setCheckinStartStep(1);
        setCheckinModalOpen(true);
      }}
    >
      <div className='space-y-16'>
        <div className='space-y-4'>
          <H1>{t('title')}</H1>
          <Body>{t('description')}</Body>
        </div>

        {/* ====================================================== */}
        {/* TYPOGRAPHY */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H1>{t('typography')}</H1>

          <H1>Heading 1 - Outfit Black</H1>

          <H2>Heading 2 - Outfit ExtraBold</H2>

          <H3>Heading 3 - Outfit Bold</H3>

          <Body>Body Regular - Inter Regular</Body>

          <BodyMedium>Body Medium - Inter Medium</BodyMedium>

          <BodySemibold>Body Semibold - Inter Semibold</BodySemibold>

          <Caption>Caption 12px Semibold</Caption>
        </section>

        {/* ====================================================== */}
        {/* COLORS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>{t('colors')}</H2>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <ColorBox name='Primary' color='var(--color-primary)' />

            <ColorBox name='Primary Light' color='var(--color-primary-light)' />

            <ColorBox name='Primary Dark' color='var(--color-primary-dark)' />

            <ColorBox name='Primary Pale' color='var(--color-primary-pale)' />

            <ColorBox name='Secondary' color='var(--color-secondary)' />

            <ColorBox
              name='Secondary Dark'
              color='var(--color-secondary-dark)'
            />

            <ColorBox
              name='Secondary Pale'
              color='var(--color-secondary-pale)'
            />

            <ColorBox name='Success' color='var(--color-success)' />

            <ColorBox name='Danger' color='var(--color-danger)' />

            <ColorBox name='Warning' color='var(--color-warning)' />

            <ColorBox name='Body' color='var(--color-body)' />

            <ColorBox name='Card' color='var(--color-card)' />

            <ColorBox name='Dark Surface' color='var(--color-dark-surface)' />

            <ColorBox name='Text' color='var(--color-text)' />

            <ColorBox name='Text Muted' color='var(--color-text-muted)' />

            <ColorBox name='Border' color='var(--color-border)' />
          </div>
        </section>

        {/* ====================================================== */}
        {/* RADIUS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>{t('radius')}</H2>

          <div className='flex flex-wrap items-end gap-4 lg:gap-8'>
            <RadiusBox label='sm' radius='var(--radius-sm)' />

            <RadiusBox label='md' radius='var(--radius-md)' />

            <RadiusBox label='lg' radius='var(--radius-lg)' />

            <RadiusBox label='pill' radius='var(--radius-pill)' />
          </div>
        </section>

        {/* ====================================================== */}
        {/* SHADOWS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>{t('shadows')}</H2>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <ShadowBox label='shadow-sm' shadow='var(--shadow-sm)' />

            <ShadowBox label='shadow-md' shadow='var(--shadow-md)' />

            <ShadowBox label='shadow-lg' shadow='var(--shadow-lg)' />
          </div>
        </section>

        {/* ====================================================== */}
        {/* BUTTONS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>{t('buttons')}</H2>

          <div className='flex gap-4 flex-wrap'>
            <AppButton>{t('primary')}</AppButton>

            <AppButton variant='outline'>{t('outline')}</AppButton>

            <AppButton disabled>{t('disabled')}</AppButton>
          </div>
        </section>

        {/* ====================================================== */}
        {/* CHOICE CHIPS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>Choice Chips</H2>

          <AppChoiceChips
            defaultSelected={['pc-laptop']}
            options={[
              { label: t('onlyPhone'), value: 'solo-celular' },
              { label: t('pcOrLaptop'), value: 'pc-laptop' },
              { label: t('tablet'), value: 'tablet' },
            ]}
          />
        </section>

        {/* ====================================================== */}
        {/* CHOICE CHIP (simple) */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>ChoiceChip (simple)</H2>

          <div className='flex flex-wrap gap-3'>
            {['React', 'Vue', 'Angular', 'Svelte'].map((chip) => (
              <ChoiceChip
                key={chip}
                label={chip}
                selected={selectedChip === chip}
                onClick={() => setSelectedChip(chip)}
              />
            ))}
          </div>
        </section>

        {/* ====================================================== */}
        {/* INPUTS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>{t('inputs')}</H2>

          <div className='max-w-md space-y-4'>
            <AppInput placeholder={t('normalInput')} />

            <AppInput value={t('filledInput')} readOnly />

            <AppInput disabled placeholder={t('disabledInput')} />
          </div>
        </section>

        {/* ====================================================== */}
        {/* BADGES */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>{t('badges')}</H2>

          <div className='flex gap-4 flex-wrap'>
            <AppBadge>Primary</AppBadge>

            <AppBadge variant='success'>Success</AppBadge>

            <AppBadge variant='danger'>Danger</AppBadge>

            <AppBadge variant='warning'>Warning</AppBadge>
          </div>
        </section>

        {/* ====================================================== */}
        {/* CARDS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>{t('cards')}</H2>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8'>
            <AppCard>{t('normalCard')}</AppCard>

            <AppCard hover>{t('hoverCard')}</AppCard>
          </div>
        </section>

        {/* ====================================================== */}
        {/* ANIMATIONS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>{t('animations')}</H2>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8'>
            <div className='space-y-4'>
              <AppButton onClick={() => setKey((value) => value + 1)}>
                {t('playAnimation')}
              </AppButton>
              <AppCard key={key} className='animate-fade-up'>
                {t('fadeInUp')}
              </AppCard>
            </div>

            <div className='relative h-56 overflow-hidden rounded-xl border sm:h-72 lg:h-80'>
              <AuthBlob />
            </div>

            <PulseIndicator />
          </div>
        </section>
        {/* ====================================================== */}
        {/* StepIndicartor */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>StepIndicator</H2>
          <StepIndicator
            currentStep={1}
            totalSteps={4}
            labels={['Personales', 'Educación', 'Skills', 'Objetivos']}
          />
          <StepIndicator
            currentStep={2}
            totalSteps={4}
            labels={['Personales', 'Educación', 'Skills', 'Objetivos']}
          />
          <StepIndicator
            currentStep={3}
            totalSteps={4}
            labels={['Personales', 'Educación', 'Skills', 'Objetivos']}
          />
          <StepIndicator
            currentStep={4}
            totalSteps={4}
            labels={['Personales', 'Educación', 'Skills', 'Objetivos']}
          />{' '}
        </section>

        {/* ====================================================== */}
        {/* ONBOARDING MODAL */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>OnboardingModal</H2>
          <OnboardingModal>
            <AppButton>Abrir Onboarding</AppButton>
          </OnboardingModal>
        </section>

        {/* ====================================================== */}
        {/* DASHBOARD CARDS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>Dashboard Cards</H2>

          <div className='space-y-4'>
            {/* <HeroBanner /> */}
            <RadarBanner />
            <ActionPlanCard />
            <WellbeingCard
              onEmojiClick={(moodId) => {
                setCheckinMood(moodId);
                setCheckinStartStep(2);
                setCheckinModalOpen(true);
              }}
            />

            <SkillsGapCard onVerDetalles={() => setSkillsModalOpen(true)} />
            <AppButton onClick={() => setSkillsModalOpen(true)}>
              Abrir SkillsGapModal
            </AppButton>
            <SkillsGapModal
              open={skillsModalOpen}
              onOpenChange={setSkillsModalOpen}
            />

            <AppButton
              onClick={() => {
                setCheckinMood('');
                setCheckinStartStep(1);
                setCheckinModalOpen(true);
              }}
            >
              Abrir CheckinModal
            </AppButton>
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
          </div>
        </section>

        {/* ====================================================== */}
        {/* ICONS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>{t('icons')}</H2>

          <div className='grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-6'>
            <AppIcon
              name='user'
              className='size-12 text-[var(--color-text-muted)] sm:size-16 lg:size-20'
            />
            <AppIcon
              name='bell'
              className='size-12 text-[var(--color-text-muted)] sm:size-16 lg:size-20'
            />
            <AppIcon
              name='settings'
              className='size-12 text-[var(--color-text-muted)] sm:size-16 lg:size-20'
            />
            <AppIcon
              name='heart'
              className='size-12 text-[var(--color-text-muted)] sm:size-16 lg:size-20'
            />
            <AppIcon
              name='chart'
              className='size-12 text-[var(--color-text-muted)] sm:size-16 lg:size-20'
            />
            <AppIcon
              name='google'
              className='size-12 text-[var(--color-text-muted)] sm:size-16 lg:size-20'
            />
            <AppIcon
              name='github'
              className='size-12 text-[var(--color-text-muted)] sm:size-16 lg:size-20'
            />
            <AppIcon
              name='linkedin'
              className='size-12 text-[var(--color-text-muted)] sm:size-16 lg:size-20'
            />
            <AppIcon
              name='lock'
              className='size-12 text-[var(--color-text-muted)] sm:size-16 lg:size-20'
            />
            <AppIcon
              name='lockOpen'
              className='size-12 text-[var(--color-text-muted)] sm:size-16 lg:size-20'
            />
          </div>
        </section>

        {/* ====================================================== */}
        {/* GRID SPACING */}
        {/* ====================================================== */}

        <section className='space-y-8'>
          <H2>{t('gridSpacing')}</H2>

          <div>
            <BodyMedium>gap-4 (16px)</BodyMedium>

            <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <AppCard key={i}>Card</AppCard>
              ))}
            </div>
          </div>

          <div>
            <BodyMedium>gap-8 (32px)</BodyMedium>

            <div className='mt-4 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <AppCard key={i}>Card</AppCard>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function ColorBox({ name, color }: { name: string; color: string }) {
  return (
    <div>
      <div className='h-20 rounded-xl border' style={{ background: color }} />

      <p className='mt-2 text-sm'>{name}</p>
    </div>
  );
}

function RadiusBox({ label, radius }: { label: string; radius: string }) {
  return (
    <div>
      <div
        className='w-24 h-24 bg-[var(--color-primary)]'
        style={{ borderRadius: radius }}
      />

      <p className='mt-2'>{label}</p>
    </div>
  );
}

function ShadowBox({ label, shadow }: { label: string; shadow: string }) {
  return (
    <div
      className='h-32 rounded-xl bg-[var(--color-card)]'
      style={{ boxShadow: shadow }}
    >
      <div className='p-4'>{label}</div>
    </div>
  );
}
