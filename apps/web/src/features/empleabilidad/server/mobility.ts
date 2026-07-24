import type {
  MobilityCategory,
  MobilityInsight,
  VacanteItem,
} from '../types';

export interface MobilityClusterReference {
  cluster: string;
  municipio: string | null;
}

export interface MobilityDistanceRecord {
  cluster_origem: string;
  cluster_destino: string;
  dist_media_km: number;
}

export interface MobilityDataset {
  originCluster: string | null;
  clusters: ReadonlyMap<
    string,
    { cluster: string; municipality: string | null }
  >;
  distances: ReadonlyMap<string, number>;
}

interface ResolveMobilityParams {
  isRemote: boolean;
  destinationCluster: string | null;
  dataset: MobilityDataset;
}

const MOBILITY_PRIORITY: Record<MobilityCategory, number> = {
  remote: 0,
  compatible: 1,
  moderate: 2,
  distant: 3,
  unavailable: 4,
};

export function normalizeClusterName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleUpperCase();
}

function distanceKey(origin: string, destination: string) {
  return `${normalizeClusterName(origin)}\u0000${normalizeClusterName(destination)}`;
}

export function createMobilityDataset(params: {
  originCluster: string | null;
  clusterReferences: readonly MobilityClusterReference[];
  distanceRecords: readonly MobilityDistanceRecord[];
}): MobilityDataset {
  const clusters = new Map<
    string,
    { cluster: string; municipality: string | null }
  >();
  const distances = new Map<string, number>();

  for (const reference of params.clusterReferences) {
    const key = normalizeClusterName(reference.cluster);

    if (!clusters.has(key)) {
      clusters.set(key, {
        cluster: reference.cluster,
        municipality: reference.municipio,
      });
    }
  }

  for (const record of params.distanceRecords) {
    if (!Number.isFinite(record.dist_media_km) || record.dist_media_km < 0) {
      continue;
    }

    distances.set(
      distanceKey(record.cluster_origem, record.cluster_destino),
      record.dist_media_km,
    );
  }

  return {
    originCluster: params.originCluster,
    clusters,
    distances,
  };
}

export function createPendingMobility(params: {
  isRemote: boolean;
  destinationCluster?: string | null;
}): MobilityInsight {
  return {
    category: params.isRemote ? 'remote' : 'unavailable',
    distanceKm: null,
    originCluster: null,
    destinationCluster: params.destinationCluster?.trim() || null,
    destinationMunicipality: null,
    source: params.isRemote ? 'modality' : 'unavailable',
  };
}

function categoryForDistance(distanceKm: number): MobilityCategory {
  if (distanceKm <= 5) return 'compatible';
  if (distanceKm <= 15) return 'moderate';
  return 'distant';
}

export function resolveMobilityInsight({
  isRemote,
  destinationCluster,
  dataset,
}: ResolveMobilityParams): MobilityInsight {
  if (isRemote) {
    return {
      category: 'remote',
      distanceKm: null,
      originCluster: dataset.originCluster,
      destinationCluster: null,
      destinationMunicipality: null,
      source: 'modality',
    };
  }

  const originCluster = dataset.originCluster?.trim() || null;
  const requestedDestination = destinationCluster?.trim() || null;

  if (!originCluster || !requestedDestination) {
    return createPendingMobility({
      isRemote: false,
      destinationCluster: requestedDestination,
    });
  }

  const origin = dataset.clusters.get(normalizeClusterName(originCluster));
  const destination = dataset.clusters.get(
    normalizeClusterName(requestedDestination),
  );

  if (!origin || !destination) {
    return {
      ...createPendingMobility({
        isRemote: false,
        destinationCluster: requestedDestination,
      }),
      originCluster,
    };
  }

  const sameCluster =
    normalizeClusterName(origin.cluster) ===
    normalizeClusterName(destination.cluster);
  const directDistance = dataset.distances.get(
    distanceKey(origin.cluster, destination.cluster),
  );
  const reverseDistance = dataset.distances.get(
    distanceKey(destination.cluster, origin.cluster),
  );
  const distanceKm = sameCluster ? 0 : (directDistance ?? reverseDistance);

  if (distanceKm === undefined) {
    return {
      category: 'unavailable',
      distanceKm: null,
      originCluster: origin.cluster,
      destinationCluster: destination.cluster,
      destinationMunicipality: destination.municipality,
      source: 'unavailable',
    };
  }

  return {
    category: categoryForDistance(distanceKm),
    distanceKm,
    originCluster: origin.cluster,
    destinationCluster: destination.cluster,
    destinationMunicipality: destination.municipality,
    source: 'florianopolis_dataset',
  };
}

export function mobilityPriority(mobility: MobilityInsight) {
  return MOBILITY_PRIORITY[mobility.category];
}

export function compareRecommendedVacancies(
  first: VacanteItem,
  second: VacanteItem,
) {
  if (first.matchPorcentaje === null && second.matchPorcentaje !== null) {
    return 1;
  }

  if (first.matchPorcentaje !== null && second.matchPorcentaje === null) {
    return -1;
  }

  const matchDifference =
    (second.matchPorcentaje ?? 0) - (first.matchPorcentaje ?? 0);

  if (matchDifference !== 0) return matchDifference;

  const mobilityDifference =
    mobilityPriority(first.movilidad) - mobilityPriority(second.movilidad);

  return (
    mobilityDifference ||
    second.fechaPublicacion.localeCompare(first.fechaPublicacion)
  );
}
