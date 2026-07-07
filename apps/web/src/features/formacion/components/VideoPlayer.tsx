'use client';

import { useTranslations } from 'next-intl';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, Download } from 'lucide-react';
import { useState } from 'react';

interface Props {
  titulo: string;
  leccionNumero?: number;
  totalLecciones?: number;
  duracionActual: string;
  duracionTotal: string;
  progreso: number;
  videoUrl?: string;
}

export function VideoPlayer({
  titulo,
  leccionNumero,
  totalLecciones,
  duracionActual,
  duracionTotal,
  progreso,
  videoUrl,
}: Props) {
  const t = useTranslations('Formacion');
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className='overflow-hidden rounded-xl bg-[#1a1a3e]'>
      <div className='relative aspect-video flex items-center justify-center bg-gradient-to-br from-[#1a1a3e] to-[#2d1b69]'>
        {videoUrl ? (
          <video src={videoUrl} className='size-full object-cover' controls />
        ) : (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className='flex size-16 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg transition-transform hover:scale-105'
          >
            {isPlaying ? (
              <Pause className='size-8' />
            ) : (
              <Play className='size-8 translate-x-0.5' />
            )}
          </button>
        )}

        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
          {leccionNumero && totalLecciones && (
            <p className='text-xs text-white/60'>
              {t('leccion')} {leccionNumero} {t('de')} {totalLecciones}
            </p>
          )}
          <h3 className='text-sm font-semibold text-white'>{titulo}</h3>
        </div>
      </div>

      <div className='flex items-center gap-3 bg-[#1a1a3e] px-4 py-3'>
        <button className='text-white/60 hover:text-white'>
          <SkipBack className='size-4' />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className='text-white hover:text-white/80'
        >
          {isPlaying ? <Pause className='size-5' /> : <Play className='size-5' />}
        </button>
        <button className='text-white/60 hover:text-white'>
          <SkipForward className='size-4' />
        </button>

        <div className='flex-1'>
          <div className='h-1 rounded-full bg-white/20'>
            <div
              className='h-full rounded-full bg-amber-400'
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        <span className='text-xs text-white/60'>
          {duracionActual} / {duracionTotal}
        </span>

        <button className='text-white/60 hover:text-white'>
          <Volume2 className='size-4' />
        </button>
        <button className='text-white/60 hover:text-white'>
          <Maximize className='size-4' />
        </button>
        <button className='text-white/60 hover:text-white'>
          <Download className='size-4' />
        </button>
      </div>
    </div>
  );
}
