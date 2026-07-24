import assert from 'node:assert/strict';
import test from 'node:test';
import type { VacanteItem } from '../types';
import {
  compareRecommendedVacancies,
  createMobilityDataset,
  resolveMobilityInsight,
} from './mobility';

const clusterReferences = [
  { cluster: 'CBD_BEIRAMAR', municipio: 'Florianópolis' },
  { cluster: 'CENTRO_HISTORICO', municipio: 'Florianópolis' },
  { cluster: 'TRINDADE', municipio: 'Florianópolis' },
  { cluster: 'INGLESES', municipio: 'Florianópolis' },
] as const;

function dataset(
  distanceRecords: Array<{
    cluster_origem: string;
    cluster_destino: string;
    dist_media_km: number;
  }> = [],
) {
  return createMobilityDataset({
    originCluster: 'CBD_BEIRAMAR',
    clusterReferences,
    distanceRecords,
  });
}

test('recommends remote opportunities without requiring a distance', () => {
  const mobility = resolveMobilityInsight({
    isRemote: true,
    destinationCluster: null,
    dataset: dataset(),
  });

  assert.equal(mobility.category, 'remote');
  assert.equal(mobility.source, 'modality');
  assert.equal(mobility.distanceKm, null);
});

test('uses zero kilometres when origin and destination are the same', () => {
  const mobility = resolveMobilityInsight({
    isRemote: false,
    destinationCluster: 'CBD_BEIRAMAR',
    dataset: dataset(),
  });

  assert.equal(mobility.category, 'compatible');
  assert.equal(mobility.distanceKm, 0);
  assert.equal(mobility.source, 'florianopolis_dataset');
});

test('classifies the real CBD to historic centre demo distance as compatible', () => {
  const mobility = resolveMobilityInsight({
    isRemote: false,
    destinationCluster: 'CENTRO_HISTORICO',
    dataset: dataset([
      {
        cluster_origem: 'CBD_BEIRAMAR',
        cluster_destino: 'CENTRO_HISTORICO',
        dist_media_km: 0.179,
      },
    ]),
  });

  assert.equal(mobility.category, 'compatible');
  assert.equal(mobility.distanceKm, 0.179);
  assert.equal(mobility.destinationMunicipality, 'Florianópolis');
});

test('uses direct and reverse distances and preserves threshold boundaries', () => {
  const direct = dataset([
    {
      cluster_origem: 'CBD_BEIRAMAR',
      cluster_destino: 'CENTRO_HISTORICO',
      dist_media_km: 5,
    },
    {
      cluster_origem: 'TRINDADE',
      cluster_destino: 'CBD_BEIRAMAR',
      dist_media_km: 15,
    },
    {
      cluster_origem: 'CBD_BEIRAMAR',
      cluster_destino: 'INGLESES',
      dist_media_km: 15.01,
    },
  ]);

  assert.equal(
    resolveMobilityInsight({
      isRemote: false,
      destinationCluster: 'CENTRO_HISTORICO',
      dataset: direct,
    }).category,
    'compatible',
  );
  assert.equal(
    resolveMobilityInsight({
      isRemote: false,
      destinationCluster: 'TRINDADE',
      dataset: direct,
    }).category,
    'moderate',
  );
  assert.equal(
    resolveMobilityInsight({
      isRemote: false,
      destinationCluster: 'INGLESES',
      dataset: direct,
    }).category,
    'distant',
  );
});

test('does not infer mobility for an unknown or unmeasured cluster', () => {
  const mobility = resolveMobilityInsight({
    isRemote: false,
    destinationCluster: 'CLUSTER_INEXISTENTE',
    dataset: dataset(),
  });

  assert.equal(mobility.category, 'unavailable');
  assert.equal(mobility.source, 'unavailable');
});

function vacancy(params: {
  id: string;
  match: number;
  category: VacanteItem['movilidad']['category'];
}): VacanteItem {
  return {
    id: params.id,
    source: 'b2b',
    titulo: params.id,
    empresa: 'Empresa',
    empresaDescripcion: null,
    logoUrl: null,
    area: 'Data',
    nivel: 'Junior',
    modalidad: 'Remoto',
    modalidadDetallada: null,
    ubicacion: 'Florianópolis',
    distancia: null,
    movilidad: {
      category: params.category,
      distanceKm: null,
      originCluster: null,
      destinationCluster: null,
      destinationMunicipality: null,
      source:
        params.category === 'remote'
          ? 'modality'
          : params.category === 'unavailable'
            ? 'unavailable'
            : 'florianopolis_dataset',
    },
    matchPorcentaje: params.match,
    fechaPublicacion: '',
    descripcion: null,
    educacionRequerida: [],
    experienciaSolicitada: [],
    idioma: [],
    jornada: [],
    skills: [],
  };
}

test('keeps skills as the primary order and mobility as the tie-breaker', () => {
  const higherMatchFar = vacancy({
    id: 'higher',
    match: 80,
    category: 'distant',
  });
  const lowerMatchRemote = vacancy({
    id: 'lower',
    match: 70,
    category: 'remote',
  });
  const equalMatchRemote = vacancy({
    id: 'remote',
    match: 80,
    category: 'remote',
  });

  assert.deepEqual(
    [lowerMatchRemote, higherMatchFar].sort(compareRecommendedVacancies).map(
      (item) => item.id,
    ),
    ['higher', 'lower'],
  );
  assert.deepEqual(
    [higherMatchFar, equalMatchRemote].sort(compareRecommendedVacancies).map(
      (item) => item.id,
    ),
    ['remote', 'higher'],
  );
});
