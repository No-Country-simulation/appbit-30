-- Preserve the already-applied learning tracking migration and repair it forward.

-- Backfill progress before enforcing bounds.
UPDATE "usuario_habilidades"
SET "progreso_porcentaje" = CASE
  WHEN "estado" = 'Adquirida' THEN 100
  ELSE 0
END;

UPDATE "plan_accion"
SET "match_minimo" = LEAST(100, GREATEST(0, "match_minimo"))
WHERE "match_minimo" IS NOT NULL;

UPDATE "curso_habilidades"
SET "peso" = 1
WHERE "peso" <= 0;

UPDATE "leccion_habilidades"
SET "peso" = 1
WHERE "peso" <= 0;

-- Keep the legacy primary skill available through the new many-to-many model.
INSERT INTO "curso_habilidades" ("curso_id", "habilidad_id", "peso")
SELECT "curso_id", "habilidad_principal", 1
FROM "cursos"
WHERE "habilidad_principal" IS NOT NULL
ON CONFLICT ("curso_id", "habilidad_id") DO NOTHING;

CREATE INDEX "idx_plan_skill_objetivo"
ON "plan_accion"("skill_objetivo_id");

ALTER TABLE "plan_accion"
ADD CONSTRAINT "plan_accion_skill_objetivo_id_fkey"
FOREIGN KEY ("skill_objetivo_id")
REFERENCES "habilidades_mercado"("habilidad_id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "usuario_habilidades"
ADD CONSTRAINT "usuario_habilidades_progreso_porcentaje_check"
CHECK ("progreso_porcentaje" BETWEEN 0 AND 100);

ALTER TABLE "plan_accion"
ADD CONSTRAINT "plan_accion_match_minimo_check"
CHECK ("match_minimo" IS NULL OR "match_minimo" BETWEEN 0 AND 100);

ALTER TABLE "curso_habilidades"
ADD CONSTRAINT "curso_habilidades_peso_check"
CHECK ("peso" > 0);

ALTER TABLE "leccion_habilidades"
ADD CONSTRAINT "leccion_habilidades_peso_check"
CHECK ("peso" > 0);
