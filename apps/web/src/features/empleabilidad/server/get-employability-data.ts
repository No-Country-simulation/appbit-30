import { dbClient } from '@/src/server/clients/db.client';
import type { EmployabilityData, VacanteItem } from '../types';

interface MockVacanteBase extends Omit<
  VacanteItem,
  'matchPorcentaje' | 'skills'
> {
  requiredSkills: string[];
}

type AppLocale = 'es' | 'pt';

const MOCK_VACANTES_BY_LOCALE: Record<AppLocale, MockVacanteBase[]> = {
  es: [
    {
      id: 'demo-data-analyst-jr',
      titulo: 'Data Analyst Jr.',
      empresa: 'BiT Talentos',
      empresaDescripcion: 'Tecnología · Equipo regional',
      logoUrl: null,
      area: 'Data Analytics',
      nivel: 'Jr. / Entry Level',
      modalidad: 'Híbrido',
      modalidadDetallada: 'Híbrido flexible',
      ubicacion: 'Florianópolis, Brasil',
      distancia: 'Cerca de tu zona',
      fechaPublicacion: 'hoy',
      descripcion:
        'Buscamos una persona para apoyar el análisis de datos, creación de dashboards y seguimiento de indicadores de negocio.',
      educacionRequerida: [
        'Secundario completo',
        'Formación en datos valorada',
      ],
      experienciaSolicitada: ['Sin experiencia previa excluyente'],
      idioma: ['Portugués', 'Español valorado'],
      jornada: ['Jornada completa'],
      requiredSkills: ['SQL', 'Excel', 'Power BI', 'Python'],
    },
    {
      id: 'demo-frontend-trainee',
      titulo: 'Frontend Trainee',
      empresa: 'Impact Labs',
      empresaDescripcion: 'Producto digital · Startup',
      logoUrl: null,
      area: 'Desarrollo Web',
      nivel: 'Jr. / Entry Level',
      modalidad: 'Remoto',
      modalidadDetallada: '100% remoto',
      ubicacion: 'Brasil / Remoto',
      distancia: null,
      fechaPublicacion: 'esta semana',
      descripcion:
        'Rol inicial para trabajar en interfaces web, componentes reutilizables y mejoras de experiencia de usuario.',
      educacionRequerida: ['Formación técnica o cursos equivalentes'],
      experienciaSolicitada: ['Portfolio o proyectos personales valorados'],
      idioma: ['Portugués'],
      jornada: ['Media jornada', 'Freelance'],
      requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    },
    {
      id: 'demo-ux-research-assistant',
      titulo: 'UX Research Assistant',
      empresa: 'Comunidad UX',
      empresaDescripcion: 'Consultoría · Investigación',
      logoUrl: null,
      area: 'UX / UI Design',
      nivel: 'Jr. / Entry Level',
      modalidad: 'Remoto',
      modalidadDetallada: 'Remoto con encuentros puntuales',
      ubicacion: 'LATAM',
      distancia: null,
      fechaPublicacion: 'ayer',
      descripcion:
        'Apoyo en entrevistas con usuarios, análisis de hallazgos y documentación de oportunidades de mejora.',
      educacionRequerida: ['Cursos de UX/UI o experiencia equivalente'],
      experienciaSolicitada: ['No excluyente'],
      idioma: ['Español', 'Portugués valorado'],
      jornada: ['Media jornada'],
      requiredSkills: ['UX Research', 'Figma', 'Comunicación', 'Empatía'],
    },
  ],

  pt: [
    {
      id: 'demo-data-analyst-jr',
      titulo: 'Data Analyst Jr.',
      empresa: 'BiT Talentos',
      empresaDescripcion: 'Tecnologia · Equipe regional',
      logoUrl: null,
      area: 'Data Analytics',
      nivel: 'Jr. / Entry Level',
      modalidad: 'Híbrido',
      modalidadDetallada: 'Híbrido flexível',
      ubicacion: 'Florianópolis, Brasil',
      distancia: 'Perto da sua região',
      fechaPublicacion: 'hoje',
      descripcion:
        'Buscamos uma pessoa para apoiar a análise de dados, criação de dashboards e acompanhamento de indicadores de negócio.',
      educacionRequerida: [
        'Ensino médio completo',
        'Formação em dados valorizada',
      ],
      experienciaSolicitada: ['Sem experiência prévia obrigatória'],
      idioma: ['Português', 'Espanhol valorizado'],
      jornada: ['Jornada completa'],
      requiredSkills: ['SQL', 'Excel', 'Power BI', 'Python'],
    },
    {
      id: 'demo-frontend-trainee',
      titulo: 'Frontend Trainee',
      empresa: 'Impact Labs',
      empresaDescripcion: 'Produto digital · Startup',
      logoUrl: null,
      area: 'Desenvolvimento Web',
      nivel: 'Jr. / Entry Level',
      modalidad: 'Remoto',
      modalidadDetallada: '100% remoto',
      ubicacion: 'Brasil / Remoto',
      distancia: null,
      fechaPublicacion: 'esta semana',
      descripcion:
        'Vaga inicial para trabalhar em interfaces web, componentes reutilizáveis e melhorias de experiência do usuário.',
      educacionRequerida: ['Formação técnica ou cursos equivalentes'],
      experienciaSolicitada: ['Portfólio ou projetos pessoais valorizados'],
      idioma: ['Português'],
      jornada: ['Meio período', 'Freelance'],
      requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    },
    {
      id: 'demo-ux-research-assistant',
      titulo: 'UX Research Assistant',
      empresa: 'Comunidade UX',
      empresaDescripcion: 'Consultoria · Pesquisa',
      logoUrl: null,
      area: 'UX / UI Design',
      nivel: 'Jr. / Entry Level',
      modalidad: 'Remoto',
      modalidadDetallada: 'Remoto com encontros pontuais',
      ubicacion: 'LATAM',
      distancia: null,
      fechaPublicacion: 'ontem',
      descripcion:
        'Apoio em entrevistas com usuários, análise de descobertas e documentação de oportunidades de melhoria.',
      educacionRequerida: ['Cursos de UX/UI ou experiência equivalente'],
      experienciaSolicitada: ['Não obrigatória'],
      idioma: ['Espanhol', 'Português valorizado'],
      jornada: ['Meio período'],
      requiredSkills: ['UX Research', 'Figma', 'Comunicação', 'Empatia'],
    },
  ],
};

