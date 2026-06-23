-- ============================================
-- TIPOS ENUM
-- ============================================

CREATE TYPE genero_enum AS ENUM (
  'Masculino',
  'Femenino',
  'No binario',
  'Prefiero no decir'
);

CREATE TYPE nivel_educacion_enum AS ENUM (
  'Secundario incompleto',
  'Secundario completo',
  'Universitario incompleto',
  'Universitario completo',
  'Licenciatura',
  'Diplomatura',
  'Maestría',
  'Doctorado'
);

CREATE TYPE momento_profesional_enum AS ENUM (
  'Estudio actualmente',
  'Sin experiencia laboral',
  'En búsqueda activa',
  'Trabajando (quiero cambiar)',
  'Freelancer',
  'Emprendedor/a'
);

CREATE TYPE area_interes_enum AS ENUM (
  'Data & Analytics',
  'Desarrollo Web',
  'UX / UI Design',
  'Ciberseguridad',
  'Cloud & DevOps',
  'Inteligencia Artificial',
  'Marketing Digital',
  'Product Management'
);

CREATE TYPE nivel_idioma_enum AS ENUM (
  'Nativo',
  'A1 (Básico)',
  'B1 (Intermedio)',
  'B2 (Avanzado)',
  'C1/C2 (Bilingüe)'
);

CREATE TYPE disponibilidad_enum AS ENUM (
  'Part time',
  'Full time',
  'Contractor',
  'Freelance'
);

CREATE TYPE ubicacion_trabajo_enum AS ENUM (
  'Presencial',
  'Híbrido',
  '100% Remoto'
);

CREATE TYPE tipo_conexion_enum AS ENUM (
  'Banda ancha estable',
  'Datos móviles',
  'Conexión inestable',
  'Sin conexión en casa'
);

CREATE TYPE dispositivo_enum AS ENUM (
  'Solo celular',
  'PC / Laptop',
  'Tablet'
);

CREATE TYPE objetivo_usuario_enum AS ENUM (
  'Conseguir mi primer empleo IT',
  'Reconversión laboral',
  'Mejorar mi salario',
  'Definir mi camino profesional',
  'Ampliar mi red de contactos',
  'Aprender nuevas tecnologías',
  'Estudiar sin trabajar',
  'Emprender'
);

CREATE TYPE estado_habilidad_enum AS ENUM (
  'Adquirida',
  'En progreso',
  'Faltante'
);

CREATE TYPE estado_checkin_emoji_enum AS ENUM (
  'Agotado',
  'Triste',
  'Neutral',
  'Bien',
  'Genial'
);

CREATE TYPE estado_postulacion_enum AS ENUM (
  'Enviada',
  'Vista',
  'En proceso',
  'Rechazada',
  'Aceptada'
);

CREATE TYPE estado_inscripcion_enum AS ENUM (
  'Inscrito',
  'En progreso',
  'Completado',
  'Abandonado'
);

CREATE TYPE estado_leccion_enum AS ENUM (
  'No iniciada',
  'En progreso',
  'Completada'
);

CREATE TYPE prioridad_plan_enum AS ENUM (
  'Alta prioridad',
  'Media prioridad',
  'Baja prioridad'
);

CREATE TYPE tipo_recurso_enum AS ENUM (
  'Gratuito',
  'Pago'
);

CREATE TYPE idioma_app_enum AS ENUM (
  'es',
  'pt'
);

CREATE TYPE mobility_pattern_enum AS ENUM (
  'Baja',
  'Moderada',
  'Intensa'
);

CREATE TYPE income_cluster_enum AS ENUM (
  'A',
  'B',
  'C',
  'D'
);

CREATE TYPE modalidad_vacante_enum AS ENUM (
  'Presencial',
  'Híbrido',
  '100% Remoto'
);

CREATE TYPE nivel_vacante_enum AS ENUM (
  'Jr / Entry Level',
  'Semi Senior',
  'Senior'
);

CREATE TYPE jornada_enum AS ENUM (
  'Jornada completa',
  'Media jornada',
  'Relación de dependencia',
  'Freelance'
);

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

