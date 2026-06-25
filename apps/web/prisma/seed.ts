// apps/web/prisma/seed.ts
import {
  PrismaClient,
  Prisma,
  TipoConexionEnum,
  IdiomaAppEnum,
  DispositivoEnum,
  NivelIdiomaEnum,
  AreaInteresEnum,
  DisponibilidadEnum,
  UbicacionTrabajoEnum,
  EstadoHabilidadEnum,
  JornadaEnum,
  NivelVacanteEnum,
  ModalidadVacanteEnum,
  EstadoPostulacionEnum,
  EstadoCheckinEmojiEnum,
  TipoRecursoEnum,
  PrioridadPlanEnum,
  IncomeClusterEnum,
  MobilityPatternEnum,
} from '../src/server/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

import {
  GeneroEnum,
  NivelEducacionEnum,
  MomentoProfesionalEnum,
  ObjetivoUsuarioEnum,
} from '../src/server/generated/prisma';

// Tomamos la URL directa
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!connectionString) {
  throw new Error('No se encontró la URL de la base de datos en el entorno.');
}

// Creamos el adapter de PostgreSQL
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

//console.log('📦 Modelos disponibles:', Object.keys(prisma));

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // ============================================
  // 1. USUARIOS (10 usuarios variados)
  // ============================================
  console.log('📝 Creando usuarios...');

  // Usuarios adicionales (sin upsert, solo create, pero con verificación para evitar duplicados)
  const usuariosExistentes = await prisma.usuarios.findMany({
    select: { email: true },
  });

  const emailsExistentes = new Set(
    usuariosExistentes.map((u: { email: string }) => u.email),
  );

  const usuariosData = [
    {
      email: 'maria.lopez@email.com',
      nombre_completo: 'María López',
      fecha_nacimiento: new Date('1996-05-12'),
      genero: GeneroEnum.Femenino,
      pais: 'Argentina',
      provincia_estado: 'Córdoba',
      ciudad: 'Córdoba',
      zona_residencia: 'Nueva Córdoba',
      nivel_educacion: NivelEducacionEnum.Universitario_incompleto,
      momento_profesional: MomentoProfesionalEnum.En_busqueda_activa,
      tipo_conexion: TipoConexionEnum.Datos_moviles,
      whatsapp_codigo: '+54',
      whatsapp_numero: '3511234567',
      idioma_app: IdiomaAppEnum.es,
      perfil_completado: 70,
      lat: new Prisma.Decimal(-31.4201),
      lng: new Prisma.Decimal(-64.1888),
      confianza: new Prisma.Decimal(0.75),
      home_cluster: 'Buenos Aires',
    },
    {
      email: 'diego.fernandez@email.com',
      nombre_completo: 'Diego Fernández',
      fecha_nacimiento: new Date('1990-08-20'),
      genero: GeneroEnum.No_binario,
      pais: 'Uruguay',
      provincia_estado: 'Montevideo',
      ciudad: 'Montevideo',
      zona_residencia: 'Pocitos',
      nivel_educacion: NivelEducacionEnum.Diplomatura,
      momento_profesional: MomentoProfesionalEnum.Emprendedor_a,
      tipo_conexion: TipoConexionEnum.Banda_ancha_estable,
      whatsapp_codigo: '+598',
      whatsapp_numero: '91234567',
      idioma_app: IdiomaAppEnum.es,
      perfil_completado: 80,
      lat: new Prisma.Decimal(-34.9011),
      lng: new Prisma.Decimal(-56.1645),
      confianza: new Prisma.Decimal(0.82),
      home_cluster: 'Montevideo',
    },
    {
      email: 'sofia.arias@email.com',
      nombre_completo: 'Sofía Arias',
      fecha_nacimiento: new Date('1999-12-25'),
      genero: GeneroEnum.Femenino,
      pais: 'Costa Rica',
      provincia_estado: 'San José',
      ciudad: 'San José',
      zona_residencia: 'Escazú',
      nivel_educacion: NivelEducacionEnum.Universitario_completo,
      momento_profesional: MomentoProfesionalEnum.Trabajando_cambiar,
      tipo_conexion: TipoConexionEnum.Conexion_inestable,
      whatsapp_codigo: '+506',
      whatsapp_numero: '98765432',
      idioma_app: IdiomaAppEnum.es,
      perfil_completado: 55,
      lat: new Prisma.Decimal(9.9281),
      lng: new Prisma.Decimal(-84.0907),
      confianza: new Prisma.Decimal(0.6),
      home_cluster: 'San José',
    },
    {
      email: 'javier.torres@email.com',
      nombre_completo: 'Javier Torres',
      fecha_nacimiento: new Date('1985-02-14'),
      genero: GeneroEnum.Prefiero_no_decir,
      pais: 'España',
      provincia_estado: 'Madrid',
      ciudad: 'Madrid',
      zona_residencia: 'Salamanca',
      nivel_educacion: NivelEducacionEnum.Maestria,
      momento_profesional: MomentoProfesionalEnum.Freelancer,
      tipo_conexion: TipoConexionEnum.Banda_ancha_estable,
      whatsapp_codigo: '+34',
      whatsapp_numero: '612345678',
      idioma_app: IdiomaAppEnum.es,
      perfil_completado: 90,
      lat: new Prisma.Decimal(40.4168),
      lng: new Prisma.Decimal(-3.7038),
      confianza: new Prisma.Decimal(0.88),
      home_cluster: 'Madrid',
    },
    {
      email: 'lucia.rivera@email.com',
      nombre_completo: 'Lucía Rivera',
      fecha_nacimiento: new Date('1993-07-07'),
      genero: GeneroEnum.Femenino,
      pais: 'Panamá',
      provincia_estado: 'Panamá',
      ciudad: 'Panamá',
      zona_residencia: 'Punta Pacífica',
      nivel_educacion: NivelEducacionEnum.Licenciatura,
      momento_profesional: MomentoProfesionalEnum.En_busqueda_activa,
      tipo_conexion: TipoConexionEnum.Datos_moviles,
      whatsapp_codigo: '+507',
      whatsapp_numero: '67891234',
      idioma_app: IdiomaAppEnum.es,
      perfil_completado: 65,
      lat: new Prisma.Decimal(9.0335),
      lng: new Prisma.Decimal(-79.5016),
      confianza: new Prisma.Decimal(0.68),
      home_cluster: 'Panamá',
    },
  ];

  for (const data of usuariosData) {
    if (!emailsExistentes.has(data.email)) {
      await prisma.usuarios.create({ data });
    }
  }

  // Obtener usuarios para referencias
  type UsuarioReferencia = { email: string; usuario_id: string };

  const usuarios = (await prisma.usuarios.findMany({
    select: {
      email: true,
      usuario_id: true,
    },
  })) as UsuarioReferencia[];
  const userMap = new Map<string, UsuarioReferencia>(
    usuarios.map((u) => [u.email, u]),
  );

  // ============================================
  // 2. OBJETIVOS DE USUARIO
  // ============================================
  console.log('📝 Creando objetivos de usuario...');
  const objetivosData = [
    {
      email: 'carlos.mendoza@email.com',
      objetivos: [
        ObjetivoUsuarioEnum.Mejorar_salario,
        ObjetivoUsuarioEnum.Definir_camino,
      ],
    },
    {
      email: 'laura.gomez@email.com',
      objetivos: [
        ObjetivoUsuarioEnum.Primer_empleo_IT,
        ObjetivoUsuarioEnum.Aprender_tecnologias,
      ],
    },
    {
      email: 'pedro.ramirez@email.com',
      objetivos: [
        ObjetivoUsuarioEnum.Emprender,
        ObjetivoUsuarioEnum.Ampliar_red,
      ],
    },
    {
      email: 'ana.martinez@email.com',
      objetivos: [
        ObjetivoUsuarioEnum.Reconversion_laboral,
        ObjetivoUsuarioEnum.Definir_camino,
      ],
    },
    {
      email: 'juan.perez@email.com',
      objetivos: [
        ObjetivoUsuarioEnum.Primer_empleo_IT,
        ObjetivoUsuarioEnum.Estudiar_sin_trabajar,
      ],
    },
    {
      email: 'maria.lopez@email.com',
      objetivos: [
        ObjetivoUsuarioEnum.Mejorar_salario,
        ObjetivoUsuarioEnum.Aprender_tecnologias,
      ],
    },
    {
      email: 'diego.fernandez@email.com',
      objetivos: [
        ObjetivoUsuarioEnum.Emprender,
        ObjetivoUsuarioEnum.Ampliar_red,
      ],
    },
    {
      email: 'sofia.arias@email.com',
      objetivos: [
        ObjetivoUsuarioEnum.Reconversion_laboral,
        ObjetivoUsuarioEnum.Definir_camino,
      ],
    },
    {
      email: 'javier.torres@email.com',
      objetivos: [
        ObjetivoUsuarioEnum.Mejorar_salario,
        ObjetivoUsuarioEnum.Aprender_tecnologias,
      ],
    },
    {
      email: 'lucia.rivera@email.com',
      objetivos: [
        ObjetivoUsuarioEnum.Primer_empleo_IT,
        ObjetivoUsuarioEnum.Ampliar_red,
      ],
    },
  ];

  for (const item of objetivosData) {
    const user = userMap.get(item.email);
    if (user) {
      for (const obj of item.objetivos) {
        await prisma.usuarioObjetivos.upsert({
          where: {
            usuario_id_objetivo: {
              usuario_id: user.usuario_id,
              objetivo: obj as ObjetivoUsuarioEnum,
            },
          },
          update: {},
          create: {
            usuario_id: user.usuario_id,
            objetivo: obj as ObjetivoUsuarioEnum,
          },
        });
      }
    }
  }

  // ============================================
  // 3. DISPOSITIVOS DE USUARIO
  // ============================================
  console.log('📝 Creando dispositivos de usuario...');
  const dispositivosData = [
    {
      email: 'carlos.mendoza@email.com',
      dispositivos: [DispositivoEnum.PC_Laptop, DispositivoEnum.Solo_celular],
    },
    {
      email: 'laura.gomez@email.com',
      dispositivos: [DispositivoEnum.Solo_celular],
    },
    {
      email: 'pedro.ramirez@email.com',
      dispositivos: [DispositivoEnum.PC_Laptop, DispositivoEnum.Tablet],
    },
    {
      email: 'ana.martinez@email.com',
      dispositivos: [DispositivoEnum.PC_Laptop],
    },
    {
      email: 'juan.perez@email.com',
      dispositivos: [DispositivoEnum.Solo_celular],
    },
    {
      email: 'maria.lopez@email.com',
      dispositivos: [DispositivoEnum.PC_Laptop, DispositivoEnum.Tablet],
    },
    {
      email: 'diego.fernandez@email.com',
      dispositivos: [DispositivoEnum.PC_Laptop, DispositivoEnum.Solo_celular],
    },
    {
      email: 'sofia.arias@email.com',
      dispositivos: [DispositivoEnum.Solo_celular],
    },
    {
      email: 'javier.torres@email.com',
      dispositivos: [DispositivoEnum.PC_Laptop, DispositivoEnum.Tablet],
    },
    {
      email: 'lucia.rivera@email.com',
      dispositivos: [DispositivoEnum.PC_Laptop],
    },
  ];

  for (const item of dispositivosData) {
    const user = userMap.get(item.email);
    if (user) {
      for (const disp of item.dispositivos) {
        await prisma.usuarioDispositivos.upsert({
          where: {
            usuario_id_dispositivo: {
              usuario_id: user.usuario_id,
              dispositivo: disp as DispositivoEnum,
            },
          },
          update: {},
          create: {
            usuario_id: user.usuario_id,
            dispositivo: disp as DispositivoEnum,
          },
        });
      }
    }
  }

  // ============================================
  // 4. IDIOMAS DE USUARIO
  // ============================================
  console.log('📝 Creando idiomas de usuario...');
  const idiomasData = [
    {
      email: 'carlos.mendoza@email.com',
      idiomas: [
        { idioma: 'Español', nivel: NivelIdiomaEnum.C1_Fluido },
        { idioma: 'Inglés', nivel: NivelIdiomaEnum.B2_Avanzado },
      ],
    },
    {
      email: 'laura.gomez@email.com',
      idiomas: [
        { idioma: 'Español', nivel: NivelIdiomaEnum.C1_Fluido },
        { idioma: 'Inglés', nivel: NivelIdiomaEnum.B1_Intermedio },
      ],
    },
    {
      email: 'pedro.ramirez@email.com',
      idiomas: [{ idioma: 'Español', nivel: NivelIdiomaEnum.C1_Fluido }],
    },
    {
      email: 'ana.martinez@email.com',
      idiomas: [
        { idioma: 'Español', nivel: NivelIdiomaEnum.C1_Fluido },
        { idioma: 'Portugués', nivel: NivelIdiomaEnum.B2_Avanzado },
      ],
    },
    {
      email: 'juan.perez@email.com',
      idiomas: [{ idioma: 'Español', nivel: NivelIdiomaEnum.C1_Fluido }],
    },
    {
      email: 'maria.lopez@email.com',
      idiomas: [
        { idioma: 'Español', nivel: NivelIdiomaEnum.C1_Fluido },
        { idioma: 'Inglés', nivel: NivelIdiomaEnum.A1_Basico },
      ],
    },
    {
      email: 'diego.fernandez@email.com',
      idiomas: [
        { idioma: 'Español', nivel: NivelIdiomaEnum.C1_Fluido },
        { idioma: 'Inglés', nivel: NivelIdiomaEnum.C1_Fluido },
      ],
    },
    {
      email: 'sofia.arias@email.com',
      idiomas: [{ idioma: 'Español', nivel: NivelIdiomaEnum.C1_Fluido }],
    },
    {
      email: 'javier.torres@email.com',
      idiomas: [
        { idioma: 'Español', nivel: NivelIdiomaEnum.C1_Fluido },
        { idioma: 'Inglés', nivel: NivelIdiomaEnum.B2_Avanzado },
        { idioma: 'Francés', nivel: NivelIdiomaEnum.A1_Basico },
      ],
    },
    {
      email: 'lucia.rivera@email.com',
      idiomas: [
        { idioma: 'Español', nivel: NivelIdiomaEnum.C1_Fluido },
        { idioma: 'Inglés', nivel: NivelIdiomaEnum.B1_Intermedio },
      ],
    },
  ];

  for (const item of idiomasData) {
    const user = userMap.get(item.email);
    if (user) {
      for (const idioma of item.idiomas) {
        await prisma.usuarioIdiomas.upsert({
          where: {
            usuario_id_idioma: {
              usuario_id: user.usuario_id,
              idioma: idioma.idioma,
            },
          },
          update: {},
          create: {
            usuario_id: user.usuario_id,
            idioma: idioma.idioma,
            nivel: idioma.nivel as NivelIdiomaEnum,
          },
        });
      }
    }
  }

  // ============================================
  // 5. ÁREAS DE INTERÉS DE USUARIO
  // ============================================
  console.log('📝 Creando áreas de interés...');
  const areasData = [
    {
      email: 'carlos.mendoza@email.com',
      areas: [AreaInteresEnum.Desarrollo_Web, AreaInteresEnum.Cloud_DevOps],
    },
    {
      email: 'laura.gomez@email.com',
      areas: [
        AreaInteresEnum.Data_Analytics,
        AreaInteresEnum.Inteligencia_Artificial,
      ],
    },
    {
      email: 'pedro.ramirez@email.com',
      areas: [AreaInteresEnum.UX_UI_Design, AreaInteresEnum.Marketing_Digital],
    },
    {
      email: 'ana.martinez@email.com',
      areas: [AreaInteresEnum.Ciberseguridad, AreaInteresEnum.Cloud_DevOps],
    },
    { email: 'juan.perez@email.com', areas: [AreaInteresEnum.Desarrollo_Web] },
    {
      email: 'maria.lopez@email.com',
      areas: [
        AreaInteresEnum.Data_Analytics,
        AreaInteresEnum.Product_Management,
      ],
    },
    {
      email: 'diego.fernandez@email.com',
      areas: [AreaInteresEnum.Marketing_Digital, AreaInteresEnum.UX_UI_Design],
    },
    {
      email: 'sofia.arias@email.com',
      areas: [AreaInteresEnum.Inteligencia_Artificial],
    },
    {
      email: 'javier.torres@email.com',
      areas: [AreaInteresEnum.Desarrollo_Web, AreaInteresEnum.Ciberseguridad],
    },
    {
      email: 'lucia.rivera@email.com',
      areas: [
        AreaInteresEnum.Product_Management,
        AreaInteresEnum.Data_Analytics,
      ],
    },
  ];

  for (const item of areasData) {
    const user = userMap.get(item.email);
    if (user) {
      for (const area of item.areas) {
        await prisma.usuarioAreasInteres.upsert({
          where: {
            usuario_id_area: {
              usuario_id: user.usuario_id,
              area: area as AreaInteresEnum,
            },
          },
          update: {},
          create: {
            usuario_id: user.usuario_id,
            area: area as AreaInteresEnum,
          },
        });
      }
    }
  }

  // ============================================
  // 6. DISPONIBILIDAD DE USUARIO
  // ============================================
  console.log('📝 Creando disponibilidad...');
  const disponibilidadData = [
    {
      email: 'carlos.mendoza@email.com',
      disponibilidades: [
        DisponibilidadEnum.Full_time,
        DisponibilidadEnum.Freelance,
      ],
    },
    {
      email: 'laura.gomez@email.com',
      disponibilidades: [DisponibilidadEnum.Part_time],
    },
    {
      email: 'pedro.ramirez@email.com',
      disponibilidades: [DisponibilidadEnum.Freelance],
    },
    {
      email: 'ana.martinez@email.com',
      disponibilidades: [DisponibilidadEnum.Full_time],
    },
    {
      email: 'juan.perez@email.com',
      disponibilidades: [
        DisponibilidadEnum.Part_time,
        DisponibilidadEnum.Contractor,
      ],
    },
    {
      email: 'maria.lopez@email.com',
      disponibilidades: [
        DisponibilidadEnum.Full_time,
        DisponibilidadEnum.Freelance,
      ],
    },
    {
      email: 'diego.fernandez@email.com',
      disponibilidades: [
        DisponibilidadEnum.Freelance,
        DisponibilidadEnum.Contractor,
      ],
    },
    {
      email: 'sofia.arias@email.com',
      disponibilidades: [DisponibilidadEnum.Part_time],
    },
    {
      email: 'javier.torres@email.com',
      disponibilidades: [DisponibilidadEnum.Full_time],
    },
    {
      email: 'lucia.rivera@email.com',
      disponibilidades: [
        DisponibilidadEnum.Full_time,
        DisponibilidadEnum.Part_time,
      ],
    },
  ];

  for (const item of disponibilidadData) {
    const user = userMap.get(item.email);
    if (user) {
      for (const disp of item.disponibilidades) {
        await prisma.usuarioDisponibilidad.upsert({
          where: {
            usuario_id_disponibilidad: {
              usuario_id: user.usuario_id,
              disponibilidad: disp as DisponibilidadEnum,
            },
          },
          update: {},
          create: {
            usuario_id: user.usuario_id,
            disponibilidad: disp as DisponibilidadEnum,
          },
        });
      }
    }
  }

  // ============================================
  // 7. UBICACIÓN DE TRABAJO DE USUARIO
  // ============================================
  console.log('📝 Creando ubicación de trabajo...');
  const ubicacionData = [
    {
      email: 'carlos.mendoza@email.com',
      ubicaciones: [UbicacionTrabajoEnum.Remoto, UbicacionTrabajoEnum.Hibrido],
    },
    {
      email: 'laura.gomez@email.com',
      ubicaciones: [UbicacionTrabajoEnum.Presencial],
    },
    {
      email: 'pedro.ramirez@email.com',
      ubicaciones: [UbicacionTrabajoEnum.Remoto],
    },
    {
      email: 'ana.martinez@email.com',
      ubicaciones: [UbicacionTrabajoEnum.Remoto, UbicacionTrabajoEnum.Hibrido],
    },
    {
      email: 'juan.perez@email.com',
      ubicaciones: [UbicacionTrabajoEnum.Presencial],
    },
    {
      email: 'maria.lopez@email.com',
      ubicaciones: [UbicacionTrabajoEnum.Remoto],
    },
    {
      email: 'diego.fernandez@email.com',
      ubicaciones: [UbicacionTrabajoEnum.Hibrido],
    },
    {
      email: 'sofia.arias@email.com',
      ubicaciones: [UbicacionTrabajoEnum.Remoto],
    },
    {
      email: 'javier.torres@email.com',
      ubicaciones: [
        UbicacionTrabajoEnum.Remoto,
        UbicacionTrabajoEnum.Presencial,
      ],
    },
    {
      email: 'lucia.rivera@email.com',
      ubicaciones: [UbicacionTrabajoEnum.Hibrido],
    },
  ];

  for (const item of ubicacionData) {
    const user = userMap.get(item.email);
    if (user) {
      for (const ub of item.ubicaciones) {
        await prisma.usuarioUbicacionTrabajo.upsert({
          where: {
            usuario_id_ubicacion: {
              usuario_id: user.usuario_id,
              ubicacion: ub as UbicacionTrabajoEnum,
            },
          },
          update: {},
          create: {
            usuario_id: user.usuario_id,
            ubicacion: ub as UbicacionTrabajoEnum,
          },
        });
      }
    }
  }

  // ============================================
  // 8. HABILIDADES DE MERCADO (catálogo)
  // ============================================
  console.log('📝 Creando habilidades de mercado...');
  const habilidadesData = [
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
      categoria: 'DevOps',
      area_principal: AreaInteresEnum.Cloud_DevOps,
    },
    {
      nombre: 'Docker',
      categoria: 'DevOps',
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
  ];

  const habilidadesMap = new Map();
  for (const hab of habilidadesData) {
    const created = await prisma.habilidadesMercado.upsert({
      where: { nombre: hab.nombre },
      update: {},
      create: {
        nombre: hab.nombre,
        categoria: hab.categoria,
        area_principal: hab.area_principal as AreaInteresEnum,
      },
    });
    habilidadesMap.set(hab.nombre, created.habilidad_id);
  }

  // ============================================
  // 9. HABILIDADES DE USUARIO
  // ============================================
  console.log('📝 Asignando habilidades a usuarios...');
  const usuarioHabilidadesData = [
    {
      email: 'carlos.mendoza@email.com',
      habilidades: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      estados: [
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Faltante,
      ],
    },
    {
      email: 'laura.gomez@email.com',
      habilidades: ['Python', 'SQL', 'Machine Learning'],
      estados: [
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Faltante,
      ],
    },
    {
      email: 'pedro.ramirez@email.com',
      habilidades: ['Figma', 'Adobe XD'],
      estados: [EstadoHabilidadEnum.Adquirida, EstadoHabilidadEnum.Faltante],
    },
    {
      email: 'ana.martinez@email.com',
      habilidades: ['AWS', 'Docker', 'Kubernetes'],
      estados: [
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Faltante,
      ],
    },
    {
      email: 'juan.perez@email.com',
      habilidades: ['JavaScript'],
      estados: [EstadoHabilidadEnum.Faltante],
    },
    {
      email: 'maria.lopez@email.com',
      habilidades: ['Python', 'SQL', 'Google Analytics'],
      estados: [
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Faltante,
      ],
    },
    {
      email: 'diego.fernandez@email.com',
      habilidades: ['SEO', 'Google Analytics'],
      estados: [EstadoHabilidadEnum.Adquirida, EstadoHabilidadEnum.Adquirida],
    },
    {
      email: 'sofia.arias@email.com',
      habilidades: ['Machine Learning', 'Python'],
      estados: [EstadoHabilidadEnum.Faltante, EstadoHabilidadEnum.Faltante],
    },
    {
      email: 'javier.torres@email.com',
      habilidades: ['JavaScript', 'React', 'Ciberseguridad'],
      estados: [
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Adquirida,
        EstadoHabilidadEnum.Faltante,
      ],
    },
    {
      email: 'lucia.rivera@email.com',
      habilidades: ['Scrum', 'SQL'],
      estados: [EstadoHabilidadEnum.Adquirida, EstadoHabilidadEnum.Adquirida],
    },
  ];

  for (const item of usuarioHabilidadesData) {
    const user = userMap.get(item.email);
    if (!user) continue;
    for (let i = 0; i < item.habilidades.length; i++) {
      const habName = item.habilidades[i];
      const estado = item.estados[i] || EstadoHabilidadEnum.Faltante;
      const habilidad_id = habilidadesMap.get(habName);
      if (habilidad_id) {
        await prisma.usuarioHabilidades.upsert({
          where: {
            usuario_id_habilidad_id: {
              usuario_id: user.usuario_id,
              habilidad_id: habilidad_id,
            },
          },
          update: {},
          create: {
            usuario_id: user.usuario_id,
            habilidad_id: habilidad_id,
            estado: estado as EstadoHabilidadEnum,
          },
        });
      }
    }
  }

  // ============================================
  // 10. EMPRESAS
  // ============================================
  console.log('📝 Creando empresas...');
  const empresasData = [
    {
      nombre: 'TechCorp S.A.',
      descripcion: 'Empresa líder en desarrollo de software',
      sector: 'Tecnología',
      tamanio: '500-1000',
      cluster: 'Buenos Aires',
    },
    {
      nombre: 'CloudWise',
      descripcion: 'Soluciones de infraestructura en la nube',
      sector: 'Cloud Computing',
      tamanio: '200-500',
      cluster: 'Buenos Aires',
    },
    {
      nombre: 'DataMind',
      descripcion: 'Consultoría en inteligencia de negocios',
      sector: 'Consultoría',
      tamanio: '50-200',
      cluster: 'Buenos Aires',
    },
    {
      nombre: 'DesignLab',
      descripcion: 'Agencia de diseño y experiencia de usuario',
      sector: 'Diseño',
      tamanio: '10-50',
      cluster: 'Buenos Aires',
    },
    {
      nombre: 'CyberShield',
      descripcion: 'Seguridad informática y ciberseguridad',
      sector: 'Seguridad',
      tamanio: '100-200',
      cluster: 'Buenos Aires',
    },
    {
      nombre: 'AI Solutions',
      descripcion: 'Desarrollo de aplicaciones de IA',
      sector: 'Inteligencia Artificial',
      tamanio: '50-100',
      cluster: 'Buenos Aires',
    },
    {
      nombre: 'DevOps Masters',
      descripcion: 'Automatización y DevOps',
      sector: 'DevOps',
      tamanio: '20-50',
      cluster: 'Buenos Aires',
    },
  ];

  const empresasMap = new Map();
  for (const emp of empresasData) {
    const created = await prisma.empresas.upsert({
      where: { nombre: emp.nombre },
      update: {},
      create: {
        nombre: emp.nombre,
        descripcion: emp.descripcion,
        sector: emp.sector,
        tamanio: emp.tamanio,
        cluster: emp.cluster,
      },
    });
    empresasMap.set(emp.nombre, created.empresa_id);
  }

  // ============================================
  // 11. VACANTES
  // ============================================
  console.log('📝 Creando vacantes...');
  const vacantesData = [
    {
      empresa: 'TechCorp S.A.',
      titulo: 'Desarrollador Full Stack Senior',
      area: 'Desarrollo_Web',
      nivel: NivelVacanteEnum.Senior,
      descripcion:
        'Buscamos desarrollador full stack con experiencia en React y Node.js',
      educacion_requerida: 'Universitario completo',
      experiencia_solicitada: '5 años',
      jornada: 'Jornada_completa',
      modalidad: 'Remoto',
      pais: 'Argentina',
      ciudad: 'CABA',
      detalle_modalidad: '100% remoto',
      idiomas_requeridos: ['Inglés B2'],
      activa: true,
    },
    {
      empresa: 'CloudWise',
      titulo: 'Ingeniero de DevOps',
      area: 'Cloud_DevOps',
      nivel: NivelVacanteEnum.Semi_Senior,
      descripcion: 'Especialista en AWS, Docker y Kubernetes',
      educacion_requerida: 'Universitario completo',
      experiencia_solicitada: '3 años',
      jornada: JornadaEnum.Jornada_completa,
      modalidad: 'Hibrido',
      pais: 'Argentina',
      ciudad: 'CABA',
      detalle_modalidad: '2 días presenciales',
      idiomas_requeridos: ['Inglés B1'],
      activa: true,
    },
    {
      empresa: 'DataMind',
      titulo: 'Analista de Datos',
      area: 'Data_Analytics',
      nivel: NivelVacanteEnum.Jr_Entry_Level,
      descripcion:
        'Recién graduados o con experiencia inicial en análisis de datos',
      educacion_requerida: 'Universitario incompleto',
      experiencia_solicitada: '0-1 año',
      jornada: JornadaEnum.Jornada_completa,
      modalidad: ModalidadVacanteEnum.Presencial,
      pais: 'Argentina',
      ciudad: 'Córdoba',
      detalle_modalidad: 'Oficina en Nueva Córdoba',
      idiomas_requeridos: ['Español nativo'],
      activa: true,
    },
    {
      empresa: 'DesignLab',
      titulo: 'Diseñador UX/UI',
      area: 'UX_UI_Design',
      nivel: NivelVacanteEnum.Semi_Senior,
      descripcion: 'Diseñador con experiencia en Figma y Adobe XD',
      educacion_requerida: 'Universitario completo',
      experiencia_solicitada: '3 años',
      jornada: JornadaEnum.Media_jornada,
      modalidad: ModalidadVacanteEnum.Remoto,
      pais: 'México',
      ciudad: 'CDMX',
      detalle_modalidad: 'Part-time remoto',
      idiomas_requeridos: ['Español nativo', 'Inglés A2'],
      activa: true,
    },
    {
      empresa: 'CyberShield',
      titulo: 'Analista de Ciberseguridad',
      area: 'Ciberseguridad',
      nivel: NivelVacanteEnum.Semi_Senior,
      descripcion: 'Especialista en seguridad informática y auditoría',
      educacion_requerida: 'Universitario completo',
      experiencia_solicitada: '2 años',
      jornada: JornadaEnum.Jornada_completa,
      modalidad: ModalidadVacanteEnum.Hibrido,
      pais: 'Chile',
      ciudad: 'Santiago',
      detalle_modalidad: '2 veces por semana',
      idiomas_requeridos: ['Español nativo', 'Inglés B2'],
      activa: true,
    },
  ];

  const vacantesIds: string[] = [];
  for (const vac of vacantesData) {
    const empresaId = empresasMap.get(vac.empresa);
    if (!empresaId) continue;
    const created = await prisma.vacantes.create({
      data: {
        empresa_id: empresaId,
        titulo: vac.titulo,
        area: vac.area as AreaInteresEnum,
        nivel: vac.nivel as NivelVacanteEnum,
        descripcion: vac.descripcion,
        educacion_requerida: vac.educacion_requerida,
        experiencia_solicitada: vac.experiencia_solicitada,
        jornada: vac.jornada as JornadaEnum,
        modalidad: vac.modalidad as ModalidadVacanteEnum,
        pais: vac.pais,
        ciudad: vac.ciudad,
        detalle_modalidad: vac.detalle_modalidad,
        idiomas_requeridos: vac.idiomas_requeridos,
        activa: vac.activa,
      },
    });
    vacantesIds.push(created.vacante_id);
  }

  // ============================================
  // 12. REQUISITOS DE VACANTE (asignar habilidades)
  // ============================================
  console.log('📝 Asignando requisitos a vacantes...');
  const requisitosData = [
    {
      vacanteIndex: 0,
      habilidades: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      prioridades: [1, 2, 1, 2],
    },
    {
      vacanteIndex: 1,
      habilidades: ['AWS', 'Docker', 'Kubernetes'],
      prioridades: [1, 2, 1],
    },
    { vacanteIndex: 2, habilidades: ['Python', 'SQL'], prioridades: [1, 2] },
    {
      vacanteIndex: 3,
      habilidades: ['Figma', 'Adobe XD'],
      prioridades: [1, 2],
    },
    {
      vacanteIndex: 4,
      habilidades: ['Ciberseguridad', 'Python', 'SQL'],
      prioridades: [1, 2, 3],
    },
  ];

  for (const req of requisitosData) {
    const vacanteId = vacantesIds[req.vacanteIndex];
    if (!vacanteId) continue;
    for (let i = 0; i < req.habilidades.length; i++) {
      const habName = req.habilidades[i];
      const habilidad_id = habilidadesMap.get(habName);
      if (habilidad_id) {
        await prisma.requisitosVacante.create({
          data: {
            vacante_id: vacanteId,
            habilidad_id: habilidad_id,
            prioridad: req.prioridades[i] || 1,
          },
        });
      }
    }
  }

  // ============================================
  // 13. POSTULACIONES
  // ============================================
  console.log('📝 Creando postulaciones...');
  const postulacionesData = [
    {
      usuario: 'carlos.mendoza@email.com',
      vacanteIndex: 0,
      estado: EstadoPostulacionEnum.Enviada,
      match: 85,
    },
    {
      usuario: 'laura.gomez@email.com',
      vacanteIndex: 2,
      estado: EstadoPostulacionEnum.Vista,
      match: 70,
    },
    {
      usuario: 'pedro.ramirez@email.com',
      vacanteIndex: 3,
      estado: EstadoPostulacionEnum.En_proceso,
      match: 65,
    },
    {
      usuario: 'ana.martinez@email.com',
      vacanteIndex: 1,
      estado: EstadoPostulacionEnum.Aceptada,
      match: 90,
    },
    {
      usuario: 'maria.lopez@email.com',
      vacanteIndex: 2,
      estado: EstadoPostulacionEnum.Rechazada,
      match: 55,
    },
    {
      usuario: 'diego.fernandez@email.com',
      vacanteIndex: 4,
      estado: EstadoPostulacionEnum.En_proceso,
      match: 78,
    },
    {
      usuario: 'javier.torres@email.com',
      vacanteIndex: 0,
      estado: EstadoPostulacionEnum.Enviada,
      match: 82,
    },
    {
      usuario: 'lucia.rivera@email.com',
      vacanteIndex: 2,
      estado: EstadoPostulacionEnum.Vista,
      match: 60,
    },
  ];

  for (const post of postulacionesData) {
    const user = userMap.get(post.usuario);
    const vacanteId = vacantesIds[post.vacanteIndex];
    if (user && vacanteId) {
      await prisma.postulaciones.upsert({
        where: {
          usuario_id_vacante_id: {
            usuario_id: user.usuario_id,
            vacante_id: vacanteId,
          },
        },
        update: {},
        create: {
          usuario_id: user.usuario_id,
          vacante_id: vacanteId,
          mensaje_motivacion: 'Me interesa mucho esta oportunidad',
          usar_cv_guardado: true,
          match_porcentaje: new Prisma.Decimal(post.match),
          estado: post.estado as EstadoPostulacionEnum,
        },
      });
    }
  }

  // ============================================
  // 14. CHECK-INS, MOTIVOS Y CONTEXTOS
  // ============================================
  console.log('📝 Creando check-ins...');
  const checkinsData = [
    {
      usuario: 'carlos.mendoza@email.com',
      emoji: EstadoCheckinEmojiEnum.Bien,
      nota: 8.5,
      motivos: ['Motivado', 'Buen ambiente'],
      contexto: 'Día productivo, logré completar mis tareas temprano.',
    },
    {
      usuario: 'laura.gomez@email.com',
      emoji: EstadoCheckinEmojiEnum.Neutral,
      nota: 6.0,
      motivos: ['Cansancio'],
      contexto: 'Me siento un poco agotada, pero sigo adelante.',
    },
    {
      usuario: 'pedro.ramirez@email.com',
      emoji: EstadoCheckinEmojiEnum.Genial,
      nota: 9.5,
      motivos: ['Logro', 'Nuevo proyecto'],
      contexto: '¡Conseguí un nuevo cliente freelance!',
    },
    {
      usuario: 'ana.martinez@email.com',
      emoji: EstadoCheckinEmojiEnum.Agotado,
      nota: 4.0,
      motivos: ['Estrés', 'Mucho trabajo'],
      contexto: 'La semana fue muy pesada, necesito descansar.',
    },
    {
      usuario: 'juan.perez@email.com',
      emoji: EstadoCheckinEmojiEnum.Triste,
      nota: 3.0,
      motivos: ['Incertidumbre'],
      contexto: 'No encuentro trabajo, me siento desanimado.',
    },
    {
      usuario: 'maria.lopez@email.com',
      emoji: EstadoCheckinEmojiEnum.Bien,
      nota: 7.5,
      motivos: ['Avance'],
      contexto: 'Avancé en mi curso de Data Analytics.',
    },
    {
      usuario: 'diego.fernandez@email.com',
      emoji: EstadoCheckinEmojiEnum.Neutral,
      nota: 6.5,
      motivos: ['Día normal'],
      contexto: 'Un día sin grandes emociones.',
    },
  ];

  for (const chk of checkinsData) {
    const user = userMap.get(chk.usuario);
    if (user) {
      await prisma.checkIns.create({
        data: {
          usuario_id: user.usuario_id,
          emoji: chk.emoji as EstadoCheckinEmojiEnum,
          nota_diaria: new Prisma.Decimal(chk.nota),
          motivos: {
            create: chk.motivos.map((m) => ({ motivo: m })),
          },
          contextos: {
            create: { contexto: chk.contexto },
          },
        },
      });
    }
  }

  // ============================================
  // 15. RESPUESTAS DE SALUD
  // ============================================
  console.log('📝 Creando respuestas de salud...');
  const saludData = [
    {
      usuario: 'carlos.mendoza@email.com',
      nota_semanal: 8,
      nota_actual: 7,
      mensaje: 'Me siento bien en general',
      accion: 'Seguir así',
      derivar: false,
      alerta: false,
    },
    {
      usuario: 'ana.martinez@email.com',
      nota_semanal: 3,
      nota_actual: 4,
      mensaje: 'Me siento muy estresado',
      accion: 'Recomendar descanso',
      derivar: true,
      alerta: true,
    },
    {
      usuario: 'juan.perez@email.com',
      nota_semanal: 2,
      nota_actual: 3,
      mensaje: 'Ansiedad y desánimo',
      accion: 'Derivar a CVV',
      derivar: true,
      alerta: true,
    },
    {
      usuario: 'maria.lopez@email.com',
      nota_semanal: 7,
      nota_actual: 6,
      mensaje: 'Regular, pero mejorando',
      accion: 'Seguir con ejercicios',
      derivar: false,
      alerta: false,
    },
  ];

  for (const sal of saludData) {
    const user = userMap.get(sal.usuario);
    if (user) {
      await prisma.respuestasSalud.create({
        data: {
          usuario_id: user.usuario_id,
          nota_semanal: new Prisma.Decimal(sal.nota_semanal),
          nota_actual: new Prisma.Decimal(sal.nota_actual),
          mensaje: sal.mensaje,
          accion_sugerida: sal.accion,
          derivar_cvv: sal.derivar,
          alerta: sal.alerta,
        },
      });
    }
  }

  // ============================================
  // 16. ORIENTACIONES
  // ============================================
  console.log('📝 Creando orientaciones...');
  const orientacionesData = [
    {
      usuario: 'carlos.mendoza@email.com',
      gap: 30,
      gap_items: ['Falta experiencia en cloud'],
      trayectoria: ['Curso AWS', 'Certificación'],
      vacantes: ['DevOps', 'Cloud Engineer'],
      confianza: 0.85,
    },
    {
      usuario: 'laura.gomez@email.com',
      gap: 40,
      gap_items: ['Falta Python avanzado'],
      trayectoria: ['Curso Python', 'Proyectos'],
      vacantes: ['Data Analyst', 'Data Scientist'],
      confianza: 0.75,
    },
    {
      usuario: 'pedro.ramirez@email.com',
      gap: 20,
      gap_items: ['Falta portafolio'],
      trayectoria: ['Diseñar portafolio', 'Practicar casos'],
      vacantes: ['UX Designer', 'UI Designer'],
      confianza: 0.9,
    },
    {
      usuario: 'ana.martinez@email.com',
      gap: 10,
      gap_items: ['Mejorar inglés'],
      trayectoria: ['Curso de inglés técnico'],
      vacantes: ['Cloud Architect', 'DevOps Lead'],
      confianza: 0.95,
    },
  ];

  for (const ori of orientacionesData) {
    const user = userMap.get(ori.usuario);
    if (user) {
      await prisma.orientaciones.create({
        data: {
          usuario_id: user.usuario_id,
          gap_porcentual: new Prisma.Decimal(ori.gap),
          gap_items: ori.gap_items,
          trayectoria_sugerida: ori.trayectoria,
          vacantes_compatibles: ori.vacantes,
          confianza: new Prisma.Decimal(ori.confianza),
          idioma_respuesta: 'es',
        },
      });
    }
  }

  // ============================================
  // 17. CURSOS, MÓDULOS Y LECCIONES
  // ============================================
  console.log('📝 Creando cursos...');
  const cursosData = [
    {
      titulo: 'Desarrollo Web Full Stack con React',
      subtitulo: 'Aprende React, Node.js y bases de datos',
      descripcion: 'Curso completo para dominar el desarrollo full stack',
      area: 'Desarrollo_Web',
      tipo: 'Gratuito',
      plataforma: 'Platzi',
      url_externa: 'https://platzi.com/react',
      duracion: 30,
      habilidad_principal: 'React',
      modulos: [
        {
          titulo: 'Fundamentos de React',
          orden: 1,
          lecciones: [
            { titulo: 'Intro a React', orden: 1, duracion: 10 },
            { titulo: 'Componentes y Props', orden: 2, duracion: 15 },
          ],
        },
        {
          titulo: 'Estado y Eventos',
          orden: 2,
          lecciones: [
            { titulo: 'useState', orden: 1, duracion: 12 },
            { titulo: 'Manejo de eventos', orden: 2, duracion: 10 },
          ],
        },
        {
          titulo: 'Backend con Node.js',
          orden: 3,
          lecciones: [
            { titulo: 'Introducción a Node', orden: 1, duracion: 8 },
            { titulo: 'API REST', orden: 2, duracion: 20 },
          ],
        },
      ],
    },
    {
      titulo: 'Introducción a Data Analytics',
      subtitulo: 'Aprende Python, SQL y visualización de datos',
      descripcion: 'Curso práctico para iniciarte en el análisis de datos',
      area: 'Data_Analytics',
      tipo: 'Gratuito',
      plataforma: 'Coursera',
      url_externa: 'https://coursera.org/data-analytics',
      duracion: 25,
      habilidad_principal: 'Python',
      modulos: [
        {
          titulo: 'Python para datos',
          orden: 1,
          lecciones: [
            { titulo: 'Variables y tipos', orden: 1, duracion: 8 },
            { titulo: 'Pandas y NumPy', orden: 2, duracion: 15 },
          ],
        },
        {
          titulo: 'SQL para análisis',
          orden: 2,
          lecciones: [
            { titulo: 'Consultas básicas', orden: 1, duracion: 10 },
            { titulo: 'Joins y subconsultas', orden: 2, duracion: 12 },
          ],
        },
        {
          titulo: 'Visualización',
          orden: 3,
          lecciones: [
            { titulo: 'Matplotlib', orden: 1, duracion: 8 },
            { titulo: 'Seaborn', orden: 2, duracion: 10 },
          ],
        },
      ],
    },
    {
      titulo: 'DevOps con AWS y Docker',
      subtitulo: 'Automatización y despliegue en la nube',
      descripcion: 'Curso intensivo para dominar DevOps',
      area: 'Cloud_DevOps',
      tipo: 'Pago',
      plataforma: 'Udemy',
      url_externa: 'https://udemy.com/devops-aws-docker',
      duracion: 40,
      habilidad_principal: 'AWS',
      modulos: [
        {
          titulo: 'Fundamentos AWS',
          orden: 1,
          lecciones: [
            { titulo: 'EC2 y S3', orden: 1, duracion: 15 },
            { titulo: 'IAM', orden: 2, duracion: 10 },
          ],
        },
        {
          titulo: 'Docker y Kubernetes',
          orden: 2,
          lecciones: [
            { titulo: 'Contenedores', orden: 1, duracion: 12 },
            { titulo: 'Orquestación', orden: 2, duracion: 18 },
          ],
        },
        {
          titulo: 'CI/CD',
          orden: 3,
          lecciones: [
            { titulo: 'Jenkins', orden: 1, duracion: 10 },
            { titulo: 'GitHub Actions', orden: 2, duracion: 12 },
          ],
        },
      ],
    },
    {
      titulo: 'Diseño UX/UI Avanzado',
      subtitulo: 'Crea experiencias digitales excepcionales',
      descripcion: 'Curso de diseño de interfaces y experiencia de usuario',
      area: 'UX_UI_Design',
      tipo: 'Gratuito',
      plataforma: 'Google',
      url_externa: 'https://google.com/ux-design',
      duracion: 20,
      habilidad_principal: 'Figma',
      modulos: [
        {
          titulo: 'Fundamentos UX',
          orden: 1,
          lecciones: [
            { titulo: 'Investigación', orden: 1, duracion: 8 },
            { titulo: 'Wireframing', orden: 2, duracion: 10 },
          ],
        },
        {
          titulo: 'Diseño en Figma',
          orden: 2,
          lecciones: [
            { titulo: 'Herramientas básicas', orden: 1, duracion: 10 },
            { titulo: 'Prototipado', orden: 2, duracion: 12 },
          ],
        },
      ],
    },
    {
      titulo: 'Fundamentos de Ciberseguridad',
      subtitulo: 'Protege sistemas y datos',
      descripcion: 'Curso introductorio a la ciberseguridad',
      area: 'Ciberseguridad',
      tipo: 'Gratuito',
      plataforma: 'Cisco',
      url_externa: 'https://cisco.com/cybersecurity',
      duracion: 15,
      habilidad_principal: 'Ciberseguridad',
      modulos: [
        {
          titulo: 'Conceptos básicos',
          orden: 1,
          lecciones: [
            { titulo: 'Tipos de amenazas', orden: 1, duracion: 10 },
            { titulo: 'Criptografía', orden: 2, duracion: 12 },
          ],
        },
        {
          titulo: 'Seguridad en redes',
          orden: 2,
          lecciones: [
            { titulo: 'Firewalls', orden: 1, duracion: 8 },
            { titulo: 'VPN y acceso', orden: 2, duracion: 10 },
          ],
        },
      ],
    },
  ];

  for (const cursoData of cursosData) {
    const habId = habilidadesMap.get(cursoData.habilidad_principal);
    const curso = await prisma.cursos.create({
      data: {
        titulo: cursoData.titulo,
        subtitulo: cursoData.subtitulo,
        descripcion: cursoData.descripcion,
        area: cursoData.area as AreaInteresEnum,
        tipo: cursoData.tipo as TipoRecursoEnum,
        plataforma: cursoData.plataforma,
        url_externa: cursoData.url_externa,
        duracion_estimada_dias: cursoData.duracion,
        habilidad_principal: habId || null,
        activo: true,
      },
    });

    for (const modData of cursoData.modulos) {
      const modulo = await prisma.modulos.create({
        data: {
          curso_id: curso.curso_id,
          titulo: modData.titulo,
          orden: modData.orden,
          total_lecciones: modData.lecciones.length,
        },
      });

      for (const lecData of modData.lecciones) {
        await prisma.lecciones.create({
          data: {
            modulo_id: modulo.modulo_id,
            titulo: lecData.titulo,
            orden: lecData.orden,
            duracion_minutos: new Prisma.Decimal(lecData.duracion),
          },
        });
      }
    }
  }

  // ============================================
  // 18. RECURSOS DE DESCARGA
  // ============================================
  console.log('📝 Creando recursos de descarga...');
  const cursos = await prisma.cursos.findMany();
  for (const curso of cursos) {
    await prisma.recursosDescarga.createMany({
      data: [
        {
          curso_id: curso.curso_id,
          titulo: 'Material complementario PDF',
          tipo: 'PDF',
          tamanio_mb: new Prisma.Decimal(5.2),
          url_descarga: 'https://example.com/recursos/curso1.pdf',
        },
        {
          curso_id: curso.curso_id,
          titulo: 'Ejercicios prácticos',
          tipo: 'ZIP',
          tamanio_mb: new Prisma.Decimal(2.8),
          url_descarga: 'https://example.com/recursos/curso1.zip',
        },
      ],
    });
  }

  // ============================================
  // 19. DESCARGAS OFFLINE
  // ============================================
  console.log('📝 Creando descargas offline...');
  const recursos = await prisma.recursosDescarga.findMany();
  for (const recurso of recursos.slice(0, 5)) {
    const user = usuarios[Math.floor(Math.random() * usuarios.length)];
    if (user) {
      await prisma.descargasOffline.create({
        data: {
          usuario_id: user.usuario_id,
          recurso_id: recurso.recurso_id,
        },
      });
    }
  }

  // ============================================
  // 20. PLAN DE ACCIÓN
  // ============================================
  console.log('📝 Creando plan de acción...');
  const planData = [
    {
      usuario: 'carlos.mendoza@email.com',
      titulo: 'Completar curso de React',
      prioridad: 'Alta_prioridad',
      accion: 'Estudiar módulo 1',
    },
    {
      usuario: 'laura.gomez@email.com',
      titulo: 'Hacer proyecto de Python',
      prioridad: 'Media_prioridad',
      accion: 'Buscar dataset',
    },
    {
      usuario: 'pedro.ramirez@email.com',
      titulo: 'Actualizar portafolio',
      prioridad: 'Alta_prioridad',
      accion: 'Subir proyectos a Behance',
    },
    {
      usuario: 'ana.martinez@email.com',
      titulo: 'Certificación AWS',
      prioridad: 'Baja_prioridad',
      accion: 'Inscribirse al curso',
    },
  ];

  for (const plan of planData) {
    const user = userMap.get(plan.usuario);
    if (user) {
      await prisma.planAccion.create({
        data: {
          usuario_id: user.usuario_id,
          titulo: plan.titulo,
          prioridad: plan.prioridad as PrioridadPlanEnum,
          accion_label: plan.accion,
        },
      });
    }
  }

  // ============================================
  // 21. PERFIL DE MOVILIDAD
  // ============================================
  console.log('📝 Creando perfiles de movilidad...');
  const movilidadData = [
    {
      usuario: 'carlos.mendoza@email.com',
      hash: 'hash123456',
      home_cluster: 'Buenos Aires',
      income: IncomeClusterEnum.B,
      mobility: MobilityPatternEnum.Moderada,
    },
    {
      usuario: 'laura.gomez@email.com',
      hash: 'hash234567',
      home_cluster: 'CDMX',
      income: IncomeClusterEnum.A,
      mobility: MobilityPatternEnum.Baja,
    },
    {
      usuario: 'ana.martinez@email.com',
      hash: 'hash345678',
      home_cluster: 'Medellín',
      income: IncomeClusterEnum.C,
      mobility: MobilityPatternEnum.Intensa,
    },
  ];

  for (const mov of movilidadData) {
    const user = userMap.get(mov.usuario);
    if (user) {
      await prisma.perfilMovilidad.upsert({
        where: { assinante_hash: mov.hash },
        update: {},
        create: {
          usuario_id: user.usuario_id,
          assinante_hash: mov.hash,
          home_cluster: mov.home_cluster,
          income_cluster: mov.income as IncomeClusterEnum,
          mobility_pattern: mov.mobility as MobilityPatternEnum,
        },
      });
    }
  }

  // ============================================
  // 22. CALIDAD DE RED ZONA
  // ============================================

  console.log('📝 Creando antenas...');
  const antenasData = [
    {
      ecgi: 'ECGI001',
      lat: -34.6037,
      lon: -58.3816,
      cluster: 'Buenos Aires',
      municipio: 'CABA',
    },
    {
      ecgi: 'ECGI002',
      lat: 19.4326,
      lon: -99.1332,
      cluster: 'CDMX',
      municipio: 'Cuauhtémoc',
    },
    {
      ecgi: 'ECGI003',
      lat: 6.2442,
      lon: -75.5812,
      cluster: 'Medellín',
      municipio: 'El Poblado',
    },
  ];

  for (const ant of antenasData) {
    await prisma.antenas.upsert({
      where: { ecgi: ant.ecgi },
      update: {},
      create: {
        ecgi: ant.ecgi,
        lat: new Prisma.Decimal(ant.lat),
        lon: new Prisma.Decimal(ant.lon),
        cluster: ant.cluster,
        municipio: ant.municipio,
      },
    });
  }

  console.log('📝 Creando datos de calidad de red...');
  const calidadData = [
    {
      ecgi: 'ECGI001',
      cluster: 'Buenos Aires',
      municipio: 'CABA',
      day_date: new Date('2025-01-15'),
      periodo: 'mañana',
      n_usuarios: 1500,
      n_sessoes: 12000,
      download: 1000000000,
      upload: 500000000,
      dur_media: 120.5,
      drop_pct: 0.05,
      congestion: 0.12,
      lat: -34.6037,
      lon: -58.3816,
    },
    {
      ecgi: 'ECGI002',
      cluster: 'CDMX',
      municipio: 'Cuauhtémoc',
      day_date: new Date('2025-01-15'),
      periodo: 'tarde',
      n_usuarios: 2000,
      n_sessoes: 18000,
      download: 800000000,
      upload: 400000000,
      dur_media: 95.2,
      drop_pct: 0.08,
      congestion: 0.15,
      lat: 19.4326,
      lon: -99.1332,
    },
    {
      ecgi: 'ECGI003',
      cluster: 'Medellín',
      municipio: 'El Poblado',
      day_date: new Date('2025-01-15'),
      periodo: 'noche',
      n_usuarios: 1200,
      n_sessoes: 9000,
      download: 600000000,
      upload: 300000000,
      dur_media: 80.0,
      drop_pct: 0.1,
      congestion: 0.2,
      lat: 6.2442,
      lon: -75.5812,
    },
  ];

  for (const cal of calidadData) {
    await prisma.calidadRedZona.create({
      data: {
        ecgi: cal.ecgi,
        cluster: cal.cluster,
        municipio: cal.municipio,
        day_date: cal.day_date,
        periodo: cal.periodo,
        n_usuarios: cal.n_usuarios,
        n_sessoes: cal.n_sessoes,
        download_bytes: BigInt(cal.download),
        upload_bytes: BigInt(cal.upload),
        dur_media_s: new Prisma.Decimal(cal.dur_media),
        drop_pct_medio: new Prisma.Decimal(cal.drop_pct),
        congestionamento_medio: new Prisma.Decimal(cal.congestion),
        lat: new Prisma.Decimal(cal.lat),
        lon: new Prisma.Decimal(cal.lon),
      },
    });
  }

  // ============================================
  // 23. ALERTAS OFFLINE
  // ============================================
  console.log('📝 Creando alertas offline...');
  const alertasData = [
    {
      usuario: 'juan.perez@email.com',
      cluster: 'Lima',
      drop_pct: 0.25,
      congestion: 0.3,
      mensaje: 'Zona con mala conectividad',
      curso: 'Desarrollo Web Full Stack con React',
    },
    {
      usuario: 'pedro.ramirez@email.com',
      cluster: 'Santiago',
      drop_pct: 0.15,
      congestion: 0.18,
      mensaje: 'Calidad de red baja en tu zona',
      curso: 'Diseño UX/UI Avanzado',
    },
  ];

  const cursosMap = new Map();
  const allCursos = await prisma.cursos.findMany();
  for (const c of allCursos) {
    cursosMap.set(c.titulo, c.curso_id);
  }

  for (const al of alertasData) {
    const user = userMap.get(al.usuario);
    if (!user) continue;
    const cursoId = cursosMap.get(al.curso) || null;
    await prisma.alertasOffline.create({
      data: {
        usuario_id: user.usuario_id,
        cluster_detectado: al.cluster,
        drop_pct_detectado: new Prisma.Decimal(al.drop_pct),
        congestionamiento: new Prisma.Decimal(al.congestion),
        mensaje: al.mensaje,
        curso_sugerido_id: cursoId,
        vista: false,
      },
    });
  }

  // ============================================
  // 24. NOTIFICACIONES RADAR
  // ============================================
  console.log('📝 Creando notificaciones radar...');
  const notificacionesData = [
    {
      usuario: 'carlos.mendoza@email.com',
      tipo: 'vacante',
      titulo: 'Nueva vacante recomendada',
      mensaje: 'Hay una nueva vacante de Full Stack Senior',
      datos: { vacante_id: vacantesIds[0] },
    },
    {
      usuario: 'laura.gomez@email.com',
      tipo: 'curso',
      titulo: 'Curso recomendado',
      mensaje: 'Te recomendamos el curso de Data Analytics',
      datos: { curso_id: '123' },
    },
    {
      usuario: 'ana.martinez@email.com',
      tipo: 'alerta',
      titulo: 'Alerta de conectividad',
      mensaje: 'Tu zona tiene baja calidad de red',
      datos: { cluster: 'Medellín' },
    },
  ];

  for (const not of notificacionesData) {
    const user = userMap.get(not.usuario);
    if (user) {
      await prisma.notificacionesRadar.create({
        data: {
          usuario_id: user.usuario_id,
          tipo: not.tipo,
          titulo: not.titulo,
          mensaje: not.mensaje,
          datos: not.datos,
        },
      });
    }
  }

  console.log('📝 Creando distancias entre clusters...');
  const distanciasData = [
    {
      origem: 'Buenos Aires',
      destino: 'CDMX',
      dist: 7000.0,
      p25: 6500,
      p75: 7500,
      periodo: 'diurno',
      amostras: 1000,
    },
    {
      origem: 'Buenos Aires',
      destino: 'Medellín',
      dist: 5000.0,
      p25: 4800,
      p75: 5200,
      periodo: 'nocturno',
      amostras: 800,
    },
  ];

  for (const d of distanciasData) {
    await prisma.distanciasCluster.upsert({
      where: {
        cluster_origem_cluster_destino: {
          cluster_origem: d.origem,
          cluster_destino: d.destino,
        },
      },
      update: {},
      create: {
        cluster_origem: d.origem,
        cluster_destino: d.destino,
        dist_media_km: new Prisma.Decimal(d.dist),
        dist_p25_km: new Prisma.Decimal(d.p25),
        dist_p75_km: new Prisma.Decimal(d.p75),
        periodo_predominante: d.periodo,
        n_amostras: d.amostras,
      },
    });
  }

  console.log('📝 Creando flujos origen-destino...');
  const odData = [
    {
      origem: 'Buenos Aires',
      destino: 'CDMX',
      periodo: 'diurno',
      viajes: 500,
      dist: 7000,
      mesmo: 0,
    },
    {
      origem: 'Buenos Aires',
      destino: 'Medellín',
      periodo: 'nocturno',
      viajes: 300,
      dist: 5000,
      mesmo: 0,
    },
  ];

  for (const od of odData) {
    await prisma.origenDestino.upsert({
      where: {
        cluster_origem_cluster_destino: {
          cluster_origem: od.origem,
          cluster_destino: od.destino,
        },
      },
      update: {},
      create: {
        cluster_origem: od.origem,
        cluster_destino: od.destino,
        periodo_predominante: od.periodo,
        n_viagens_estimado: od.viajes,
        dist_media_km: new Prisma.Decimal(od.dist),
        mesmo_cluster: od.mesmo,
      },
    });
  }

  console.log('✅ Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
