'use client';

import { Play } from 'lucide-react';
import { ProgressBar } from '@/src/components/app/ProgressBar';

interface Props {
  titulo: string;
  duracionActual: string;
  duracionTotal: string;
  progreso: number;
  videoUrl?: string;
}

export function VideoPlayer({ titulo, duracionActual, duracionTotal, progreso, videoUrl }: Props) {
  return (
    <div className='overflow-hidden rounded-xl bg-black'>
      <div className='flex aspect-video items-center justify-center bg-gradient-to-br from-[#1a1a3e] to-[#2d1b69]'>
        {videoUrl ? (
          <video src={videoUrl} className='size-full object-cover' controls />
        ) : (
          <button className='flex size-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30'>
            <Play className='size-8 translate-x-0.5' />
          </button>
        )}
      </div>

      <div className='space-y-2 px-4 py-3'>
        <h3 className='text-sm font-semibold text-white'>{titulo}</h3>

        <div className='flex items-center justify-between text-xs text-white/60'>
          <span>{duracionActual} / {duracionTotal}</span>
          <span>{progreso}%</span>
        </div>

        <ProgressBar value={progreso} className='bg-white/20' barClassName='bg-white' />
      </div>
    </div>
  );
}
