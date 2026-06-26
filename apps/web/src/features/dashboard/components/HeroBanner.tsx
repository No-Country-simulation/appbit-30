import { AppButton } from '@/src/components/app/AppButton';

interface Props {
  nombre?: string;
  progreso?: number;
  cursosCompletados?: number;
}

export function HeroBanner({
  nombre = 'María',
  progreso = 40,
  cursosCompletados = 3,
}: Props) {
  return (
    <section className='relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[#4a1a9e] p-6 text-white sm:p-8'>
      <div className='absolute -right-10 -top-10 size-40 rounded-full bg-white/5' />
      <div className='absolute -bottom-6 -left-6 size-28 rounded-full bg-white/5' />

      <div className='relative z-10'>
        <h1 className='font-heading text-2xl font-black sm:text-3xl'>
          ¡Hola, {nombre}! 👋
        </h1>

        <p className='mt-2 max-w-xl text-sm text-white/80'>
          Has completado <strong className='text-white'>{cursosCompletados} cursos</strong> y llevas el{' '}
          <strong className='text-white'>{progreso}%</strong> de tu plan de formación. ¡Seguí así!
        </p>

        <div className='mt-5 flex flex-wrap gap-3'>
          <AppButton className='!border-white/30 !bg-white/15 !text-white hover:!border-white hover:!bg-white/25'>
            Continuar ruta SQL
          </AppButton>
          <AppButton
            variant='outline'
            className='!border-white/30 !text-white hover:!border-white hover:!bg-white/10'
          >
            Ver vacantes
          </AppButton>
        </div>
      </div>
    </section>
  );
}
