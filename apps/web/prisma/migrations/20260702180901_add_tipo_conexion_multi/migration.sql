/*
  Warnings:

  - You are about to drop the column `tipo_conexion` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NivelIdiomaEnum" ADD VALUE 'C2 (Profesional)';
ALTER TYPE "NivelIdiomaEnum" ADD VALUE 'Nativo';

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "tipo_conexion";

-- CreateTable
CREATE TABLE "staging_assinantes" (
    "assinante_hash" TEXT,
    "home_cluster" TEXT,
    "home_municipio" TEXT,
    "income_cluster" TEXT,
    "age_group" TEXT,
    "mobility_pattern" TEXT,
    "flag_flagship" TEXT
);

-- CreateTable
CREATE TABLE "usuario_tipo_conexion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "tipo_conexion" "TipoConexionEnum" NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_tipo_conexion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usuario_tipo_conexion_usuario_id_idx" ON "usuario_tipo_conexion"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_tipo_conexion_usuario_id_tipo_conexion_key" ON "usuario_tipo_conexion"("usuario_id", "tipo_conexion");

-- AddForeignKey
ALTER TABLE "usuario_tipo_conexion" ADD CONSTRAINT "usuario_tipo_conexion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
