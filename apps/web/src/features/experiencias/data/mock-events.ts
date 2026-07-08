export interface Video {
  id: string;
  title: string;
  speaker: string;
  imageUrl: string;
  category: string;
}

export interface EventItem {
  id: string;
  title: string;
  speaker: string;
  company?: string;
  date: string;
  time: string;
  location?: string;
  isHotspot?: boolean;
  type: 'live' | 'upcoming';
  actionLabel: string;
  icon: 'video' | 'calendar';
}

export const CATEGORIES = [
  { id: 'todas', labelKey: 'todas' },
  { id: 'reconversion', labelKey: 'reconversion' },
  { id: 'maternidad', labelKey: 'maternidad' },
] as const;

export const mockVideos: Video[] = [
  {
    id: 'v1',
    title: 'experienciasVideo1Title',
    speaker: 'experienciasVideo1Speaker',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop',
    category: 'reconversion',
  },
  {
    id: 'v2',
    title: 'experienciasVideo2Title',
    speaker: 'experienciasVideo2Speaker',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=250&fit=crop',
    category: 'maternidad',
  },
  {
    id: 'v3',
    title: 'experienciasVideo3Title',
    speaker: 'experienciasVideo3Speaker',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=250&fit=crop',
    category: 'reconversion',
  },
];

export const mockEvents: EventItem[] = [
  {
    id: 'e1',
    title: 'experienciasEvent1Title',
    speaker: 'experienciasEvent1Speaker',
    company: 'experienciasEvent1Company',
    date: '15 Jun',
    time: '19:00 hs',
    location: 'experienciasCercaTuyo',
    isHotspot: true,
    type: 'live',
    actionLabel: 'reservarLugar',
    icon: 'video',
  },
  {
    id: 'e2',
    title: 'experienciasEvent2Title',
    speaker: 'experienciasEvent2Speaker',
    date: '22 Jun',
    time: '18:30 hs',
    type: 'upcoming',
    actionLabel: 'anotarme',
    icon: 'calendar',
  },
];
