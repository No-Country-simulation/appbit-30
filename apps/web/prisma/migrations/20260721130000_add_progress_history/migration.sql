CREATE TYPE "TipoEventoProgresoEnum" AS ENUM (
  'Onboarding',
  'Leccion',
  'Modulo',
  'Curso'
);

CREATE TABLE "historial_progreso" (
  "historial_id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "usuario_id" UUID NOT NULL,
  "tipo_evento" "TipoEventoProgresoEnum" NOT NULL,
  "entidad_id" UUID NOT NULL,
  "titulo" VARCHAR(255) NOT NULL,
  "match_anterior" SMALLINT NOT NULL,
  "match_nuevo" SMALLINT NOT NULL,
  "metadatos" JSONB NOT NULL DEFAULT '{}',
  "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "historial_progreso_pkey" PRIMARY KEY ("historial_id"),
  CONSTRAINT "historial_progreso_match_anterior_check"
    CHECK ("match_anterior" BETWEEN 0 AND 100),
  CONSTRAINT "historial_progreso_match_nuevo_check"
    CHECK ("match_nuevo" BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX "historial_progreso_usuario_id_tipo_evento_entidad_id_key"
ON "historial_progreso"("usuario_id", "tipo_evento", "entidad_id");

CREATE INDEX "idx_historial_progreso_usuario_fecha"
ON "historial_progreso"("usuario_id", "creado_en");

ALTER TABLE "historial_progreso"
ADD CONSTRAINT "historial_progreso_usuario_id_fkey"
FOREIGN KEY ("usuario_id")
REFERENCES "usuarios"("usuario_id")
ON DELETE CASCADE
ON UPDATE CASCADE;
