import { dbClient } from '@/src/server/clients/db.client';
import type { Prisma } from '@/src/server/generated/prisma';
import type {
  FormacionCourseCard,
  FormacionData,
  FormacionDownloadItem,
} from '../types';
import { buildProfileCompletion } from '@/src/features/profile/profile-completion';

const cursoSelect = {
  curso_id: true,
  titulo: true,
  subtitulo: true,
  descripcion: true,
  area: true,
  tipo: true,
  plataforma: true,
  url_externa: true,
  duracion_estimada_dias: true,
  imagen_portada_url: true,
  habilidad: {
    select: {
      nombre: true,
    },
  },
  recursos_descarga: {
    select: {
      titulo: true,
      tipo: true,
      tamanio_mb: true,
      url_descarga: true,
    },
    orderBy: {
      creado_en: 'asc',
    },
  },
  modulos: {
    select: {
      modulo_id: true,
      lecciones: {
        where: {
          video_url: {
            not: null,
          },
        },
        take: 1,
        select: {
          leccion_id: true,
          video_url: true,
        },
      },
    },
  },
} satisfies Prisma.CursosSelect;

type CursoForCard = Prisma.CursosGetPayload<{
  select: typeof cursoSelect;
}>;

function areaLabel(area: string, locale: string) {
  const labels: Record<string, { es: string; pt: string }> = {
    Data_Analytics: {
      es: 'Data & Analytics',
      pt: 'Data & Analytics',
    },
    Desarrollo_Web: {
      es: 'Desarrollo Web',
      pt: 'Desenvolvimento Web',
    },
    UX_UI_Design: {
      es: 'UX / UI Design',
      pt: 'UX / UI Design',
    },
    Ciberseguridad: {
      es: 'Ciberseguridad',
      pt: 'Cibersegurança',
    },
    Cloud_DevOps: {
      es: 'Cloud & DevOps',
      pt: 'Cloud & DevOps',
    },
    Inteligencia_Artificial: {
      es: 'Inteligencia Artificial',
      pt: 'Inteligência Artificial',
    },
    Marketing_Digital: {
      es: 'Marketing Digital',
      pt: 'Marketing Digital',
    },
    Product_Management: {
      es: 'Product Management',
      pt: 'Product Management',
    },
  };

  const lang = locale === 'pt' ? 'pt' : 'es';

  return labels[area]?.[lang] ?? area.replaceAll('_', ' ');
}