function getLocale(locale: string): AppLocale {
  return locale === 'pt' ? 'pt' : 'es';
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function buildProfilePercent(usuario: {
  onboarding_status: string | null;
  avatar_url: string | null;
  home_cluster: string | null;
  whatsapp_codigo: string | null;
  whatsapp_numero: string | null;
  perfil_movilidad: { id: string; home_cluster: string | null } | null;
}) {
  const onboardingCompleted = usuario.onboarding_status === 'COMPLETED';

  const ubicacionCompleted = Boolean(
    usuario.home_cluster || usuario.perfil_movilidad?.home_cluster,
  );

  const whatsappCompleted = Boolean(
    usuario.whatsapp_codigo && usuario.whatsapp_numero,
  );

  let profilePercent = 0;

  if (onboardingCompleted) profilePercent += 50;
  if (usuario.perfil_movilidad) profilePercent += 20;
  if (usuario.avatar_url) profilePercent += 10;
  if (ubicacionCompleted) profilePercent += 10;
  if (whatsappCompleted) profilePercent += 10;

  return {
    profilePercent,
    perfilBreakdown: {
      onboarding: onboardingCompleted,
      movilidad: Boolean(usuario.perfil_movilidad),
      avatar: Boolean(usuario.avatar_url),
      ubicacion: ubicacionCompleted,
      whatsapp: whatsappCompleted,
    },
  };
}

function buildVacante(
  vacante: MockVacanteBase,
  userSkills: Array<{ name: string; progress: number }>,
): VacanteItem {
  const progressBySkillName = new Map(
    userSkills.map((skill) => [normalize(skill.name), skill.progress]),
  );

  const matchPorcentaje =
    vacante.requiredSkills.length > 0
      ? Math.round(
          vacante.requiredSkills.reduce(
            (total, skill) =>
              total + (progressBySkillName.get(normalize(skill)) ?? 0),
            0,
          ) / vacante.requiredSkills.length,
        )
      : 0;

  return {
    ...vacante,
    matchPorcentaje,
    skills: vacante.requiredSkills.map((skill) => ({
      nombre: skill,
      laTienes: (progressBySkillName.get(normalize(skill)) ?? 0) > 0,
    })),
  };
}

export async function getEmployabilityData(params: {
  usuarioId: string;
  locale: string;
}): Promise<EmployabilityData> {
  const { usuarioId } = params;
  const locale = getLocale(params.locale);

  const [usuario, userSkills] = await Promise.all([
    dbClient.usuarios.findUnique({
      where: {
        usuario_id: usuarioId,
      },
      select: {
        nombre_completo: true,
        avatar_url: true,
        onboarding_status: true,
        home_cluster: true,
        whatsapp_codigo: true,
        whatsapp_numero: true,
        perfil_movilidad: {
          select: {
            id: true,
            home_cluster: true,
          },
        },
      },
    }),
    dbClient.usuarioHabilidades.findMany({
      where: {
        usuario_id: usuarioId,
      },
      select: {
        habilidad: {
          select: {
            nombre: true,
          },
        },
        progreso_porcentaje: true,
      },
    }),
  ]);

  const skillsWithProgress = userSkills
    .map((item) => ({
      name: item.habilidad?.nombre,
      progress: Math.max(0, Math.min(100, item.progreso_porcentaje)),
    }))
    .filter(
      (skill): skill is { name: string; progress: number } =>
        Boolean(skill.name),
    );

  const vacantes = MOCK_VACANTES_BY_LOCALE[locale].map((vacante) =>
    buildVacante(vacante, skillsWithProgress),
  );

  if (!usuario) {
    return {
      user: {},
      vacantes,
      postulaciones: [],
    };
  }

  const profile = buildProfilePercent(usuario);

  return {
    user: {
      name: usuario.nombre_completo,
      avatarUrl: usuario.avatar_url,
      profilePercent: profile.profilePercent,
      perfilBreakdown: profile.perfilBreakdown,
    },
    vacantes,
    postulaciones: [],
  };
}
