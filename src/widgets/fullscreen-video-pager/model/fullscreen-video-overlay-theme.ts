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

export const fullscreenVideoOverlayDescriptionMeasurementTypography =
  createFullscreenVideoOverlayDescriptionMeasurementTypography(
    fullscreenVideoOverlayTheme.descriptionText
  );

export function createFullscreenVideoOverlayDescriptionMeasurementTypography(
  descriptionText: FullscreenVideoOverlayTextMetrics
): FullscreenVideoOverlayDescriptionMeasurementTypography {
  return {
    descriptionFontSize: descriptionText.fontSize,
    descriptionLineHeight: descriptionText.lineHeight,
  };
}
