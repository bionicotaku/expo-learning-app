function clampRatio(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

export function resolveSeekBarTargetFromRailX(
  railX: number,
  railWidth: number,
  durationSeconds: number
) {
  const ratio = railWidth > 0 ? clampRatio(railX / railWidth) : 0;

  return {
    ratio,
    targetSeconds: durationSeconds * ratio,
  };
}
