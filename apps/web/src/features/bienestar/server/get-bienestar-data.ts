import { dbClient } from '@/src/server/clients/db.client';
import type { BienestarCalendarDay, BienestarData, MoodTone } from '../types';
import { buildProfileCompletion } from '@/src/features/profile/profile-completion';

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfUtcMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function getEmoji(value: string) {
  const emojis: Record<string, string> = {
    Genial: '😄',
    Bien: '🙂',
    Neutral: '😐',
    Triste: '😢',
    Agotado: '😩',
  };

  return emojis[value] ?? '😐';
}

function getToneFromScore(score: number): Exclude<MoodTone, 'empty'> {
  if (score >= 7) return 'positive';
  if (score >= 5.5) return 'neutral';
  return 'negative';
}

function getWeekDays(locale: string) {
  return locale === 'pt'
    ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
}

function getMonthLabel(date: Date, locale: string) {
  const formatter = new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'es', {
    month: 'long',
  });

  const label = formatter.format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildCalendar(params: {
  checkins: {
    emoji: string;
    nota_diaria: unknown;
    creado_en: Date;
  }[];
  locale: string;
  now: Date;
}) {
  const { checkins, locale, now } = params;

  const monthStart = startOfUtcMonth(now);
  const nextMonthStart = addMonths(monthStart, 1);
  const daysInMonth = Math.round(
    (nextMonthStart.getTime() - monthStart.getTime()) / 86_400_000,
  );

  const firstWeekDay = monthStart.getUTCDay();
  const leadingEmptyDays = firstWeekDay === 0 ? 6 : firstWeekDay - 1;

  const checkinByDay = new Map<number, (typeof checkins)[number]>();

  for (const checkin of checkins) {
    const day = checkin.creado_en.getUTCDate();
    checkinByDay.set(day, checkin);
  }

  const days: BienestarCalendarDay[] = [];

  for (let index = 0; index < leadingEmptyDays; index++) {
    days.push({
      key: `empty-${index}`,
      day: null,
      tone: 'empty',
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const checkin = checkinByDay.get(day);

    if (!checkin) {
      days.push({
        key: `day-${day}`,
        day,
        tone: 'empty',
      });
      continue;
    }

    const score = Number(checkin.nota_diaria);

    days.push({
      key: `day-${day}`,
      day,
      emoji: getEmoji(checkin.emoji),
      tone: getToneFromScore(score),
    });
  }

  return {
    monthLabel: getMonthLabel(now, locale),
    weekDays: getWeekDays(locale),
    days,
  };
}

function calculateBreakdown(
  checkins: {
    nota_diaria: unknown;
  }[],
) {
  if (checkins.length === 0) {
    return {
      positivePercent: 0,
      neutralPercent: 0,
      negativePercent: 0,
    };
  }

  let positive = 0;
  let neutral = 0;
  let negative = 0;

  for (const checkin of checkins) {
    const tone = getToneFromScore(Number(checkin.nota_diaria));

    if (tone === 'positive') positive++;
    if (tone === 'neutral') neutral++;
    if (tone === 'negative') negative++;
  }

  return {
    positivePercent: clampPercent((positive / checkins.length) * 100),
    neutralPercent: clampPercent((neutral / checkins.length) * 100),
    negativePercent: clampPercent((negative / checkins.length) * 100),
  };
}

function calculateAverage(
  checkins: {
    nota_diaria: unknown;
  }[],
) {
  if (checkins.length === 0) return null;

  const total = checkins.reduce(
    (sum, checkin) => sum + Number(checkin.nota_diaria),
    0,
  );

  return Number((total / checkins.length).toFixed(1));
}

export async function getBienestarData(params: {
  usuarioId: string;
  locale: string;
}): Promise<BienestarData> {
  const { usuarioId, locale } = params;

  const now = new Date();
  const todayStart = startOfUtcDay(now);
  const sevenDaysAgo = addDays(todayStart, -6);
  const monthStart = startOfUtcMonth(now);
  const nextMonthStart = addMonths(monthStart, 1);

  const usuario = await dbClient.usuarios.findUnique({
    where: {
      usuario_id: usuarioId,
    },
    select: {
      nombre_completo: true,
      avatar_url: true,
      onboarding_status: true,
      pais: true,
      ciudad: true,
      home_cluster: true,
      whatsapp_codigo: true,
      whatsapp_numero: true,
      perfil_movilidad: {
        select: {
          id: true,
          home_cluster: true,
        },
      },
      respuestas_salud: {
        orderBy: {
          creado_en: 'desc',
        },
        take: 1,
        select: {
          mensaje: true,
          accion_sugerida: true,
          derivar_cvv: true,
          alerta: true,
          creado_en: true,
        },
      },
      check_ins: {
        where: {
          creado_en: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        orderBy: {
          creado_en: 'asc',
        },
        select: {
          emoji: true,
          nota_diaria: true,
          creado_en: true,
        },
      },
      alertas_offline: {
        where: {
          vista: false,
        },
        orderBy: {
          creado_en: 'desc',
        },
        take: 1,
        select: {
          mensaje: true,
        },
      },
    },
  });

  if (!usuario) {
    return {
      user: {},
      latestResponse: null,
      weeklyAverage: null,
      monthlyBreakdown: {
        positivePercent: 0,
        neutralPercent: 0,
        negativePercent: 0,
      },
      calendar: {
        monthLabel: getMonthLabel(now, locale),
        weekDays: getWeekDays(locale),
        days: [],
      },
      offlineAlert: null,
      shouldShowUrgentHelp: false,
    };
  }

  const weeklyCheckins = usuario.check_ins.filter(
    (checkin) => checkin.creado_en >= sevenDaysAgo,
  );

  const weeklyAverage = calculateAverage(weeklyCheckins);
  const monthlyBreakdown = calculateBreakdown(usuario.check_ins);

  const latestResponse = usuario.respuestas_salud[0] ?? null;

  const profileCompletion = buildProfileCompletion(usuario);

  return {
    user: {
      name: usuario.nombre_completo,
      avatarUrl: usuario.avatar_url,
      profilePercent: profileCompletion.profilePercent,
      perfilBreakdown: profileCompletion.perfilBreakdown,
    },
    latestResponse: latestResponse
      ? {
          mensaje: latestResponse.mensaje,
          accionSugerida: latestResponse.accion_sugerida,
          derivarCvv: latestResponse.derivar_cvv,
          alerta: latestResponse.alerta,
          creadoEn: latestResponse.creado_en.toISOString(),
        }
      : null,
    weeklyAverage,
    monthlyBreakdown,
    calendar: buildCalendar({
      checkins: usuario.check_ins,
      locale,
      now,
    }),
    offlineAlert: usuario.alertas_offline[0] ?? null,
    shouldShowUrgentHelp:
      Boolean(latestResponse?.derivar_cvv) ||
      Boolean(latestResponse?.alerta) ||
      (weeklyAverage != null && weeklyAverage < 5),
  };
}
