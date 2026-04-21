export type FullscreenVideoOverlayTextMetrics = {
  fontSize: number;
  lineHeight: number;
};

export type FullscreenVideoOverlayDescriptionMeasurementTypography = {
  descriptionFontSize: number;
  descriptionLineHeight: number;
};

export type FullscreenVideoOverlayTheme = {
  descriptionActionGap: number;
  descriptionActionLaneHeight: number;
  descriptionActionReserveWidth: number;
  descriptionActionText: FullscreenVideoOverlayTextMetrics;
  descriptionText: FullscreenVideoOverlayTextMetrics;
  titleText: FullscreenVideoOverlayTextMetrics;
};

export const fullscreenVideoOverlayTheme: Readonly<FullscreenVideoOverlayTheme> = {
  descriptionActionGap: 4,
  descriptionActionLaneHeight: 16,
  descriptionActionReserveWidth: 34,
  descriptionActionText: {
    fontSize: 13.5,
    lineHeight: 16,
  },
  descriptionText: {
    fontSize: 13.5,
    lineHeight: 16,
  },
  titleText: {
    fontSize: 15,
    lineHeight: 18,
  },
};

export function createFullscreenVideoOverlayDescriptionMeasurementTypography(
  theme: FullscreenVideoOverlayTheme
): FullscreenVideoOverlayDescriptionMeasurementTypography {
  return {
    descriptionFontSize: theme.descriptionText.fontSize,
    descriptionLineHeight: theme.descriptionText.lineHeight,
  };
}
