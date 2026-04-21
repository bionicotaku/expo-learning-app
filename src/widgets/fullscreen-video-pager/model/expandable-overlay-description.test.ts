import { describe, expect, it } from 'vitest';

import {
  createExpandableOverlayDescriptionMeasurementCache,
  createExpandableOverlayDescriptionMeasurementKey,
  createExpandableOverlayDescriptionMeasurementTypographyKey,
  fullscreenVideoOverlayTypography,
  getExpandableOverlayDescriptionState,
  normalizeExpandableOverlayDescriptionMeasuredLineText,
  peekExpandableOverlayDescriptionMeasurementCache,
  resolveExpandableOverlayDescriptionViewModel,
  writeExpandableOverlayDescriptionMeasurementCache,
} from './expandable-overlay-description';

describe('expandable overlay description model', () => {
  it('treats two natural lines as non-expandable', () => {
    expect(
      getExpandableOverlayDescriptionState([
        { text: 'first line' },
        { text: 'second line' },
      ])
    ).toEqual({
      isExpandable: false,
      visibleLineCount: 2,
    });
  });

  it('treats more than two natural lines as expandable', () => {
    expect(
      getExpandableOverlayDescriptionState([
        { text: 'first line' },
        { text: 'second line' },
        { text: 'third line' },
      ])
    ).toEqual({
      isExpandable: true,
      visibleLineCount: 2,
    });
  });

  it('normalizes measured line text by trimming trailing whitespace', () => {
    expect(
      normalizeExpandableOverlayDescriptionMeasuredLineText(
        'soften, dodge, or redirect a   '
      )
    ).toBe('soften, dodge, or redirect a');
  });

  it('uses a dedicated measuring phase before the description can render collapsed or expanded content', () => {
    expect(
      resolveExpandableOverlayDescriptionViewModel({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        activeVisitToken: null,
        expandedExpansionKey: null,
        isMeasurementReady: false,
        lineCount: 0,
        measurementKey: 'key-a',
      }).mode
    ).toBe('measuring');

    expect(
      resolveExpandableOverlayDescriptionViewModel({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        activeVisitToken: 1,
        expandedExpansionKey: null,
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey: 'key-a',
      }).mode
    ).toBe('collapsed');

    expect(
      resolveExpandableOverlayDescriptionViewModel({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        activeVisitToken: 1,
        expandedExpansionKey: '1:key-a',
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey: 'key-a',
      }).mode
    ).toBe('expanded');

    expect(
      resolveExpandableOverlayDescriptionViewModel({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        activeVisitToken: 1,
        expandedExpansionKey: null,
        isMeasurementReady: true,
        lineCount: 2,
        measurementKey: 'key-a',
      }).mode
    ).toBe('static');
  });

  it('uses only description measurement typography inside the measurement key', () => {
    const defaultTypographyKey = createExpandableOverlayDescriptionMeasurementTypographyKey(
      fullscreenVideoOverlayTypography
    );
    const updatedVisualTypography = {
      ...fullscreenVideoOverlayTypography,
      titleFontSize: 99,
      titleLineHeight: 99,
      actionFontSize: 77,
      actionLineHeight: 77,
      actionLaneHeight: 44,
    };
    const updatedTypographyKey = createExpandableOverlayDescriptionMeasurementTypographyKey(
      updatedVisualTypography
    );
    const updatedDescriptionTypographyKey =
      createExpandableOverlayDescriptionMeasurementTypographyKey({
        ...fullscreenVideoOverlayTypography,
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
        fullscreenVideoOverlayTypography
      ),
    });
    const expandedExpansionKey = `1:${measurementKey}`;

    expect(
      resolveExpandableOverlayDescriptionViewModel({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        activeVisitToken: 1,
        expandedExpansionKey,
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey,
      }).isExpanded
    ).toBe(true);

    expect(
      resolveExpandableOverlayDescriptionViewModel({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        activeVisitToken: 2,
        expandedExpansionKey,
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey,
      })
    ).toMatchObject({
      isExpanded: false,
      layoutContract: {
        actionPlacement: 'inline',
        contentBottomLift: 0,
      },
      mode: 'collapsed',
    });
  });

  it('returns a complete layout contract so parents do not assemble conditional offsets themselves', () => {
    expect(
      resolveExpandableOverlayDescriptionViewModel({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        activeVisitToken: null,
        expandedExpansionKey: null,
        isMeasurementReady: true,
        lineCount: 2,
        measurementKey: 'key-a',
      }).layoutContract
    ).toEqual({
      actionPlacement: 'hidden',
      contentBottomLift: 0,
    });

    expect(
      resolveExpandableOverlayDescriptionViewModel({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        activeVisitToken: 1,
        expandedExpansionKey: null,
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey: 'key-a',
      }).layoutContract
    ).toEqual({
      actionPlacement: 'inline',
      contentBottomLift: 0,
    });

    expect(
      resolveExpandableOverlayDescriptionViewModel({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        activeVisitToken: 1,
        expandedExpansionKey: '1:key-a',
        isMeasurementReady: true,
        lineCount: 3,
        measurementKey: 'key-a',
      }).layoutContract
    ).toEqual({
      actionPlacement: 'footer',
      contentBottomLift:
        fullscreenVideoOverlayTypography.actionLaneHeight + 4,
    });
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
