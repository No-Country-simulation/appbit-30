/*
  Warnings:

  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GeneroEnum" AS ENUM ('Masculino', 'Femenino', 'No binario', 'Prefiero no decir');

-- CreateEnum
CREATE TYPE "NivelEducacionEnum" AS ENUM ('Secundario incompleto', 'Secundario completo', 'Universitario incompleto', 'Universitario completo', 'Licenciatura', 'Diplomatura', 'Maestría', 'Doctorado');

-- CreateEnum
CREATE TYPE "MomentoProfesionalEnum" AS ENUM ('Estudio actualmente', 'Sin experiencia laboral', 'En búsqueda activa', 'Trabajando (quiero cambiar)', 'Freelancer', 'Emprendedor/a');

-- CreateEnum
CREATE TYPE "AreaInteresEnum" AS ENUM ('Data & Analytics', 'Desarrollo Web', 'UX / UI Design', 'Ciberseguridad', 'Cloud & DevOps', 'Inteligencia Artificial', 'Marketing Digital', 'Product Management');

-- CreateEnum
CREATE TYPE "NivelIdiomaEnum" AS ENUM ('Nativo', 'A1 (Básico)', 'B1 (Intermedio)', 'B2 (Avanzado)', 'C1/C2 (Bilingüe)');

-- CreateEnum
CREATE TYPE "DisponibilidadEnum" AS ENUM ('Part time', 'Full time', 'Contractor', 'Freelance');

-- CreateEnum
CREATE TYPE "UbicacionTrabajoEnum" AS ENUM ('Presencial', 'Híbrido', '100% Remoto');

-- CreateEnum
CREATE TYPE "TipoConexionEnum" AS ENUM ('Banda ancha estable', 'Datos móviles', 'Conexión inestable', 'Sin conexión en casa');

-- CreateEnum
CREATE TYPE "DispositivoEnum" AS ENUM ('Solo celular', 'PC / Laptop', 'Tablet');

-- CreateEnum
CREATE TYPE "ObjetivoUsuarioEnum" AS ENUM ('Conseguir mi primer empleo IT', 'Reconversión laboral', 'Mejorar mi salario', 'Definir mi camino profesional', 'Ampliar mi red de contactos', 'Aprender nuevas tecnologías', 'Estudiar sin trabajar', 'Emprender');

-- CreateEnum
CREATE TYPE "EstadoHabilidadEnum" AS ENUM ('Adquirida', 'En progreso', 'Faltante');

-- CreateEnum
CREATE TYPE "EstadoCheckinEmojiEnum" AS ENUM ('Agotado', 'Triste', 'Neutral', 'Bien', 'Genial');

-- CreateEnum
CREATE TYPE "EstadoPostulacionEnum" AS ENUM ('Enviada', 'Vista', 'En proceso', 'Rechazada', 'Aceptada');

-- CreateEnum
CREATE TYPE "EstadoInscripcionEnum" AS ENUM ('Inscrito', 'En progreso', 'Completado', 'Abandonado');

-- CreateEnum
CREATE TYPE "EstadoLeccionEnum" AS ENUM ('No iniciada', 'En progreso', 'Completada');

-- CreateEnum
CREATE TYPE "PrioridadPlanEnum" AS ENUM ('Alta prioridad', 'Media prioridad', 'Baja prioridad');

-- CreateEnum
CREATE TYPE "TipoRecursoEnum" AS ENUM ('Gratuito', 'Pago');

-- CreateEnum
CREATE TYPE "IdiomaAppEnum" AS ENUM ('es', 'pt');

-- CreateEnum
CREATE TYPE "MobilityPatternEnum" AS ENUM ('Baja', 'Moderada', 'Intensa');

-- CreateEnum
CREATE TYPE "IncomeClusterEnum" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "ModalidadVacanteEnum" AS ENUM ('Presencial', 'Híbrido', '100% Remoto');

-- CreateEnum
CREATE TYPE "NivelVacanteEnum" AS ENUM ('Jr / Entry Level', 'Semi Senior', 'Senior');

-- CreateEnum
CREATE TYPE "JornadaEnum" AS ENUM ('Jornada completa', 'Media jornada', 'Relación de dependencia', 'Freelance');

-- DropTable
DROP TABLE "UserProfile";

-- CreateTable
CREATE TABLE "usuarios" (
    "usuario_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fecha_nacimiento" DATE NOT NULL,
    "genero" "GeneroEnum" NOT NULL,
    "pais" VARCHAR(100) NOT NULL,
    "provincia_estado" VARCHAR(100),
    "ciudad" VARCHAR(150) NOT NULL,
    "zona_residencia" VARCHAR(255),
    "nivel_educacion" "NivelEducacionEnum" NOT NULL,
    "momento_profesional" "MomentoProfesionalEnum" NOT NULL,
    "tipo_conexion" "TipoConexionEnum" NOT NULL,
    "whatsapp_codigo" VARCHAR(10),
    "whatsapp_numero" VARCHAR(20),
    "idioma_app" "IdiomaAppEnum" NOT NULL DEFAULT 'es',
    "perfil_completado" SMALLINT NOT NULL DEFAULT 0,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "confianza" DECIMAL(3,2),
    "auth_uid" UUID,
    "email" VARCHAR(255) NOT NULL,
    "nombre_completo" VARCHAR(255) NOT NULL,
    "avatar_url" TEXT,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "usuario_objetivos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "objetivo" "ObjetivoUsuarioEnum" NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_objetivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_dispositivos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "dispositivo" "DispositivoEnum" NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_idiomas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "idioma" VARCHAR(50) NOT NULL,
    "nivel" "NivelIdiomaEnum" NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_idiomas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_areas_interes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "area" "AreaInteresEnum" NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_areas_interes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_disponibilidad" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "disponibilidad" "DisponibilidadEnum" NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_disponibilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_ubicacion_trabajo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "ubicacion" "UbicacionTrabajoEnum" NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_ubicacion_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habilidades_mercado" (
    "habilidad_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(255) NOT NULL,
    "categoria" VARCHAR(100),
    "area_principal" "AreaInteresEnum",
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habilidades_mercado_pkey" PRIMARY KEY ("habilidad_id")
);

-- CreateTable
CREATE TABLE "usuario_habilidades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "habilidad_id" UUID NOT NULL,
    "estado" "EstadoHabilidadEnum" NOT NULL DEFAULT 'Faltante',
    "actualizado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_habilidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "empresa_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "sector" VARCHAR(100),
    "tamanio" VARCHAR(50),
    "logo_url" TEXT,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("empresa_id")
);

-- CreateTable
CREATE TABLE "vacantes" (
    "vacante_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "area" "AreaInteresEnum" NOT NULL,
    "nivel" "NivelVacanteEnum" NOT NULL DEFAULT 'Jr / Entry Level',
    "descripcion" TEXT,
    "educacion_requerida" VARCHAR(255),
    "experiencia_solicitada" VARCHAR(255),
    "jornada" "JornadaEnum",
    "modalidad" "ModalidadVacanteEnum" NOT NULL DEFAULT 'Híbrido',
    "pais" VARCHAR(100) NOT NULL,
    "ciudad" VARCHAR(150),
    "detalle_modalidad" VARCHAR(255),
    "distancia_zona" VARCHAR(100),
    "idiomas_requeridos" JSONB DEFAULT '[]',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_publicacion" DATE NOT NULL DEFAULT CURRENT_DATE,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacantes_pkey" PRIMARY KEY ("vacante_id")
);

-- CreateTable
CREATE TABLE "requisitos_vacante" (
    "requisito_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vacante_id" UUID NOT NULL,
    "habilidad_id" UUID NOT NULL,
    "prioridad" SMALLINT NOT NULL DEFAULT 1,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requisitos_vacante_pkey" PRIMARY KEY ("requisito_id")
);

-- CreateTable
CREATE TABLE "postulaciones" (
    "postulacion_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "vacante_id" UUID NOT NULL,
    "mensaje_motivacion" TEXT,
    "usar_cv_guardado" BOOLEAN NOT NULL DEFAULT true,
    "cv_url" TEXT,
    "match_porcentaje" DECIMAL(5,2),
    "estado" "EstadoPostulacionEnum" NOT NULL DEFAULT 'Enviada',
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postulaciones_pkey" PRIMARY KEY ("postulacion_id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "checkin_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "emoji" "EstadoCheckinEmojiEnum" NOT NULL,
    "nota_diaria" DECIMAL(4,2) NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("checkin_id")
);

-- CreateTable
CREATE TABLE "check_in_motivos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "checkin_id" UUID NOT NULL,
    "motivo" VARCHAR(255) NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_in_motivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_in_contexto" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "checkin_id" UUID NOT NULL,
    "contexto" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_in_contexto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respuestas_salud" (
    "respuesta_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "checkin_id" UUID,
    "nota_semanal" DECIMAL(4,2) NOT NULL,
    "nota_actual" DECIMAL(4,2) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "accion_sugerida" TEXT NOT NULL,
    "derivar_cvv" BOOLEAN NOT NULL DEFAULT false,
    "alerta" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respuestas_salud_pkey" PRIMARY KEY ("respuesta_id")
);

-- CreateTable
CREATE TABLE "orientaciones" (
    "orientacion_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "gap_porcentual" DECIMAL(5,2) NOT NULL,
    "gap_items" JSONB NOT NULL DEFAULT '[]',
    "trayectoria_sugerida" JSONB NOT NULL DEFAULT '[]',
    "vacantes_compatibles" JSONB NOT NULL DEFAULT '[]',
    "confianza" DECIMAL(3,2) NOT NULL,
    "idioma_respuesta" "IdiomaAppEnum" NOT NULL DEFAULT 'es',
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orientaciones_pkey" PRIMARY KEY ("orientacion_id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "curso_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titulo" VARCHAR(255) NOT NULL,
    "subtitulo" VARCHAR(255),
    "descripcion" TEXT,
    "area" "AreaInteresEnum" NOT NULL,
    "tipo" "TipoRecursoEnum" NOT NULL DEFAULT 'Gratuito',
    "plataforma" VARCHAR(255),
    "url_externa" TEXT,
    "duracion_estimada_dias" INTEGER,
    "imagen_portada_url" TEXT,
    "habilidad_principal" UUID,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("curso_id")
);

-- CreateTable
CREATE TABLE "modulos" (
    "modulo_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "curso_id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "orden" SMALLINT NOT NULL,
    "total_lecciones" SMALLINT NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("modulo_id")
);

-- CreateTable
CREATE TABLE "lecciones" (
    "leccion_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "modulo_id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "orden" SMALLINT NOT NULL,
    "tipo" VARCHAR(50) DEFAULT 'Video',
    "duracion_minutos" DECIMAL(6,2),
    "video_url" TEXT,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lecciones_pkey" PRIMARY KEY ("leccion_id")
);

-- CreateTable
CREATE TABLE "inscripciones_curso" (
    "inscripcion_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "curso_id" UUID NOT NULL,
    "estado" "EstadoInscripcionEnum" NOT NULL DEFAULT 'Inscrito',
    "progreso_porcentaje" SMALLINT NOT NULL DEFAULT 0,
    "fecha_inicio" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_completado" TIMESTAMPTZ,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscripciones_curso_pkey" PRIMARY KEY ("inscripcion_id")
);

-- CreateTable
CREATE TABLE "progreso_leccion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "leccion_id" UUID NOT NULL,
    "estado" "EstadoLeccionEnum" NOT NULL DEFAULT 'No iniciada',
    "tiempo_visto_seg" INTEGER DEFAULT 0,
    "completado_en" TIMESTAMPTZ,

    CONSTRAINT "progreso_leccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos_descarga" (
    "recurso_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "curso_id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(50),
    "tamanio_mb" DECIMAL(8,2),
    "url_descarga" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recursos_descarga_pkey" PRIMARY KEY ("recurso_id")
);

-- CreateTable
CREATE TABLE "descargas_offline" (
    "descarga_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "recurso_id" UUID NOT NULL,
    "descargado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "descargas_offline_pkey" PRIMARY KEY ("descarga_id")
);

-- CreateTable
CREATE TABLE "plan_accion" (
    "plan_item_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "prioridad" "PrioridadPlanEnum" NOT NULL,
    "curso_vinculado_id" UUID,
    "accion_label" VARCHAR(100),
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "orden" SMALLINT NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_accion_pkey" PRIMARY KEY ("plan_item_id")
);

-- CreateTable
CREATE TABLE "perfil_movilidad" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID,
    "assinante_hash" VARCHAR(255) NOT NULL,
    "home_cluster" VARCHAR(100),
    "home_municipio" VARCHAR(100),
    "income_cluster" "IncomeClusterEnum",
    "age_group" VARCHAR(20),
    "mobility_pattern" "MobilityPatternEnum",
    "flag_flagship" BOOLEAN DEFAULT false,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfil_movilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calidad_red_zona" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ecgi" VARCHAR(50) NOT NULL,
    "cluster" VARCHAR(100) NOT NULL,
    "municipio" VARCHAR(100),
    "day_date" DATE NOT NULL,
    "periodo" VARCHAR(20),
    "n_usuarios" INTEGER,
    "n_sessoes" INTEGER,
    "download_bytes" BIGINT,
    "upload_bytes" BIGINT,
    "dur_media_s" DECIMAL(10,2),
    "drop_pct_medio" DECIMAL(5,4),
    "congestionamento_medio" DECIMAL(5,4),
    "lat" DECIMAL(10,7),
    "lon" DECIMAL(10,7),
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calidad_red_zona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_offline" (
    "alerta_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "cluster_detectado" VARCHAR(100),
    "drop_pct_detectado" DECIMAL(5,4),
    "congestionamiento" DECIMAL(5,4),
    "mensaje" TEXT NOT NULL,
    "curso_sugerido_id" UUID,
    "vista" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_offline_pkey" PRIMARY KEY ("alerta_id")
);

-- CreateTable
CREATE TABLE "notificaciones_radar" (
    "notificacion_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "datos" JSONB NOT NULL DEFAULT '{}',
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_radar_pkey" PRIMARY KEY ("notificacion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_auth_uid_key" ON "usuarios"("auth_uid");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_pais" ON "usuarios"("pais");

-- CreateIndex
CREATE INDEX "idx_usuarios_ciudad" ON "usuarios"("ciudad");

-- CreateIndex
CREATE INDEX "idx_usuarios_email" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_uobj_usuario" ON "usuario_objetivos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_objetivos_usuario_id_objetivo_key" ON "usuario_objetivos"("usuario_id", "objetivo");

-- CreateIndex
CREATE INDEX "idx_udis_usuario" ON "usuario_dispositivos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_dispositivos_usuario_id_dispositivo_key" ON "usuario_dispositivos"("usuario_id", "dispositivo");

-- CreateIndex
CREATE INDEX "idx_uidi_usuario" ON "usuario_idiomas"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_idiomas_usuario_id_idioma_key" ON "usuario_idiomas"("usuario_id", "idioma");

-- CreateIndex
CREATE INDEX "idx_uarea_usuario" ON "usuario_areas_interes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_areas_interes_usuario_id_area_key" ON "usuario_areas_interes"("usuario_id", "area");

-- CreateIndex
CREATE INDEX "idx_udisp_usuario" ON "usuario_disponibilidad"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_disponibilidad_usuario_id_disponibilidad_key" ON "usuario_disponibilidad"("usuario_id", "disponibilidad");

-- CreateIndex
CREATE INDEX "idx_uubic_usuario" ON "usuario_ubicacion_trabajo"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_ubicacion_trabajo_usuario_id_ubicacion_key" ON "usuario_ubicacion_trabajo"("usuario_id", "ubicacion");

-- CreateIndex
CREATE UNIQUE INDEX "habilidades_mercado_nombre_key" ON "habilidades_mercado"("nombre");

-- CreateIndex
CREATE INDEX "idx_hab_nombre" ON "habilidades_mercado"("nombre");

-- CreateIndex
CREATE INDEX "idx_hab_area" ON "habilidades_mercado"("area_principal");

-- CreateIndex
CREATE INDEX "idx_uhab_usuario" ON "usuario_habilidades"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_uhab_estado" ON "usuario_habilidades"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_habilidades_usuario_id_habilidad_id_key" ON "usuario_habilidades"("usuario_id", "habilidad_id");

-- CreateIndex
CREATE INDEX "idx_empresa_nombre" ON "empresas"("nombre");

-- CreateIndex
CREATE INDEX "idx_vac_area" ON "vacantes"("area");

-- CreateIndex
CREATE INDEX "idx_vac_pais" ON "vacantes"("pais");

-- CreateIndex
CREATE INDEX "idx_vac_activa" ON "vacantes"("activa");

-- CreateIndex
CREATE INDEX "idx_vac_empresa" ON "vacantes"("empresa_id");

-- CreateIndex
CREATE INDEX "idx_req_vacante" ON "requisitos_vacante"("vacante_id");

-- CreateIndex
CREATE INDEX "idx_req_habilidad" ON "requisitos_vacante"("habilidad_id");

-- CreateIndex
CREATE INDEX "idx_post_usuario" ON "postulaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_post_vacante" ON "postulaciones"("vacante_id");

-- CreateIndex
CREATE INDEX "idx_post_estado" ON "postulaciones"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "postulaciones_usuario_id_vacante_id_key" ON "postulaciones"("usuario_id", "vacante_id");

-- CreateIndex
CREATE INDEX "idx_chk_usuario" ON "check_ins"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_chk_fecha" ON "check_ins"("creado_en");

-- CreateIndex
CREATE INDEX "idx_chkmot_checkin" ON "check_in_motivos"("checkin_id");

-- CreateIndex
CREATE INDEX "idx_chkctx_checkin" ON "check_in_contexto"("checkin_id");

-- CreateIndex
CREATE INDEX "idx_rsalud_usuario" ON "respuestas_salud"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_rsalud_cvv" ON "respuestas_salud"("derivar_cvv");

-- CreateIndex
CREATE INDEX "idx_rsalud_fecha" ON "respuestas_salud"("creado_en");

-- CreateIndex
CREATE INDEX "idx_orient_usuario" ON "orientaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_orient_fecha" ON "orientaciones"("creado_en");

-- CreateIndex
CREATE INDEX "idx_curso_area" ON "cursos"("area");

-- CreateIndex
CREATE INDEX "idx_curso_activo" ON "cursos"("activo");

-- CreateIndex
CREATE INDEX "idx_mod_curso" ON "modulos"("curso_id");

-- CreateIndex
CREATE INDEX "idx_lec_modulo" ON "lecciones"("modulo_id");

-- CreateIndex
CREATE INDEX "idx_insc_usuario" ON "inscripciones_curso"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_insc_curso" ON "inscripciones_curso"("curso_id");

-- CreateIndex
CREATE INDEX "idx_insc_estado" ON "inscripciones_curso"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_curso_usuario_id_curso_id_key" ON "inscripciones_curso"("usuario_id", "curso_id");

-- CreateIndex
CREATE INDEX "idx_prog_usuario" ON "progreso_leccion"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_prog_leccion" ON "progreso_leccion"("leccion_id");

-- CreateIndex
CREATE UNIQUE INDEX "progreso_leccion_usuario_id_leccion_id_key" ON "progreso_leccion"("usuario_id", "leccion_id");

-- CreateIndex
CREATE INDEX "idx_recdesc_curso" ON "recursos_descarga"("curso_id");

-- CreateIndex
CREATE INDEX "idx_doff_usuario" ON "descargas_offline"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_plan_usuario" ON "plan_accion"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_movilidad_usuario_id_key" ON "perfil_movilidad"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_movilidad_assinante_hash_key" ON "perfil_movilidad"("assinante_hash");

-- CreateIndex
CREATE INDEX "idx_pmov_hash" ON "perfil_movilidad"("assinante_hash");

-- CreateIndex
CREATE INDEX "idx_pmov_income" ON "perfil_movilidad"("income_cluster");

-- CreateIndex
CREATE INDEX "idx_pmov_usuario" ON "perfil_movilidad"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_calred_cluster" ON "calidad_red_zona"("cluster");

-- CreateIndex
CREATE INDEX "idx_calred_fecha" ON "calidad_red_zona"("day_date");

-- CreateIndex
CREATE INDEX "idx_calred_ecgi" ON "calidad_red_zona"("ecgi");

-- CreateIndex
CREATE INDEX "idx_calred_drop" ON "calidad_red_zona"("drop_pct_medio");

-- CreateIndex
CREATE INDEX "idx_aloff_usuario" ON "alertas_offline"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_aloff_vista" ON "alertas_offline"("vista");

-- CreateIndex
CREATE INDEX "idx_notif_usuario" ON "notificaciones_radar"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_notif_leida" ON "notificaciones_radar"("leida");

-- AddForeignKey
ALTER TABLE "usuario_objetivos" ADD CONSTRAINT "usuario_objetivos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_dispositivos" ADD CONSTRAINT "usuario_dispositivos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_idiomas" ADD CONSTRAINT "usuario_idiomas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_areas_interes" ADD CONSTRAINT "usuario_areas_interes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_disponibilidad" ADD CONSTRAINT "usuario_disponibilidad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_ubicacion_trabajo" ADD CONSTRAINT "usuario_ubicacion_trabajo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_habilidades" ADD CONSTRAINT "usuario_habilidades_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_habilidades" ADD CONSTRAINT "usuario_habilidades_habilidad_id_fkey" FOREIGN KEY ("habilidad_id") REFERENCES "habilidades_mercado"("habilidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacantes" ADD CONSTRAINT "vacantes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("empresa_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_vacante" ADD CONSTRAINT "requisitos_vacante_vacante_id_fkey" FOREIGN KEY ("vacante_id") REFERENCES "vacantes"("vacante_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_vacante" ADD CONSTRAINT "requisitos_vacante_habilidad_id_fkey" FOREIGN KEY ("habilidad_id") REFERENCES "habilidades_mercado"("habilidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_vacante_id_fkey" FOREIGN KEY ("vacante_id") REFERENCES "vacantes"("vacante_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_motivos" ADD CONSTRAINT "check_in_motivos_checkin_id_fkey" FOREIGN KEY ("checkin_id") REFERENCES "check_ins"("checkin_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_contexto" ADD CONSTRAINT "check_in_contexto_checkin_id_fkey" FOREIGN KEY ("checkin_id") REFERENCES "check_ins"("checkin_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_salud" ADD CONSTRAINT "respuestas_salud_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_salud" ADD CONSTRAINT "respuestas_salud_checkin_id_fkey" FOREIGN KEY ("checkin_id") REFERENCES "check_ins"("checkin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientaciones" ADD CONSTRAINT "orientaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_habilidad_principal_fkey" FOREIGN KEY ("habilidad_principal") REFERENCES "habilidades_mercado"("habilidad_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("curso_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecciones" ADD CONSTRAINT "lecciones_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("modulo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_curso" ADD CONSTRAINT "inscripciones_curso_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_curso" ADD CONSTRAINT "inscripciones_curso_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("curso_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_leccion" ADD CONSTRAINT "progreso_leccion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_leccion" ADD CONSTRAINT "progreso_leccion_leccion_id_fkey" FOREIGN KEY ("leccion_id") REFERENCES "lecciones"("leccion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos_descarga" ADD CONSTRAINT "recursos_descarga_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("curso_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descargas_offline" ADD CONSTRAINT "descargas_offline_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descargas_offline" ADD CONSTRAINT "descargas_offline_recurso_id_fkey" FOREIGN KEY ("recurso_id") REFERENCES "recursos_descarga"("recurso_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_accion" ADD CONSTRAINT "plan_accion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_accion" ADD CONSTRAINT "plan_accion_curso_vinculado_id_fkey" FOREIGN KEY ("curso_vinculado_id") REFERENCES "cursos"("curso_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_movilidad" ADD CONSTRAINT "perfil_movilidad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_offline" ADD CONSTRAINT "alertas_offline_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_offline" ADD CONSTRAINT "alertas_offline_curso_sugerido_id_fkey" FOREIGN KEY ("curso_sugerido_id") REFERENCES "cursos"("curso_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones_radar" ADD CONSTRAINT "notificaciones_radar_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
