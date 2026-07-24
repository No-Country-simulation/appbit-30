-- CreateEnum
CREATE TYPE "TipoContenidoCursoEnum" AS ENUM ('Curso_externo', 'Roadmap_externo', 'Practica', 'Guia');

-- AlterTable
ALTER TABLE "cursos" ADD COLUMN     "nivel_recomendado" VARCHAR(50),
ADD COLUMN     "tipo_contenido" "TipoContenidoCursoEnum" NOT NULL DEFAULT 'Curso_externo';

-- AlterTable
ALTER TABLE "plan_accion" ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "estado" VARCHAR(50) DEFAULT 'pending',
ADD COLUMN     "match_minimo" SMALLINT,
ADD COLUMN     "skill_objetivo_id" UUID,
ADD COLUMN     "tipo_item" VARCHAR(50);

-- AlterTable
ALTER TABLE "usuario_habilidades" ADD COLUMN     "progreso_porcentaje" SMALLINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "curso_habilidades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "curso_id" UUID NOT NULL,
    "habilidad_id" UUID NOT NULL,
    "peso" SMALLINT NOT NULL DEFAULT 1,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curso_habilidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leccion_habilidades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leccion_id" UUID NOT NULL,
    "habilidad_id" UUID NOT NULL,
    "peso" SMALLINT NOT NULL DEFAULT 1,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leccion_habilidades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_chab_curso" ON "curso_habilidades"("curso_id");

-- CreateIndex
CREATE INDEX "idx_chab_habilidad" ON "curso_habilidades"("habilidad_id");

-- CreateIndex
CREATE UNIQUE INDEX "curso_habilidades_curso_id_habilidad_id_key" ON "curso_habilidades"("curso_id", "habilidad_id");

-- CreateIndex
CREATE INDEX "idx_lhab_leccion" ON "leccion_habilidades"("leccion_id");

-- CreateIndex
CREATE INDEX "idx_lhab_habilidad" ON "leccion_habilidades"("habilidad_id");

-- CreateIndex
CREATE UNIQUE INDEX "leccion_habilidades_leccion_id_habilidad_id_key" ON "leccion_habilidades"("leccion_id", "habilidad_id");

-- AddForeignKey
ALTER TABLE "curso_habilidades" ADD CONSTRAINT "curso_habilidades_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("curso_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curso_habilidades" ADD CONSTRAINT "curso_habilidades_habilidad_id_fkey" FOREIGN KEY ("habilidad_id") REFERENCES "habilidades_mercado"("habilidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leccion_habilidades" ADD CONSTRAINT "leccion_habilidades_leccion_id_fkey" FOREIGN KEY ("leccion_id") REFERENCES "lecciones"("leccion_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leccion_habilidades" ADD CONSTRAINT "leccion_habilidades_habilidad_id_fkey" FOREIGN KEY ("habilidad_id") REFERENCES "habilidades_mercado"("habilidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;
