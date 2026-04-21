import { describe, expect, it } from 'vitest';

import {
  createExpandableOverlayDescriptionMeasurementCache,
  createExpandableOverlayDescriptionMeasurementKey,
  createExpandableOverlayDescriptionMeasurementTypographyKey,
  normalizeExpandableOverlayDescriptionMeasuredLineText,
  peekExpandableOverlayDescriptionMeasurementCache,
  resolveExpandableOverlayDescriptionViewState,
  writeExpandableOverlayDescriptionMeasurementCache,
} from './expandable-overlay-description';
import {
  createFullscreenVideoOverlayDescriptionMeasurementTypography,
  fullscreenVideoOverlayTheme,
} from './fullscreen-video-overlay-theme';

describe('expandable overlay description model', () => {
  const descriptionLineHeight =
    fullscreenVideoOverlayTheme.descriptionText.lineHeight;

  it('normalizes measured line text by trimming trailing whitespace', () => {
    expect(
      normalizeExpandableOverlayDescriptionMeasuredLineText(
        'soften, dodge, or redirect a   '
      )
    ).toBe('soften, dodge, or redirect a');
  });

  it('uses a dedicated measuring phase before the description can render collapsed or expanded content', () => {
    expect(
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken: null,
        descriptionLineHeight,
        expandedExpansionKey: null,
        isMeasurementReady: false,
        lineCount: 0,
        measurementKey: 'key-a',
      }).mode
    ).toBe('measuring');

    expect(
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken: 1,
        descriptionLineHeight,
        expandedExpansionKey: null,
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey: 'key-a',
      }).mode
    ).toBe('collapsed');

    expect(
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken: 1,
        descriptionLineHeight,
        expandedExpansionKey: '1:key-a',
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey: 'key-a',
      }).mode
    ).toBe('expanded');

    expect(
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken: 1,
        descriptionLineHeight,
        expandedExpansionKey: null,
        isMeasurementReady: true,
        lineCount: 2,
        measurementKey: 'key-a',
      }).mode
    ).toBe('static');
  });

  it('uses only description measurement typography inside the measurement key', () => {
    const defaultTypographyKey =
      createExpandableOverlayDescriptionMeasurementTypographyKey(
        createFullscreenVideoOverlayDescriptionMeasurementTypography(
          fullscreenVideoOverlayTheme
        )
      );
    const updatedVisualTypography =
      createFullscreenVideoOverlayDescriptionMeasurementTypography({
        ...fullscreenVideoOverlayTheme,
        descriptionActionGap: 99,
        descriptionActionLaneHeight: 44,
        descriptionActionReserveWidth: 48,
        descriptionActionText: {
          fontSize: 77,
          lineHeight: 77,
        },
        titleText: {
          fontSize: 99,
          lineHeight: 99,
        },
      });
    const updatedTypographyKey = createExpandableOverlayDescriptionMeasurementTypographyKey(
      updatedVisualTypography
    );
    const updatedDescriptionTypographyKey =
      createExpandableOverlayDescriptionMeasurementTypographyKey({
        ...createFullscreenVideoOverlayDescriptionMeasurementTypography(
          fullscreenVideoOverlayTheme
        ),
        descriptionFontSize: 18,
        descriptionLineHeight: 18,
      });

    expect(
      createExpandableOverlayDescriptionMeasurementKey({
        description: 'same text',
        maxTextWidth: 248,
        typographyKey: defaultTypographyKey,
      })
    ).toBe(
      createExpandableOverlayDescriptionMeasurementKey({
        description: 'same text',
        maxTextWidth: 248,
        typographyKey: defaultTypographyKey,
      })
    );

    expect(
      createExpandableOverlayDescriptionMeasurementKey({
        description: 'same text',
        maxTextWidth: 248,
        typographyKey: defaultTypographyKey,
      })
    ).not.toBe(
      createExpandableOverlayDescriptionMeasurementKey({
        description: 'same text',
        maxTextWidth: 248,
        typographyKey: updatedDescriptionTypographyKey,
      })
    );

    expect(updatedTypographyKey).toBe(defaultTypographyKey);
  });

  it('keeps measurement cache reads pure and only evicts by insertion order on write', () => {
    const cache = createExpandableOverlayDescriptionMeasurementCache(2);

    writeExpandableOverlayDescriptionMeasurementCache({
      cache,
      lines: [{ text: 'first' }],
      measurementKey: 'key-1',
    });
    writeExpandableOverlayDescriptionMeasurementCache({
      cache,
      lines: [{ text: 'second' }],
      measurementKey: 'key-2',
    });

    expect(peekExpandableOverlayDescriptionMeasurementCache(cache, 'key-1')).toEqual([
      { text: 'first' },
    ]);
    expect([...cache.entries.keys()]).toEqual(['key-1', 'key-2']);

    writeExpandableOverlayDescriptionMeasurementCache({
      cache,
      lines: [{ text: 'third' }],
      measurementKey: 'key-3',
    });

    expect(peekExpandableOverlayDescriptionMeasurementCache(cache, 'key-1')).toBeUndefined();
    expect(peekExpandableOverlayDescriptionMeasurementCache(cache, 'key-2')).toEqual([
      { text: 'second' },
    ]);
    expect(peekExpandableOverlayDescriptionMeasurementCache(cache, 'key-3')).toEqual([
      { text: 'third' },
    ]);
  });

  it('derives expansion from the active visit token instead of reviving stale content identity', () => {
    const measurementKey = createExpandableOverlayDescriptionMeasurementKey({
      description: 'same text',
      maxTextWidth: 248,
      typographyKey: createExpandableOverlayDescriptionMeasurementTypographyKey(
        createFullscreenVideoOverlayDescriptionMeasurementTypography(
          fullscreenVideoOverlayTheme
        )
      ),
    });
    const expandedExpansionKey = `1:${measurementKey}`;

    expect(
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken: 1,
        descriptionLineHeight,
        expandedExpansionKey,
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey,
      }).isExpanded
    ).toBe(true);

    expect(
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken: 2,
        descriptionLineHeight,
        expandedExpansionKey,
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey,
      })
    ).toMatchObject({
      actionPlacement: 'inline',
      isExpanded: false,
      mode: 'collapsed',
    });
  });

  it('returns action placement without leaking parent geometry into the description model', () => {
    expect(
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken: null,
        descriptionLineHeight,
        expandedExpansionKey: null,
        isMeasurementReady: true,
        lineCount: 2,
        measurementKey: 'key-a',
      })
    ).toEqual({
      actionPlacement: 'hidden',
      collapsedViewportHeight:
        fullscreenVideoOverlayTheme.descriptionText.lineHeight * 2,
      descriptionContainerHeight:
        fullscreenVideoOverlayTheme.descriptionText.lineHeight * 2,
      isExpandable: false,
      isExpanded: false,
      isMeasurementReady: true,
      mode: 'static',
    });

    expect(
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken: 1,
        descriptionLineHeight,
        expandedExpansionKey: null,
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey: 'key-a',
      }).actionPlacement
    ).toBe('inline');

    expect(
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken: 1,
        descriptionLineHeight,
        expandedExpansionKey: '1:key-a',
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey: 'key-a',
      }).actionPlacement
    ).toBe('footer');

    expect(
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken: 1,
        descriptionLineHeight,
        expandedExpansionKey: '1:key-a',
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey: 'key-a',
      })
    ).not.toHaveProperty('currentExpansionKey');
  });

  it('keeps the newest inserted entries when the cache overflows', () => {
    const cache = createExpandableOverlayDescriptionMeasurementCache(2);

    writeExpandableOverlayDescriptionMeasurementCache({
      cache,
      lines: [{ text: 'first' }],
      measurementKey: 'key-1',
    });
    writeExpandableOverlayDescriptionMeasurementCache({
      cache,
      lines: [{ text: 'second' }],
      measurementKey: 'key-2',
    });
    writeExpandableOverlayDescriptionMeasurementCache({
      cache,
      lines: [{ text: 'third' }],
      measurementKey: 'key-3',
    });

    expect(peekExpandableOverlayDescriptionMeasurementCache(cache, 'key-1')).toBeUndefined();
    expect(peekExpandableOverlayDescriptionMeasurementCache(cache, 'key-2')).toEqual([
      { text: 'second' },
    ]);
    expect(peekExpandableOverlayDescriptionMeasurementCache(cache, 'key-3')).toEqual([
      { text: 'third' },
    ]);
  });
});
