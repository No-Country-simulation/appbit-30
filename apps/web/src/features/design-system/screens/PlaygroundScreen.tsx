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
} from '@/src/components';

export default function PlaygroundScreen() {
  return (
    <AppShell>
      <div className='space-y-16'>
        {/* ====================================================== */}
        {/* TYPOGRAPHY */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H1>Typography</H1>

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
          <H2>Color Tokens</H2>

          <div className='grid grid-cols-4 gap-4'>
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
          <H2>Radius Tokens</H2>

          <div className='flex gap-8 items-end'>
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
          <H2>Shadow Tokens</H2>

          <div className='grid grid-cols-3 gap-6'>
            <ShadowBox label='shadow-sm' shadow='var(--shadow-sm)' />

            <ShadowBox label='shadow-md' shadow='var(--shadow-md)' />

            <ShadowBox label='shadow-lg' shadow='var(--shadow-lg)' />
          </div>
        </section>

        {/* ====================================================== */}
        {/* BUTTONS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>Buttons</H2>

          <div className='flex gap-4 flex-wrap'>
            <AppButton>Primary</AppButton>

            <AppButton variant='outline'>Outline</AppButton>

            <AppButton disabled>Disabled</AppButton>
          </div>
        </section>

        {/* ====================================================== */}
        {/* INPUTS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>Inputs</H2>

          <div className='max-w-md space-y-4'>
            <AppInput placeholder='Normal Input' />

            <AppInput value='Filled Input' readOnly />

            <AppInput disabled placeholder='Disabled Input' />
          </div>
        </section>

        {/* ====================================================== */}
        {/* BADGES */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>Badges</H2>

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
          <H2>Cards</H2>

          <div className='grid grid-cols-2 gap-8'>
            <AppCard>Normal Card</AppCard>

            <AppCard hover>Hover Card</AppCard>
          </div>
        </section>

        {/* ====================================================== */}
        {/* ANIMATIONS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>Animations</H2>

          <div className='grid grid-cols-3 gap-8'>
            <AppCard className='animate-fade-up'>Fade In Up</AppCard>

            <div className='relative h-80 border rounded-xl overflow-hidden'>
              <AuthBlob />
            </div>

            <PulseIndicator />
          </div>
        </section>

        {/* ====================================================== */}
        {/* ICONS */}
        {/* ====================================================== */}

        <section className='space-y-4'>
          <H2>Icons</H2>

          <div className='flex gap-8 flex-wrap'>
            <AppIcon
              name='user'
              className='h-50 w-50 text-[var(--color-text-muted)]'
            />

            <AppIcon
              name='bell'
              className='h-50 w-50 text-[var(--color-text-muted)]'
            />

            <AppIcon
              name='settings'
              className='h-50 w-50 text-[var(--color-text-muted)]'
            />

            <AppIcon
              name='heart'
              className='h-50 w-50 text-[var(--color-text-muted)]'
            />

            <AppIcon
              name='chart'
              className='h-50 w-50 text-[var(--color-text-muted)]'
            />

            <AppIcon
              name='google'
              className='h-50 w-50 text-[var(--color-text-muted)]'
            />

            <AppIcon
              name='github'
              className='h-50 w-50 text-[var(--color-text-muted)]'
            />

            <AppIcon
              name='linkedin'
              className='h-50 w-50 text-[var(--color-text-muted)]'
            />
          </div>
        </section>

        {/* ====================================================== */}
        {/* GRID SPACING */}
        {/* ====================================================== */}

        <section className='space-y-8'>
          <H2>Grid Spacing</H2>

          <div>
            <BodyMedium>gap-4 (16px)</BodyMedium>

            <div className='grid grid-cols-4 gap-4 mt-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <AppCard key={i}>Card</AppCard>
              ))}
            </div>
          </div>

          <div>
            <BodyMedium>gap-8 (32px)</BodyMedium>

            <div className='grid grid-cols-4 gap-8 mt-4'>
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
    <div className='h-32 bg-white rounded-xl' style={{ boxShadow: shadow }}>
      <div className='p-4'>{label}</div>
    </div>
  );
}