function compactLabels(labels: string[]) {
  if (labels.length <= 2) return labels.join(' + ');
  return `${labels.slice(0, 2).join(' + ')} +${labels.length - 2}`;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function uniqueCourses(courses: FormacionCourseCard[]) {
  const seen = new Set<string>();

  return courses.filter((course) => {
    if (seen.has(course.id)) return false;
    seen.add(course.id);
    return true;
  });
}

function toDownloadItems(curso: CursoForCard | null): FormacionDownloadItem[] {
  if (!curso) return [];

  return curso.recursos_descarga.map((resource) => ({
    titulo: resource.titulo,
    tipo: resource.tipo ?? 'Archivo',
    tamanioMb: resource.tamanio_mb != null ? Number(resource.tamanio_mb) : 0,
    url: resource.url_descarga,
  }));
}

function toCourseCard(params: {
  curso: CursoForCard;
  locale: string;
  progressByCourseId: Map<string, number>;
  planTitle?: string | null;
  actionLabel?: string | null;
  priority?: string | null;
}): FormacionCourseCard {
  const {
    curso,
    locale,
    progressByCourseId,
    planTitle = null,
    actionLabel = null,
    priority = null,
  } = params;

  const hasInternalContent = curso.modulos.some((modulo) =>
    modulo.lecciones.some((leccion) => Boolean(leccion.video_url)),
  );

  const progress = clampPercent(
    progressByCourseId.get(curso.curso_id) ?? 0,
  );

  return {
    id: curso.curso_id,
    title: curso.titulo,
    subtitle: curso.subtitulo,
    description: curso.descripcion,
    area: curso.area,
    areaLabel: areaLabel(curso.area, locale),
    type: curso.tipo,
    platform: curso.plataforma,
    externalUrl: curso.url_externa,
    durationDays: curso.duracion_estimada_dias,
    skillName: curso.habilidad?.nombre ?? null,
    progress,
    isCompleted: progress === 100,
    planTitle,
    actionLabel,
    priority,
    hasInternalContent,
  };
}

function getRutaLabel(params: {
  locale: string;
  areaValues: string[];
  trayectoriaSugerida: unknown;
}) {
  const { locale, areaValues, trayectoriaSugerida } = params;

  const areaLabels = areaValues.map((area) => areaLabel(area, locale));

  if (areaLabels.length > 1) {
    return compactLabels(areaLabels);
  }

  if (
    Array.isArray(trayectoriaSugerida) &&
    typeof trayectoriaSugerida[0] === 'string' &&
    trayectoriaSugerida[0].trim()
  ) {
    return trayectoriaSugerida[0];
  }

  return areaLabels[0] ?? (locale === 'pt' ? 'Rota inicial' : 'Ruta inicial');
}

export async function getFormacionData(params: {
  usuarioId: string;
  locale: string;
}): Promise<FormacionData> {
  const { usuarioId, locale } = params;

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
      usuario_areas_interes: {
        select: {
          area: true,
        },
      },
      usuario_tipo_conexion: {
        select: {
          tipo_conexion: true,
        },
      },
      orientaciones: {
        orderBy: {
          creado_en: 'desc',
        },
        take: 1,
        select: {
          trayectoria_sugerida: true,
        },
      },
      plan_accion: {
        orderBy: {
          orden: 'asc',
        },
        select: {
          plan_item_id: true,
          titulo: true,
          descripcion: true,
          prioridad: true,
          completado: true,
          orden: true,
          accion_label: true,
          curso: {
            select: cursoSelect,
          },
        },
      },
      inscripciones_curso: {
        select: {
          curso_id: true,
          progreso_porcentaje: true,
          estado: true,
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

  if (!usuario) {
    return {
      user: {},
      rutaLabel: locale === 'pt' ? 'Rota inicial' : 'Ruta inicial',
      showInclusionBanner: false,
      currentCourse: null,
      actionPlan: [],
      recommendedCourses: [],
      paidCourses: [],
      offlineItems: [],
      streakDays: 0,
    };
  }

  const areaValues = usuario.usuario_areas_interes.map((item) => item.area);

  const progressByCourseId = new Map(
    usuario.inscripciones_curso.map((inscripcion) => [
      inscripcion.curso_id,
      clampPercent(inscripcion.progreso_porcentaje),
    ]),
  );

  const planCourses = usuario.plan_accion
    .filter((item) => Boolean(item.curso))
    .map((item) =>
      toCourseCard({
        curso: item.curso!,
        locale,
        progressByCourseId,
        planTitle: item.titulo,
        actionLabel: item.accion_label,
        priority: item.prioridad,
      }),
    );

  const currentFromPlan =
    planCourses.find((course) => course.progress < 100) ??
    planCourses[0] ??
    null;

  const fallbackCursos = await dbClient.cursos.findMany({
    where: {
      activo: true,
      area: areaValues.length > 0 ? { in: areaValues } : undefined,
    },
    orderBy: [
      {
        tipo: 'asc',
      },
      {
        creado_en: 'asc',
      },
    ],
    select: cursoSelect,
  });

  const fallbackCourseCards = fallbackCursos.map((curso) =>
    toCourseCard({
      curso,
      locale,
      progressByCourseId,
    }),
  );

  const currentCourse =
    currentFromPlan ??
    fallbackCourseCards.find((course) => course.type === 'Gratuito') ??
    fallbackCourseCards[0] ??
    null;

  const actionPlan = usuario.plan_accion.map((item) => ({
    id: item.plan_item_id,
    title: item.titulo,
    description: item.descripcion,
    priority: item.prioridad,
    completed: item.completado,
    actionLabel: item.accion_label,
    courseId: item.curso?.curso_id ?? null,
  }));

  const recommendedCourses = uniqueCourses([
    ...planCourses.filter((course) => course.id !== currentCourse?.id),
    ...fallbackCourseCards.filter(
      (course) => course.type === 'Gratuito' && course.id !== currentCourse?.id,
    ),
  ]).slice(0, 6);

  const paidCourses = uniqueCourses(
    fallbackCourseCards.filter(
      (course) => course.type === 'Pago' && course.id !== currentCourse?.id,
    ),
  ).slice(0, 4);

  const unstableConnectionTypes = new Set([
    'Datos_moviles',
    'Conexion_inestable',
    'Sin_conexion_casa',
  ]);

  const showInclusionBanner = usuario.usuario_tipo_conexion.some((item) =>
    unstableConnectionTypes.has(item.tipo_conexion),
  );

  const rawTrayectoria = usuario.orientaciones[0]?.trayectoria_sugerida ?? [];

  const profileCompletion = buildProfileCompletion(usuario);

  return {
    user: {
      name: usuario.nombre_completo,
      avatarUrl: usuario.avatar_url,
      profilePercent: profileCompletion.profilePercent,
      perfilBreakdown: profileCompletion.perfilBreakdown,
    },
    rutaLabel: getRutaLabel({
      locale,
      areaValues,
      trayectoriaSugerida: rawTrayectoria,
    }),
    showInclusionBanner,
    currentCourse,
    actionPlan,
    recommendedCourses,
    paidCourses,
    offlineItems: toDownloadItems(
      fallbackCursos.find((curso) => curso.curso_id === currentCourse?.id) ??
        null,
    ),
    streakDays: usuario.check_ins.length,
  };
}
