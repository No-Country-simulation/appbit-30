import type { Prisma } from '@/src/server/generated/prisma';
import { getUserSkillsMatch } from '@/src/server/progress/skill-progress';

export interface ProgressHistorySeriesPoint {
  period: string;
  match: number;
}

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, amount: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1),
  );
}

function periodKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function getProgressHistory(params: {
  client: Pick<
    Prisma.TransactionClient,
    'historialProgreso' | 'usuarioHabilidades'
  >;
  usuarioId: string;
  months: number;
  now?: Date;
  includeEvents?: boolean;
}) {
  const now = params.now ?? new Date();
  const endExclusive = addMonths(monthStart(now), 1);
  const start = addMonths(monthStart(now), -(params.months - 1));

  const [firstEvent, priorEvent, rangeEvents, currentMatch] = await Promise.all([
    params.client.historialProgreso.findFirst({
      where: { usuario_id: params.usuarioId },
      orderBy: { creado_en: 'asc' },
      select: { match_anterior: true, match_nuevo: true },
    }),
    params.client.historialProgreso.findFirst({
      where: {
        usuario_id: params.usuarioId,
        creado_en: { lt: start },
      },
      orderBy: { creado_en: 'desc' },
      select: { match_nuevo: true },
    }),
    params.client.historialProgreso.findMany({
      where: {
        usuario_id: params.usuarioId,
        creado_en: { gte: start, lt: endExclusive },
      },
      orderBy: { creado_en: 'asc' },
      select: {
        historial_id: true,
        tipo_evento: true,
        entidad_id: true,
        titulo: true,
        match_anterior: true,
        match_nuevo: true,
        metadatos: true,
        creado_en: true,
      },
    }),
    getUserSkillsMatch(params.client, params.usuarioId),
  ]);

  let carriedMatch =
    priorEvent?.match_nuevo ??
    rangeEvents[0]?.match_anterior ??
    firstEvent?.match_anterior ??
    currentMatch;

  const eventsByPeriod = new Map<string, typeof rangeEvents>();

  for (const event of rangeEvents) {
    const key = periodKey(event.creado_en);
    const values = eventsByPeriod.get(key) ?? [];
    values.push(event);
    eventsByPeriod.set(key, values);
  }

  const series: ProgressHistorySeriesPoint[] = [];

  for (let index = 0; index < params.months; index += 1) {
    const month = addMonths(start, index);
    const events = eventsByPeriod.get(periodKey(month));

    if (events?.length) {
      carriedMatch = events.at(-1)?.match_nuevo ?? carriedMatch;
    }

    if (index === params.months - 1) {
      carriedMatch = currentMatch;
    }

    series.push({
      period: periodKey(month),
      match: carriedMatch,
    });
  }

  const initialMatch = firstEvent?.match_anterior ?? currentMatch;

  return {
    initialMatch,
    currentMatch,
    variation: currentMatch - initialMatch,
    series,
    events: params.includeEvents
      ? [...rangeEvents]
          .reverse()
          .slice(0, 30)
          .map((event) => ({
            id: event.historial_id,
            type: event.tipo_evento,
            entityId: event.entidad_id,
            title: event.titulo,
            matchBefore: event.match_anterior,
            matchAfter: event.match_nuevo,
            metadata: event.metadatos,
            occurredAt: event.creado_en.toISOString(),
          }))
      : [],
  };
}
