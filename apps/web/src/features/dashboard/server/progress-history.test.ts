import assert from 'node:assert/strict';
import test from 'node:test';
import { getProgressHistory } from './progress-history';

function createClient(params: {
  firstEvent?: { match_anterior: number; match_nuevo: number } | null;
  priorEvent?: { match_nuevo: number } | null;
  events?: Array<{
    historial_id: string;
    tipo_evento: 'Onboarding' | 'Leccion' | 'Modulo' | 'Curso';
    entidad_id: string;
    titulo: string;
    match_anterior: number;
    match_nuevo: number;
    metadatos: Record<string, unknown>;
    creado_en: Date;
  }>;
  skillProgress?: number[];
}) {
  return {
    historialProgreso: {
      findFirst: async (args: { orderBy: { creado_en: string } }) =>
        args.orderBy.creado_en === 'asc'
          ? (params.firstEvent ?? null)
          : (params.priorEvent ?? null),
      findMany: async () => params.events ?? [],
    },
    usuarioHabilidades: {
      findMany: async () =>
        (params.skillProgress ?? []).map((progreso_porcentaje) => ({
          progreso_porcentaje,
        })),
    },
  };
}

test('returns a stable series when the history is empty', async () => {
  const history = await getProgressHistory({
    client: createClient({ skillProgress: [50, 100] }) as never,
    usuarioId: 'user-id',
    months: 4,
    now: new Date('2026-07-21T12:00:00Z'),
  });

  assert.deepEqual(
    history.series.map((point) => point.match),
    [75, 75, 75, 75],
  );
  assert.equal(history.variation, 0);
});

test('keeps one event and the current match in the monthly series', async () => {
  const history = await getProgressHistory({
    client: createClient({
      firstEvent: { match_anterior: 20, match_nuevo: 35 },
      events: [
        {
          historial_id: 'history-1',
          tipo_evento: 'Leccion',
          entidad_id: 'lesson-1',
          titulo: 'Primera lección',
          match_anterior: 20,
          match_nuevo: 35,
          metadatos: {},
          creado_en: new Date('2026-06-10T12:00:00Z'),
        },
      ],
      skillProgress: [50],
    }) as never,
    usuarioId: 'user-id',
    months: 4,
    now: new Date('2026-07-21T12:00:00Z'),
    includeEvents: true,
  });

  assert.deepEqual(
    history.series.map((point) => point.match),
    [20, 20, 35, 50],
  );
  assert.equal(history.events.length, 1);
  assert.equal(history.variation, 30);
});

test('carries the latest event value through months without activity', async () => {
  const history = await getProgressHistory({
    client: createClient({
      firstEvent: { match_anterior: 10, match_nuevo: 20 },
      events: [
        {
          historial_id: 'history-1',
          tipo_evento: 'Leccion',
          entidad_id: 'lesson-1',
          titulo: 'Lección uno',
          match_anterior: 10,
          match_nuevo: 20,
          metadatos: {},
          creado_en: new Date('2026-04-10T12:00:00Z'),
        },
        {
          historial_id: 'history-2',
          tipo_evento: 'Curso',
          entidad_id: 'course-1',
          titulo: 'Curso completo',
          match_anterior: 20,
          match_nuevo: 80,
          metadatos: {},
          creado_en: new Date('2026-06-10T12:00:00Z'),
        },
      ],
      skillProgress: [80],
    }) as never,
    usuarioId: 'user-id',
    months: 4,
    now: new Date('2026-07-21T12:00:00Z'),
  });

  assert.deepEqual(
    history.series.map((point) => point.match),
    [20, 20, 80, 80],
  );
});
