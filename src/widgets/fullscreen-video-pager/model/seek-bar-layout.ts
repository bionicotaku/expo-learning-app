export const seekBarHorizontalInset = 22;
export const seekBarControlBottomOffset = 12;
export const seekBarControlHeight = 28;
export const seekBarLabelWidth = 56;
export const seekBarLabelGap = 0;
export const seekBarRailHeight = 3;
export const seekBarThumbDiameter = 10;
export const seekBarActiveThumbDiameter = 13;
export const seekBarDragActivationDistance = 3;
export const seekBarTapMaxDistance = 12;
export const seekBarTapMaxDurationMs = 220;

export function resolveSeekBarControlLaneFrame({
  bottomInset,
  width,
}: {
  bottomInset: number;
  width: number;
}) {
  const left = seekBarHorizontalInset;
  const right = seekBarHorizontalInset;
  const laneWidth = Math.max(0, width - left - right);
  const bottom = bottomInset + seekBarControlBottomOffset;
  const height = seekBarControlHeight;

  return {
    bottom,
    height,
    left,
    right,
    top: bottom + height,
    width: laneWidth,
  };
}

export function resolveSeekBarRailMetrics(width: number) {
  const railWidth = Math.max(
    0,
    width -
      seekBarHorizontalInset * 2 -
      seekBarLabelWidth * 2 -
      seekBarLabelGap * 2
  );

  return {
    leftInset: seekBarHorizontalInset,
    railWidth,
    rightInset: seekBarHorizontalInset,
  };
}
