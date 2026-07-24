'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MobilityInsight } from '../types';

interface Props {
  mobility: MobilityInsight;
  showDatasetSource?: boolean;
  className?: string;
}

const CATEGORY_STYLES: Record<
  Exclude<MobilityInsight['category'], 'unavailable'>,
  string
> = {
  remote: 'bg-blue-50 text-blue-700',
  compatible: 'bg-green-50 text-green-700',
  moderate: 'bg-amber-50 text-amber-700',
  distant: 'bg-slate-100 text-slate-700',
};

function displayCluster(cluster: string) {
  return cluster.replaceAll('_', ' ');
}

export function MobilityInsightDisplay({
  mobility,
  showDatasetSource = false,
  className,
}: Props) {
  const t = useTranslations('Empleabilidad');
  const format = useFormatter();

  if (mobility.category === 'unavailable') return null;

  const formattedDistance = format.number(mobility.distanceKm ?? 0, {
    maximumFractionDigits: 1,
    minimumFractionDigits: (mobility.distanceKm ?? 0) > 0 ? 1 : 0,
  });
  const label =
    mobility.category === 'remote'
      ? t('movilidadRemota')
      : mobility.category === 'compatible'
        ? t('movilidadCompatible', { distancia: formattedDistance })
        : mobility.category === 'moderate'
          ? t('movilidadModerada', { distancia: formattedDistance })
          : t('movilidadDistante', { distancia: formattedDistance });
  const destination =
    mobility.destinationCluster === null
      ? null
      : [
          displayCluster(mobility.destinationCluster),
          mobility.destinationMunicipality,
        ]
          .filter(Boolean)
          .join(' · ');

  return (
    <div className={cn('min-w-0', className)}>
      <span
        className={cn(
          'inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
          CATEGORY_STYLES[mobility.category],
        )}
      >
        <MapPin className='size-3.5 shrink-0' />
        <span className='min-w-0 break-words'>{label}</span>
      </span>

      {showDatasetSource &&
        mobility.source === 'florianopolis_dataset' &&
        mobility.originCluster && (
          <div className='mt-2 space-y-1 text-xs leading-relaxed text-[var(--color-text-muted)]'>
            {destination && (
              <p>{t('movilidadZonaDestino', { destino: destination })}</p>
            )}
            <p>
              {t('movilidadFuenteDataset', {
                origen: displayCluster(mobility.originCluster),
              })}
            </p>
          </div>
        )}
    </div>
  );
}
