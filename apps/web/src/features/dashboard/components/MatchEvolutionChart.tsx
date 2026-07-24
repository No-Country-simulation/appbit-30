'use client';

import { useLocale, useTranslations } from 'next-intl';

interface Point {
  period: string;
  match: number;
}

interface Props {
  series: readonly Point[];
  compact?: boolean;
}

function buildCoordinates(series: readonly Point[], width: number, height: number) {
  const values = series.map((point) => point.match);
  const minimum = Math.max(0, Math.min(...values) - 8);
  const maximum = Math.min(100, Math.max(...values) + 8);
  const range = Math.max(1, maximum - minimum);
  const horizontalPadding = 18;
  const verticalPadding = 18;

  return series.map((point, index) => ({
    ...point,
    x:
      series.length === 1
        ? width / 2
        : horizontalPadding +
          (index / (series.length - 1)) * (width - horizontalPadding * 2),
    y:
      verticalPadding +
      ((maximum - point.match) / range) * (height - verticalPadding * 2),
  }));
}

function periodDate(period: string) {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

export function MatchEvolutionChart({ series, compact = false }: Props) {
  const locale = useLocale();
  const t = useTranslations('Dashboard');
  const width = compact ? 280 : 520;
  const height = compact ? 92 : 160;

  if (series.length === 0) return null;

  const coordinates = buildCoordinates(series, width, height);
  const points = coordinates.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className='w-full' role='img' aria-label={t('historyChartLabel')}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className='h-auto w-full overflow-visible'
        aria-hidden='true'
      >
        <polyline
          points={points}
          fill='none'
          stroke='var(--color-primary)'
          strokeWidth={compact ? 4 : 5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {coordinates.map((point) => (
          <g key={point.period}>
            <circle
              cx={point.x}
              cy={point.y}
              r={compact ? 4 : 5}
              fill='var(--color-card)'
              stroke='var(--color-primary)'
              strokeWidth='3'
            />
            {!compact && (
              <text
                x={point.x}
                y={Math.max(12, point.y - 11)}
                textAnchor='middle'
                className='fill-[var(--color-text)] text-[11px] font-bold'
              >
                {point.match}%
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className='flex justify-between gap-2 text-[10px] font-medium uppercase text-[var(--color-text-muted)]'>
        {series.map((point) => (
          <span key={point.period}>
            {new Intl.DateTimeFormat(locale, { month: 'short' }).format(
              periodDate(point.period),
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
