export function formatEngagementCount(count: number): string {
  const normalizedCount = Math.max(0, Math.floor(count));

  if (normalizedCount < 10000) {
    return `${normalizedCount}`;
  }

  const tenThousandUnits = normalizedCount / 10000;
  return `${tenThousandUnits.toFixed(1).replace(/\.0$/, '')}万`;
}

type ResolveEffectiveEngagementCountArgs = {
  baseCount: number;
  baseIsActive: boolean;
  effectiveIsActive: boolean;
};

export function resolveEffectiveEngagementCount({
  baseCount,
  baseIsActive,
  effectiveIsActive,
}: ResolveEffectiveEngagementCountArgs) {
  const delta = Number(effectiveIsActive) - Number(baseIsActive);
  return Math.max(0, baseCount + delta);
}
