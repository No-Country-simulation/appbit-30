import { dbClient } from '@/src/server/clients/db.client';
import type {
  ModulePlayerData,
  ModulePlayerLesson,
  ModulePlayerModule,
} from '../types';

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatDuration(minutes: unknown) {
  const value = Number(minutes);

  if (!Number.isFinite(value) || value <= 0) {
    return '—';
  }

  return `${Math.round(value)} min`;
}

function mapLessonStatus(status?: string | null): ModulePlayerLesson['estado'] {
  if (status === 'Completada') return 'completada';
  if (status === 'En_progreso') return 'en_progreso';

  return 'proxima';
}

export async function getModulePlayerData(params: {
  usuarioId: string;
  moduleId: string;
  locale: string;
}): Promise<ModulePlayerData | null> {
  const { usuarioId, moduleId, locale } = params;

  const usuario = await dbClient.usuarios.findUnique({
    where: {
      usuario_id: usuarioId,
    },
    select: {
      nombre_completo: true,
      avatar_url: true,
      orientaciones: {
        orderBy: {
          creado_en: 'desc',
        },
        take: 1,
        select: {
          trayectoria_sugerida: true,
        },
      },
      check_ins: {
        orderBy: {
          creado_en: 'desc',
        },
        take: 7,
        select: {
          checkin_id: true,
        },
      },
    },
  });

  const curso = await dbClient.cursos.findUnique({
    where: {
      curso_id: moduleId,
    },
    select: {
      curso_id: true,
      titulo: true,
      subtitulo: true,
      descripcion: true,
      area: true,
      plataforma: true,
      url_externa: true,
      duracion_estimada_dias: true,
      habilidad: {
        select: {
          nombre: true,
        },
      },
      inscripciones: {
        where: {
          usuario_id: usuarioId,
        },
        take: 1,
        select: {
          progreso_porcentaje: true,
          estado: true,
        },
      },
      modulos: {
        orderBy: {
          orden: 'asc',
        },
        select: {
          titulo: true,
          orden: true,
          total_lecciones: true,
          lecciones: {
            orderBy: {
              orden: 'asc',
            },
            select: {
              leccion_id: true,
              titulo: true,
              orden: true,
              duracion_minutos: true,
              video_url: true,
              progreso: {
                where: {
                  usuario_id: usuarioId,
                },
                take: 1,
                select: {
                  estado: true,
                  tiempo_visto_seg: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!curso) return null;

  const flattenedLessons = curso.modulos.flatMap((modulo) =>
    modulo.lecciones.map((leccion) => ({
      moduloTitulo: modulo.titulo,
      leccion,
    })),
  );

  let lessons: ModulePlayerLesson[] = flattenedLessons.map((item, index) => {
    const progreso = item.leccion.progreso[0];

    return {
      id: item.leccion.leccion_id,
      canComplete: true,
      numero: index + 1,
      titulo: item.leccion.titulo,
      duracion: formatDuration(item.leccion.duracion_minutos),
      estado: mapLessonStatus(progreso?.estado),
      videoUrl: item.leccion.video_url,
    };
  });

  if (lessons.length === 0) {
    lessons = [
      {
        id: curso.curso_id,
        canComplete: false,
        numero: 1,
        titulo: curso.subtitulo ?? curso.titulo,
        duracion: curso.duracion_estimada_dias
          ? `${curso.duracion_estimada_dias} ${locale === 'pt' ? 'dias' : 'días'}`
          : '—',
        estado: 'en_progreso',
        videoUrl: null,
      },
    ];
  }

  if (!lessons.some((lesson) => lesson.estado === 'en_progreso')) {
    const firstPendingIndex = lessons.findIndex(
      (lesson) => lesson.estado !== 'completada',
    );

    if (firstPendingIndex >= 0) {
      lessons = lessons.map((lesson, index) =>
        index === firstPendingIndex
          ? {
              ...lesson,
              estado: 'en_progreso',
            }
          : lesson,
      );
    }
  }

  const currentLesson =
    lessons.find((lesson) => lesson.estado === 'en_progreso') ?? lessons[0];

  const modules: ModulePlayerModule[] =
    curso.modulos.length > 0
      ? curso.modulos.map((modulo) => {
          const lecciones = modulo.lecciones;
          const completed = lecciones.filter(
            (leccion) => leccion.progreso[0]?.estado === 'Completada',
          ).length;

          const hasInProgress = lecciones.some(
            (leccion) => leccion.progreso[0]?.estado === 'En_progreso',
          );

          return {
            titulo: modulo.titulo,
            completado: lecciones.length > 0 && completed === lecciones.length,
            enProgreso: hasInProgress,
            leccionesCompletadas: completed,
            totalLecciones: lecciones.length || modulo.total_lecciones || 0,
          };
        })
      : [
          {
            titulo: curso.titulo,
            completado: false,
            enProgreso: true,
            leccionesCompletadas: 0,
            totalLecciones: 1,
          },
        ];

  const progress = clampPercent(
    curso.inscripciones[0]?.progreso_porcentaje ?? 0,
  );

  const trayectoria = usuario?.orientaciones[0]?.trayectoria_sugerida;
  const ruta =
    Array.isArray(trayectoria) && typeof trayectoria[0] === 'string'
      ? trayectoria[0]
      : (curso.habilidad?.nombre ?? curso.area.replaceAll('_', ' '));

  return {
    user: {
      name: usuario?.nombre_completo,
      avatarUrl: usuario?.avatar_url,
    },
    courseId: curso.curso_id,
    moduleTitulo: curso.titulo,
    cursoTitulo: curso.titulo,
    ruta,
    progreso: progress,
    leccionActual: currentLesson?.titulo ?? curso.titulo,
    duracionActual: '0:00',
    duracionTotal: currentLesson?.duracion ?? '—',
    progresoLeccion: currentLesson?.estado === 'completada' ? 100 : 0,
    videoUrl: currentLesson?.videoUrl ?? null,
    externalUrl: curso.url_externa,
    lecciones: lessons,
    modulos: modules,
    racha: usuario?.check_ins.length ?? 0,
    certificado: curso.titulo,
    puntos: 15,
    desbloquea: locale === 'pt' ? 'Próximo módulo' : 'Próximo módulo',
  };
}
