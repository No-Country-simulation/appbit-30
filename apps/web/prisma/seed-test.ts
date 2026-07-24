// Script para poblar tablas vacías con datos de prueba del dashboard
import { PrismaClient } from '../src/server/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AreaInteresEnum,
  EstadoHabilidadEnum,
  IdiomaAppEnum,
  OnboardingStatusEnum,
  PrioridadPlanEnum,
  type Prisma,
} from '../src/server/generated/prisma';
import { MARKET_SKILLS_BY_AREA } from '../src/features/onboarding/data/market-skills';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL o DIRECT_URL es requerida para ejecutar seed-test.',
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const TEST_USER_ID = '003f7b4f-364b-4fa0-b921-2452393769d6';
const TEST_ORIENTACION_ID = '00000000-0000-4000-8000-000000000001';
const DEMO_DATA_SKILLS = [
  MARKET_SKILLS_BY_AREA.Data_Analytics.hardSkills.Junior[0].value,
  MARKET_SKILLS_BY_AREA.Data_Analytics.hardSkills.Junior[2].value,
  MARKET_SKILLS_BY_AREA.Data_Analytics.hardSkills.Junior[3].value,
] as const;

async function main() {
  console.log('🌱 Poblando datos de prueba para dashboard...');

  // --- 1. HABILIDADES DE MERCADO ---
  console.log('📝 Insertando habilidades de mercado...');

  const habilidadesData: Prisma.HabilidadesMercadoCreateManyInput[] = [
    {
      nombre: 'JavaScript',
      categoria: 'Lenguajes',
      area_principal: AreaInteresEnum.Desarrollo_Web,
    },
    {
      nombre: 'TypeScript',
      categoria: 'Lenguajes',
      area_principal: AreaInteresEnum.Desarrollo_Web,
    },
    {
      nombre: 'Python',
      categoria: 'Lenguajes',
      area_principal: AreaInteresEnum.Data_Analytics,
    },
    {
      nombre: 'React',
      categoria: 'Frameworks',
      area_principal: AreaInteresEnum.Desarrollo_Web,
    },
    {
      nombre: 'Node.js',
      categoria: 'Backend',
      area_principal: AreaInteresEnum.Desarrollo_Web,
    },
    {
      nombre: 'Django',
      categoria: 'Backend',
      area_principal: AreaInteresEnum.Desarrollo_Web,
    },
    {
      nombre: 'SQL',
      categoria: 'Bases de Datos',
      area_principal: AreaInteresEnum.Data_Analytics,
    },
    {
      nombre: 'MongoDB',
      categoria: 'Bases de Datos',
      area_principal: AreaInteresEnum.Data_Analytics,
    },
    {
      nombre: 'AWS',
      categoria: 'Cloud',
      area_principal: AreaInteresEnum.Cloud_DevOps,
    },
    {
      nombre: 'Azure',
      categoria: 'Cloud',
      area_principal: AreaInteresEnum.Cloud_DevOps,
    },
    {
      nombre: 'Figma',
      categoria: 'Diseño',
      area_principal: AreaInteresEnum.UX_UI_Design,
    },
    {
      nombre: 'Adobe XD',
      categoria: 'Diseño',
      area_principal: AreaInteresEnum.UX_UI_Design,
    },
    {
      nombre: 'SEO',
      categoria: 'Marketing',
      area_principal: AreaInteresEnum.Marketing_Digital,
    },
    {
      nombre: 'Google Analytics',
      categoria: 'Marketing',
      area_principal: AreaInteresEnum.Marketing_Digital,
    },
    {
      nombre: 'Ciberseguridad',
      categoria: 'Seguridad',
      area_principal: AreaInteresEnum.Ciberseguridad,
    },
    {
      nombre: 'Kubernetes',
      categoria: 'Cloud',
      area_principal: AreaInteresEnum.Cloud_DevOps,
    },
    {
      nombre: 'Docker',
      categoria: 'Cloud',
      area_principal: AreaInteresEnum.Cloud_DevOps,
    },
    {
      nombre: 'Machine Learning',
      categoria: 'IA',
      area_principal: AreaInteresEnum.Inteligencia_Artificial,
    },
    {
      nombre: 'NLP',
      categoria: 'IA',
      area_principal: AreaInteresEnum.Inteligencia_Artificial,
    },
    {
      nombre: 'Scrum',
      categoria: 'Metodologías',
      area_principal: AreaInteresEnum.Product_Management,
    },
    ...DEMO_DATA_SKILLS.map((nombre) => ({
      nombre,
      categoria: 'Data & Analytics',
      area_principal: AreaInteresEnum.Data_Analytics,
    })),
  ];

  const { count: skillsCreadas } = await prisma.habilidadesMercado.createMany({
    data: habilidadesData,
    skipDuplicates: true,
  });

  console.log(`  → ${skillsCreadas} habilidades insertadas`);

  const todasHabilidades = await prisma.habilidadesMercado.findMany();

  const habilidadesMap = new Map(
    todasHabilidades.map((h) => [h.nombre, h.habilidad_id]),
  );

  const { count: demoUsersUpdated } = await prisma.usuarios.updateMany({
    where: { usuario_id: TEST_USER_ID },
    data: {
      onboarding_status: OnboardingStatusEnum.COMPLETED,
      avatar_url: '/demo-avatar.svg',
      pais: 'Argentina',
      ciudad: 'Buenos Aires',
      idioma_app: IdiomaAppEnum.es,
    },
  });

  if (demoUsersUpdated === 0) {
    throw new Error(`No existe el usuario demo ${TEST_USER_ID}.`);
  }

  await prisma.usuarioAreasInteres.upsert({
    where: {
      usuario_id_area: {
        usuario_id: TEST_USER_ID,
        area: AreaInteresEnum.Data_Analytics,
      },
    },
    update: {},
    create: {
      usuario_id: TEST_USER_ID,
      area: AreaInteresEnum.Data_Analytics,
    },
  });

  // --- 2. ORIENTACIONES ---
  console.log('📝 Insertando orientación...');

  const orientacionData = {
    usuario_id: TEST_USER_ID,
    gap_porcentual: 40,
    gap_items: [
      {
        habilidad: 'Python',
        nivel_requerido: 'Avanzado',
        nivel_actual: 'Básico',
      },
      {
        habilidad: 'SQL',
        nivel_requerido: 'Intermedio',
        nivel_actual: 'Básico',
      },
    ],
    trayectoria_sugerida: [
      'Data Analyst Jr.',
      'Data Analyst',
      'Data Scientist',
    ],
    vacantes_compatibles: [
      {
        titulo: 'Data Analyst Jr.',
        empresa: 'DataMind',
        salario: '$45,000',
      },
      {
        titulo: 'Analista de Datos',
        empresa: 'TechCorp',
        salario: '$50,000',
      },
      {
        titulo: 'BI Analyst',
        empresa: 'CloudWise',
        salario: '$48,000',
      },
      {
        titulo: 'Data Analyst',
        empresa: 'AI Solutions',
        salario: '$55,000',
      },
      {
        titulo: 'Data Analytics Jr.',
        empresa: 'DataMind',
        salario: '$42,000',
      },
    ],
    confianza: 0.78,
    idioma_respuesta: IdiomaAppEnum.es,
  } satisfies Omit<Prisma.OrientacionesUncheckedCreateInput, 'orientacion_id'>;

  await prisma.orientaciones.upsert({
    where: {
      orientacion_id: TEST_ORIENTACION_ID,
    },
    create: {
      orientacion_id: TEST_ORIENTACION_ID,
      ...orientacionData,
    },
    update: orientacionData,
  });

  console.log('  → Orientación insertada');

  // --- 3. PLAN DE ACCIÓN ---
  console.log('📝 Insertando plan de acción...');

  const planData: Prisma.PlanAccionUncheckedCreateInput[] = [
    {
      usuario_id: TEST_USER_ID,
      titulo: 'Aprender Python Avanzado',
      prioridad: PrioridadPlanEnum.Alta_prioridad,
      orden: 1,
      accion_label: 'Iniciar curso',
    },
    {
      usuario_id: TEST_USER_ID,
      titulo: 'SQL para Data Analytics',
      prioridad: PrioridadPlanEnum.Alta_prioridad,
      orden: 2,
      accion_label: 'Iniciar Módulo',
    },
    {
      usuario_id: TEST_USER_ID,
      titulo: 'Power BI / Dashboards',
      prioridad: PrioridadPlanEnum.Media_prioridad,
      orden: 3,
      accion_label: 'Ver temario',
    },
    {
      usuario_id: TEST_USER_ID,
      titulo: 'Estadística Aplicada',
      prioridad: PrioridadPlanEnum.Baja_prioridad,
      orden: 4,
      accion_label: 'Ver temario',
    },
  ];

  await prisma.planAccion.deleteMany({
    where: {
      usuario_id: TEST_USER_ID,
    },
  });

  for (const plan of planData) {
    await prisma.planAccion.create({
      data: plan,
    });
  }

  console.log(`  → ${planData.length} items insertados`);

  // --- 4. USUARIO HABILIDADES ---
  console.log('📝 Insertando habilidades del usuario...');

  const userSkills = [
    {
      nombre: 'JavaScript',
      estado: EstadoHabilidadEnum.Adquirida,
      progresoPorcentaje: 100,
    },
    {
      nombre: 'Python',
      estado: EstadoHabilidadEnum.En_progreso,
      progresoPorcentaje: 50,
    },
    {
      nombre: 'SQL',
      estado: EstadoHabilidadEnum.Faltante,
      progresoPorcentaje: 0,
    },
    {
      nombre: 'Power BI',
      estado: EstadoHabilidadEnum.Faltante,
      progresoPorcentaje: 0,
    },
    {
      nombre: 'Machine Learning',
      estado: EstadoHabilidadEnum.En_progreso,
      progresoPorcentaje: 50,
    },
    {
      nombre: DEMO_DATA_SKILLS[0],
      estado: EstadoHabilidadEnum.Adquirida,
      progresoPorcentaje: 100,
    },
    {
      nombre: DEMO_DATA_SKILLS[1],
      estado: EstadoHabilidadEnum.Adquirida,
      progresoPorcentaje: 100,
    },
    {
      nombre: DEMO_DATA_SKILLS[2],
      estado: EstadoHabilidadEnum.Faltante,
      progresoPorcentaje: 0,
    },
  ];

  for (const us of userSkills) {
    const habilidadId = habilidadesMap.get(us.nombre);

    if (habilidadId) {
      await prisma.usuarioHabilidades.upsert({
        where: {
          usuario_id_habilidad_id: {
            usuario_id: TEST_USER_ID,
            habilidad_id: habilidadId,
          },
        },
        create: {
          usuario_id: TEST_USER_ID,
          habilidad_id: habilidadId,
          estado: us.estado,
          progreso_porcentaje: us.progresoPorcentaje,
        },
        update: {
          estado: us.estado,
          progreso_porcentaje: us.progresoPorcentaje,
        },
      });
    }
  }

  if (!habilidadesMap.has('Power BI')) {
    const powerBi = await prisma.habilidadesMercado.create({
      data: {
        nombre: 'Power BI',
        categoria: 'Visualización',
        area_principal: AreaInteresEnum.Data_Analytics,
      },
    });

    await prisma.usuarioHabilidades.upsert({
      where: {
        usuario_id_habilidad_id: {
          usuario_id: TEST_USER_ID,
          habilidad_id: powerBi.habilidad_id,
        },
      },
      create: {
        usuario_id: TEST_USER_ID,
        habilidad_id: powerBi.habilidad_id,
        estado: EstadoHabilidadEnum.Faltante,
        progreso_porcentaje: 0,
      },
      update: {
        estado: EstadoHabilidadEnum.Faltante,
        progreso_porcentaje: 0,
      },
    });
  }

  const totalSkills = await prisma.usuarioHabilidades.count({
    where: {
      usuario_id: TEST_USER_ID,
    },
  });

  console.log(`  → ${totalSkills} habilidades vinculadas al usuario`);
  console.log('✅ Seed de prueba completado');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
