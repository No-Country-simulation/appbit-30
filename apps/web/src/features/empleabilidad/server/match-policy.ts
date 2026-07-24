export const MIN_RECOMMENDED_MATCH_PERCENTAGE = 50;

export function meetsRecommendedMatch(matchPercentage: number | null) {
  return (
    matchPercentage !== null &&
    matchPercentage >= MIN_RECOMMENDED_MATCH_PERCENTAGE
  );
}

export function isB2BVacancyId(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('b2b:');
}
