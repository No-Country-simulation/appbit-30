-- CreateEnum
CREATE TYPE "OnboardingStatusEnum" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable: add onboarding_status (keep old columns for data migration)
ALTER TABLE "usuarios" ADD COLUMN "onboarding_status" "OnboardingStatusEnum" NOT NULL DEFAULT 'PENDING';

-- CreateTable: usuario_nivel_educacion
CREATE TABLE "usuario_nivel_educacion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "nivel_educacion" "NivelEducacionEnum" NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usuario_nivel_educacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable: usuario_momento_profesional
CREATE TABLE "usuario_momento_profesional" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "momento_profesional" "MomentoProfesionalEnum" NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usuario_momento_profesional_pkey" PRIMARY KEY ("id")
);

-- Migrate existing nivel_educacion data from usuarios to junction table
INSERT INTO "usuario_nivel_educacion" ("usuario_id", "nivel_educacion")
SELECT "usuario_id", "nivel_educacion" FROM "usuarios"
WHERE "nivel_educacion" IS NOT NULL;

-- Migrate existing momento_profesional data from usuarios to junction table
INSERT INTO "usuario_momento_profesional" ("usuario_id", "momento_profesional")
SELECT "usuario_id", "momento_profesional" FROM "usuarios"
WHERE "momento_profesional" IS NOT NULL;

-- Drop old columns from usuarios
ALTER TABLE "usuarios" DROP COLUMN "nivel_educacion",
DROP COLUMN "momento_profesional";

-- Handle NivelIdiomaEnum migration
-- Rename old enum
ALTER TYPE "NivelIdiomaEnum" RENAME TO "NivelIdiomaEnum_old";
-- Create new enum
CREATE TYPE "NivelIdiomaEnum" AS ENUM ('A1 (Básico)', 'A2 (Elemental)', 'B1 (Intermedio)', 'B2 (Avanzado)', 'C1 (Fluido)');
-- Temporarily change column to text
ALTER TABLE "usuario_idiomas" ALTER COLUMN "nivel" TYPE text;
-- Update old values to new equivalents
UPDATE "usuario_idiomas" SET "nivel" = 'A1 (Básico)' WHERE "nivel" = 'Nativo';
UPDATE "usuario_idiomas" SET "nivel" = 'C1 (Fluido)' WHERE "nivel" = 'C1/C2 (Bilingüe)';
-- Convert column to new enum type
ALTER TABLE "usuario_idiomas" ALTER COLUMN "nivel" TYPE "NivelIdiomaEnum" USING "nivel"::"NivelIdiomaEnum";
-- Drop old enum
DROP TYPE "NivelIdiomaEnum_old";

-- CreateIndex
CREATE INDEX "idx_uned_usuario" ON "usuario_nivel_educacion"("usuario_id");
CREATE UNIQUE INDEX "usuario_nivel_educacion_usuario_id_nivel_educacion_key" ON "usuario_nivel_educacion"("usuario_id", "nivel_educacion");
CREATE INDEX "idx_umom_usuario" ON "usuario_momento_profesional"("usuario_id");
CREATE UNIQUE INDEX "usuario_momento_profesional_usuario_id_momento_profesional_key" ON "usuario_momento_profesional"("usuario_id", "momento_profesional");

-- AddForeignKey
ALTER TABLE "usuario_nivel_educacion" ADD CONSTRAINT "usuario_nivel_educacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usuario_momento_profesional" ADD CONSTRAINT "usuario_momento_profesional_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