CREATE TABLE usuarios (
  usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_nacimiento DATE NOT NULL,
  genero genero_enum NOT NULL,
  pais VARCHAR(100) NOT NULL,
  provincia_estado VARCHAR(100),
  ciudad VARCHAR(150) NOT NULL,
  zona_residencia VARCHAR(255),
  nivel_educacion nivel_educacion_enum NOT NULL,
  momento_profesional momento_profesional_enum NOT NULL,
  tipo_conexion tipo_conexion_enum NOT NULL,
  whatsapp_codigo VARCHAR(10),
  whatsapp_numero VARCHAR(20),
  idioma_app idioma_app_enum NOT NULL DEFAULT 'es',
  perfil_completado SMALLINT NOT NULL CHECK (perfil_completado BETWEEN 0 AND 100) DEFAULT 0,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  confianza NUMERIC(3,2) CHECK (confianza >= 0.00 AND confianza <= 1.00),
  auth_uid UUID UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usuario_objetivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  objetivo objetivo_usuario_enum NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usuario_dispositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  dispositivo dispositivo_enum NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usuario_idiomas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  idioma VARCHAR(50) NOT NULL,
  nivel nivel_idioma_enum NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usuario_areas_interes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  area area_interes_enum NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usuario_disponibilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  disponibilidad disponibilidad_enum NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usuario_ubicacion_trabajo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  ubicacion ubicacion_trabajo_enum NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE habilidades_mercado (
  habilidad_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) UNIQUE NOT NULL,
  categoria VARCHAR(100),
  area_principal area_interes_enum,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usuario_habilidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  habilidad_id UUID NOT NULL,
  estado estado_habilidad_enum NOT NULL DEFAULT 'Faltante',
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE empresas (
  empresa_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  sector VARCHAR(100),
  tamanio VARCHAR(50),
  logo_url TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vacantes (
  vacante_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  area area_interes_enum NOT NULL,
  nivel nivel_vacante_enum NOT NULL DEFAULT 'Jr / Entry Level',
  descripcion TEXT,
  educacion_requerida VARCHAR(255),
  experiencia_solicitada VARCHAR(255),
  jornada jornada_enum,
  modalidad modalidad_vacante_enum NOT NULL DEFAULT 'Híbrido',
  pais VARCHAR(100) NOT NULL,
  ciudad VARCHAR(150),
  detalle_modalidad VARCHAR(255),
  distancia_zona VARCHAR(100),
  idiomas_requeridos JSONB DEFAULT '[]',
  activa BOOLEAN NOT NULL DEFAULT true,
  fecha_publicacion DATE NOT NULL DEFAULT CURRENT_DATE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE requisitos_vacante (
  requisito_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacante_id UUID NOT NULL,
  habilidad_id UUID NOT NULL,
  prioridad SMALLINT NOT NULL CHECK (prioridad BETWEEN 1 AND 10) DEFAULT 1,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE postulaciones (
  postulacion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  vacante_id UUID NOT NULL,
  mensaje_motivacion TEXT,
  usar_cv_guardado BOOLEAN NOT NULL DEFAULT true,
  cv_url TEXT,
  match_porcentaje NUMERIC(5,2) CHECK (match_porcentaje >= 0 AND match_porcentaje <= 100),
  estado estado_postulacion_enum NOT NULL DEFAULT 'Enviada',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE check_ins (
  checkin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  emoji estado_checkin_emoji_enum NOT NULL,
  nota_diaria NUMERIC(4,2) NOT NULL CHECK (nota_diaria >= 0.00 AND nota_diaria <= 10.00),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE check_in_motivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE check_in_contexto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL,
  contexto TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE respuestas_salud (
  respuesta_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  checkin_id UUID,
  nota_semanal NUMERIC(4,2) NOT NULL CHECK (nota_semanal >= 0.00 AND nota_semanal <= 10.00),
  nota_actual NUMERIC(4,2) NOT NULL CHECK (nota_actual >= 0.00 AND nota_actual <= 10.00),
  mensaje TEXT NOT NULL,
  accion_sugerida TEXT NOT NULL,
  derivar_cvv BOOLEAN NOT NULL DEFAULT false,
  alerta BOOLEAN NOT NULL DEFAULT false,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_regla_cvv CHECK (nota_semanal >= 4.0 OR (derivar_cvv = TRUE AND alerta = TRUE))
);

CREATE TABLE orientaciones (
  orientacion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  gap_porcentual NUMERIC(5,2) NOT NULL CHECK (gap_porcentual >= 0.00 AND gap_porcentual <= 100.00),
  gap_items JSONB NOT NULL DEFAULT '[]',
  trayectoria_sugerida JSONB NOT NULL DEFAULT '[]',
  vacantes_compatibles JSONB NOT NULL DEFAULT '[]',
  confianza NUMERIC(3,2) NOT NULL CHECK (confianza >= 0.00 AND confianza <= 1.00),
  idioma_respuesta idioma_app_enum NOT NULL DEFAULT 'es',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cursos (
  curso_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  subtitulo VARCHAR(255),
  descripcion TEXT,
  area area_interes_enum NOT NULL,
  tipo tipo_recurso_enum NOT NULL DEFAULT 'Gratuito',
  plataforma VARCHAR(255),
  url_externa TEXT,
  duracion_estimada_dias INTEGER,
  imagen_portada_url TEXT,
  habilidad_principal UUID,
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE modulos (
  modulo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  orden SMALLINT NOT NULL,
  total_lecciones SMALLINT NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lecciones (
  leccion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  orden SMALLINT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'Video',
  duracion_minutos NUMERIC(6,2),
  video_url TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inscripciones_curso (
  inscripcion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  curso_id UUID NOT NULL,
  estado estado_inscripcion_enum NOT NULL DEFAULT 'Inscrito',
  progreso_porcentaje SMALLINT NOT NULL CHECK (progreso_porcentaje BETWEEN 0 AND 100) DEFAULT 0,
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_completado TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE progreso_leccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  leccion_id UUID NOT NULL,
  estado estado_leccion_enum NOT NULL DEFAULT 'No iniciada',
  tiempo_visto_seg INTEGER DEFAULT 0,
  completado_en TIMESTAMPTZ
);

CREATE TABLE recursos_descarga (
  recurso_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50),
  tamanio_mb NUMERIC(8,2),
  url_descarga TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE descargas_offline (
  descarga_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  recurso_id UUID NOT NULL,
  descargado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE plan_accion (
  plan_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  prioridad prioridad_plan_enum NOT NULL,
  curso_vinculado_id UUID,
  accion_label VARCHAR(100),
  completado BOOLEAN NOT NULL DEFAULT false,
  orden SMALLINT NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE perfil_movilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE,
  assinante_hash VARCHAR(255) UNIQUE NOT NULL,
  home_cluster VARCHAR(100),
  home_municipio VARCHAR(100),
  income_cluster income_cluster_enum,
  age_group VARCHAR(20),
  mobility_pattern mobility_pattern_enum,
  flag_flagship BOOLEAN DEFAULT false,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE calidad_red_zona (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecgi VARCHAR(50) NOT NULL,
  cluster VARCHAR(100) NOT NULL,
  municipio VARCHAR(100),
  day_date DATE NOT NULL,
  periodo VARCHAR(20),
  n_usuarios INTEGER,
  n_sessoes INTEGER,
  download_bytes BIGINT,
  upload_bytes BIGINT,
  dur_media_s NUMERIC(10,2),
  drop_pct_medio NUMERIC(5,4),
  congestionamento_medio NUMERIC(5,4),
  lat NUMERIC(10,7),
  lon NUMERIC(10,7),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alertas_offline (
  alerta_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  cluster_detectado VARCHAR(100),
  drop_pct_detectado NUMERIC(5,4),
  congestionamiento NUMERIC(5,4),
  mensaje TEXT NOT NULL,
  curso_sugerido_id UUID,
  vista BOOLEAN NOT NULL DEFAULT false,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notificaciones_radar (
  notificacion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  datos JSONB DEFAULT '{}',
  leida BOOLEAN NOT NULL DEFAULT false,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_usuarios_pais ON usuarios (pais);
CREATE INDEX idx_usuarios_ciudad ON usuarios (ciudad);
CREATE INDEX idx_usuarios_email ON usuarios (email);

CREATE UNIQUE INDEX ON usuario_objetivos (usuario_id, objetivo);
CREATE INDEX idx_uobj_usuario ON usuario_objetivos (usuario_id);

CREATE UNIQUE INDEX ON usuario_dispositivos (usuario_id, dispositivo);
CREATE INDEX idx_udis_usuario ON usuario_dispositivos (usuario_id);

CREATE UNIQUE INDEX ON usuario_idiomas (usuario_id, idioma);
CREATE INDEX idx_uidi_usuario ON usuario_idiomas (usuario_id);

CREATE UNIQUE INDEX ON usuario_areas_interes (usuario_id, area);
CREATE INDEX idx_uarea_usuario ON usuario_areas_interes (usuario_id);

CREATE UNIQUE INDEX ON usuario_disponibilidad (usuario_id, disponibilidad);
CREATE INDEX idx_udisp_usuario ON usuario_disponibilidad (usuario_id);

CREATE UNIQUE INDEX ON usuario_ubicacion_trabajo (usuario_id, ubicacion);
CREATE INDEX idx_uubic_usuario ON usuario_ubicacion_trabajo (usuario_id);

CREATE INDEX idx_hab_nombre ON habilidades_mercado (nombre);
CREATE INDEX idx_hab_area ON habilidades_mercado (area_principal);

CREATE UNIQUE INDEX ON usuario_habilidades (usuario_id, habilidad_id);
CREATE INDEX idx_uhab_usuario ON usuario_habilidades (usuario_id);
CREATE INDEX idx_uhab_estado ON usuario_habilidades (estado);

CREATE INDEX idx_empresa_nombre ON empresas (nombre);

CREATE INDEX idx_vac_area ON vacantes (area);
CREATE INDEX idx_vac_pais ON vacantes (pais);
CREATE INDEX idx_vac_activa ON vacantes (activa);
CREATE INDEX idx_vac_empresa ON vacantes (empresa_id);

CREATE INDEX idx_req_vacante ON requisitos_vacante (vacante_id);
CREATE INDEX idx_req_habilidad ON requisitos_vacante (habilidad_id);

CREATE UNIQUE INDEX ON postulaciones (usuario_id, vacante_id);
CREATE INDEX idx_post_usuario ON postulaciones (usuario_id);
CREATE INDEX idx_post_vacante ON postulaciones (vacante_id);
CREATE INDEX idx_post_estado ON postulaciones (estado);

CREATE INDEX idx_chk_usuario ON check_ins (usuario_id);
CREATE INDEX idx_chk_fecha ON check_ins (creado_en);

CREATE INDEX idx_chkmot_checkin ON check_in_motivos (checkin_id);
CREATE INDEX idx_chkctx_checkin ON check_in_contexto (checkin_id);

CREATE INDEX idx_rsalud_usuario ON respuestas_salud (usuario_id);
CREATE INDEX idx_rsalud_cvv ON respuestas_salud (derivar_cvv);
CREATE INDEX idx_rsalud_fecha ON respuestas_salud (creado_en);

CREATE INDEX idx_orient_usuario ON orientaciones (usuario_id);
CREATE INDEX idx_orient_fecha ON orientaciones (creado_en);

CREATE INDEX idx_curso_area ON cursos (area);
CREATE INDEX idx_curso_activo ON cursos (activo);

CREATE INDEX idx_mod_curso ON modulos (curso_id);
CREATE INDEX idx_lec_modulo ON lecciones (modulo_id);

CREATE UNIQUE INDEX ON inscripciones_curso (usuario_id, curso_id);
CREATE INDEX idx_insc_usuario ON inscripciones_curso (usuario_id);
CREATE INDEX idx_insc_curso ON inscripciones_curso (curso_id);
CREATE INDEX idx_insc_estado ON inscripciones_curso (estado);

CREATE UNIQUE INDEX ON progreso_leccion (usuario_id, leccion_id);
CREATE INDEX idx_prog_usuario ON progreso_leccion (usuario_id);
CREATE INDEX idx_prog_leccion ON progreso_leccion (leccion_id);

CREATE INDEX idx_recdesc_curso ON recursos_descarga (curso_id);
CREATE INDEX idx_doff_usuario ON descargas_offline (usuario_id);

CREATE INDEX idx_plan_usuario ON plan_accion (usuario_id);

CREATE INDEX idx_pmov_hash ON perfil_movilidad (assinante_hash);
CREATE INDEX idx_pmov_income ON perfil_movilidad (income_cluster);
CREATE INDEX idx_pmov_usuario ON perfil_movilidad (usuario_id);

CREATE INDEX idx_calred_cluster ON calidad_red_zona (cluster);
CREATE INDEX idx_calred_fecha ON calidad_red_zona (day_date);
CREATE INDEX idx_calred_ecgi ON calidad_red_zona (ecgi);
CREATE INDEX idx_calred_drop ON calidad_red_zona (drop_pct_medio);

CREATE INDEX idx_aloff_usuario ON alertas_offline (usuario_id);
CREATE INDEX idx_aloff_vista ON alertas_offline (vista);

CREATE INDEX idx_notif_usuario ON notificaciones_radar (usuario_id);
CREATE INDEX idx_notif_leida ON notificaciones_radar (leida);

-- ============================================
-- CLAVES FORÁNEAS
-- ============================================

ALTER TABLE usuario_objetivos ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE usuario_dispositivos ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE usuario_idiomas ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE usuario_areas_interes ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE usuario_disponibilidad ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE usuario_ubicacion_trabajo ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE usuario_habilidades ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE usuario_habilidades ADD FOREIGN KEY (habilidad_id) REFERENCES habilidades_mercado (habilidad_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE vacantes ADD FOREIGN KEY (empresa_id) REFERENCES empresas (empresa_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE requisitos_vacante ADD FOREIGN KEY (vacante_id) REFERENCES vacantes (vacante_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE requisitos_vacante ADD FOREIGN KEY (habilidad_id) REFERENCES habilidades_mercado (habilidad_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE postulaciones ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE postulaciones ADD FOREIGN KEY (vacante_id) REFERENCES vacantes (vacante_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE check_ins ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE check_in_motivos ADD FOREIGN KEY (checkin_id) REFERENCES check_ins (checkin_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE check_in_contexto ADD FOREIGN KEY (checkin_id) REFERENCES check_ins (checkin_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE respuestas_salud ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE respuestas_salud ADD FOREIGN KEY (checkin_id) REFERENCES check_ins (checkin_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE orientaciones ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE cursos ADD FOREIGN KEY (habilidad_principal) REFERENCES habilidades_mercado (habilidad_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE modulos ADD FOREIGN KEY (curso_id) REFERENCES cursos (curso_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE lecciones ADD FOREIGN KEY (modulo_id) REFERENCES modulos (modulo_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE inscripciones_curso ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE inscripciones_curso ADD FOREIGN KEY (curso_id) REFERENCES cursos (curso_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE progreso_leccion ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE progreso_leccion ADD FOREIGN KEY (leccion_id) REFERENCES lecciones (leccion_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE recursos_descarga ADD FOREIGN KEY (curso_id) REFERENCES cursos (curso_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE descargas_offline ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE descargas_offline ADD FOREIGN KEY (recurso_id) REFERENCES recursos_descarga (recurso_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE plan_accion ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE plan_accion ADD FOREIGN KEY (curso_vinculado_id) REFERENCES cursos (curso_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE perfil_movilidad ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE alertas_offline ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE alertas_offline ADD FOREIGN KEY (curso_sugerido_id) REFERENCES cursos (curso_id) DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE notificaciones_radar ADD FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;