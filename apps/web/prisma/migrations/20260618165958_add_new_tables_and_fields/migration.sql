-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "cluster" VARCHAR(100);

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "home_cluster" VARCHAR(100);

-- CreateTable
CREATE TABLE "antenas" (
    "ecgi" VARCHAR(50) NOT NULL,
    "lat" DECIMAL(10,7) NOT NULL,
    "lon" DECIMAL(10,7) NOT NULL,
    "cluster" VARCHAR(100) NOT NULL,
    "municipio" VARCHAR(100),
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "antenas_pkey" PRIMARY KEY ("ecgi")
);

-- CreateTable
CREATE TABLE "distancias_cluster" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cluster_origem" VARCHAR(100) NOT NULL,
    "cluster_destino" VARCHAR(100) NOT NULL,
    "dist_media_km" DECIMAL(10,4) NOT NULL,
    "dist_p25_km" DECIMAL(10,4),
    "dist_p75_km" DECIMAL(10,4),
    "periodo_predominante" VARCHAR(20),
    "n_amostras" INTEGER,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distancias_cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "origen_destino" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cluster_origem" VARCHAR(100) NOT NULL,
    "cluster_destino" VARCHAR(100) NOT NULL,
    "periodo_predominante" VARCHAR(20),
    "n_viagens_estimado" INTEGER,
    "dist_media_km" DECIMAL(10,4),
    "mesmo_cluster" SMALLINT,

    CONSTRAINT "origen_destino_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_antenas_cluster" ON "antenas"("cluster");

-- CreateIndex
CREATE INDEX "idx_antenas_coords" ON "antenas"("lat", "lon");

-- CreateIndex
CREATE INDEX "idx_dist_cluster_origem" ON "distancias_cluster"("cluster_origem");

-- CreateIndex
CREATE INDEX "idx_dist_cluster_destino" ON "distancias_cluster"("cluster_destino");

-- CreateIndex
CREATE UNIQUE INDEX "distancias_cluster_cluster_origem_cluster_destino_key" ON "distancias_cluster"("cluster_origem", "cluster_destino");

-- CreateIndex
CREATE INDEX "idx_od_origem" ON "origen_destino"("cluster_origem");

-- CreateIndex
CREATE INDEX "idx_od_destino" ON "origen_destino"("cluster_destino");

-- CreateIndex
CREATE UNIQUE INDEX "origen_destino_cluster_origem_cluster_destino_key" ON "origen_destino"("cluster_origem", "cluster_destino");

-- CreateIndex
CREATE INDEX "idx_chk_nota" ON "check_ins"("nota_diaria");

-- CreateIndex
CREATE INDEX "idx_empresas_cluster" ON "empresas"("cluster");

-- CreateIndex
CREATE INDEX "idx_usuarios_home_cluster" ON "usuarios"("home_cluster");

-- CreateIndex
CREATE INDEX "idx_usuarios_coords" ON "usuarios"("lat", "lng");

-- AddForeignKey
ALTER TABLE "calidad_red_zona" ADD CONSTRAINT "calidad_red_zona_ecgi_fkey" FOREIGN KEY ("ecgi") REFERENCES "antenas"("ecgi") ON DELETE RESTRICT ON UPDATE CASCADE;
