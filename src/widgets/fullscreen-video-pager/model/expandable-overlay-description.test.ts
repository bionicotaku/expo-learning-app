import { describe, expect, it } from 'vitest';

import {
  createExpandableOverlayDescriptionContentKey,
  createExpandableOverlayDescriptionMeasurementCache,
  createExpandableOverlayDescriptionMeasurementKey,
  createExpandableOverlayDescriptionMeasurementTypographyKey,
  fullscreenVideoOverlayTypography,
  getExpandableOverlayDescriptionState,
  normalizeExpandableOverlayDescriptionMeasuredLineText,
  readExpandableOverlayDescriptionMeasurementCache,
  reduceExpandableOverlayDescriptionUiState,
  resolveExpandableOverlayDescriptionExpandedState,
  resolveExpandableOverlayDescriptionLayoutContract,
  resolveExpandableOverlayDescriptionMeasurementSnapshot,
  resolveExpandableOverlayDescriptionRenderMode,
  resolveExpandableOverlayDescriptionHeights,
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
      resolveExpandableOverlayDescriptionRenderMode({
        isExpanded: false,
        isMeasurementReady: false,
        lineCount: 0,
      })
    ).toBe('measuring');

    expect(
      resolveExpandableOverlayDescriptionRenderMode({
        isExpanded: false,
        isMeasurementReady: true,
        lineCount: 3,
      })
    ).toBe('collapsed');

    expect(
      resolveExpandableOverlayDescriptionRenderMode({
        isExpanded: true,
        isMeasurementReady: true,
        lineCount: 3,
      })
    ).toBe('expanded');

    expect(
      resolveExpandableOverlayDescriptionRenderMode({
        isExpanded: false,
        isMeasurementReady: true,
        lineCount: 2,
      })
    ).toBe('static');
  });

  it('treats stale measurements as not ready for the current description key', () => {
    const currentKey = createExpandableOverlayDescriptionMeasurementKey({
      description: 'current description',
      maxTextWidth: 248,
      typographyKey: createExpandableOverlayDescriptionMeasurementTypographyKey(
        fullscreenVideoOverlayTypography
      ),
    });

    expect(
      resolveExpandableOverlayDescriptionMeasurementSnapshot({
        currentMeasurementKey: currentKey,
        measurement: {
          key: 'stale-key',
          lines: [{ text: 'line 1' }, { text: 'line 2' }],
        },
      })
    ).toEqual({
      isMeasurementReady: false,
      lines: [],
    });

    expect(
      resolveExpandableOverlayDescriptionMeasurementSnapshot({
        currentMeasurementKey: currentKey,
        measurement: {
          key: currentKey,
          lines: [{ text: 'line 1' }, { text: 'line 2' }, { text: 'line 3' }],
        },
      })
    ).toEqual({
      isMeasurementReady: true,
      lines: [{ text: 'line 1' }, { text: 'line 2' }, { text: 'line 3' }],
    });
  });

  it('uses a fixed two-line collapsed viewport and taller expanded viewport', () => {
    expect(resolveExpandableOverlayDescriptionHeights(5)).toEqual({
      collapsedHeight: 32,
      expandedHeight: 80,
    });
  });

  it('keeps collapsed and expanded heights equal when the text is not expandable', () => {
    expect(resolveExpandableOverlayDescriptionHeights(2)).toEqual({
      collapsedHeight: 32,
      expandedHeight: 32,
    });
  });

  it('uses the fixed overlay typography contract inside the measurement key', () => {
    const defaultTypographyKey = createExpandableOverlayDescriptionMeasurementTypographyKey(
      fullscreenVideoOverlayTypography
    );
    const updatedTypographyKey = createExpandableOverlayDescriptionMeasurementTypographyKey({
      ...fullscreenVideoOverlayTypography,
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
        typographyKey: updatedTypographyKey,
      })
    );
  });

  it('touches cached measurements on read so the oldest untouched entry is evicted first', () => {
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
    expect(readExpandableOverlayDescriptionMeasurementCache(cache, 'key-1')).toEqual([
      { text: 'first' },
    ]);
    writeExpandableOverlayDescriptionMeasurementCache({
      cache,
      lines: [{ text: 'third' }],
      measurementKey: 'key-3',
    });

    expect(readExpandableOverlayDescriptionMeasurementCache(cache, 'key-1')).toEqual([
      { text: 'first' },
    ]);
    expect(readExpandableOverlayDescriptionMeasurementCache(cache, 'key-2')).toBeUndefined();
    expect(readExpandableOverlayDescriptionMeasurementCache(cache, 'key-3')).toEqual([
      { text: 'third' },
    ]);
  });

  it('keeps collapsed and expanded layout derived from the current content identity', () => {
    const measurementKey = createExpandableOverlayDescriptionMeasurementKey({
      description: 'same text',
      maxTextWidth: 248,
      typographyKey: createExpandableOverlayDescriptionMeasurementTypographyKey(
        fullscreenVideoOverlayTypography
      ),
    });
    const expandedContentKey = createExpandableOverlayDescriptionContentKey({
      measurementKey,
      stateOwnerKey: 'video-a',
    });

    expect(
      resolveExpandableOverlayDescriptionExpandedState({
        contentKey: expandedContentKey,
        expandedContentKey,
        isActive: true,
        isExpandable: true,
      })
    ).toBe(true);
    expect(
      resolveExpandableOverlayDescriptionExpandedState({
        contentKey: createExpandableOverlayDescriptionContentKey({
          measurementKey,
          stateOwnerKey: 'video-b',
        }),
        expandedContentKey,
        isActive: true,
        isExpandable: true,
      })
    ).toBe(false);
    expect(
      resolveExpandableOverlayDescriptionExpandedState({
        contentKey: expandedContentKey,
        expandedContentKey,
        isActive: false,
        isExpandable: true,
      })
    ).toBe(false);
    expect(
      resolveExpandableOverlayDescriptionExpandedState({
        contentKey: expandedContentKey,
        expandedContentKey,
        isActive: true,
        isExpandable: false,
      })
    ).toBe(false);
  });

  it('stores the content key on expand press and clears it on collapse-like events', () => {
    const expandedState = reduceExpandableOverlayDescriptionUiState(
      { expandedContentKey: null },
      { type: 'expand-pressed', contentKey: 'video-a:key-1' }
    );

    expect(expandedState).toEqual({ expandedContentKey: 'video-a:key-1' });
    expect(
      reduceExpandableOverlayDescriptionUiState(expandedState, {
        type: 'collapse-pressed',
      })
    ).toEqual({ expandedContentKey: null });
    expect(
      reduceExpandableOverlayDescriptionUiState(expandedState, {
        type: 'content-invalidated',
      })
    ).toEqual({ expandedContentKey: null });
  });

  it('uses the fixed visual-size overlay typography for description heights', () => {
    expect(resolveExpandableOverlayDescriptionHeights(5)).toEqual({
      collapsedHeight:
        fullscreenVideoOverlayTypography.descriptionLineHeight * 2,
      expandedHeight:
        fullscreenVideoOverlayTypography.descriptionLineHeight * 5,
    });
  });

  it('returns a complete layout contract so parents do not assemble conditional offsets themselves', () => {
    expect(
      resolveExpandableOverlayDescriptionLayoutContract({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        isExpandable: false,
        isExpanded: false,
      })
    ).toEqual({
      actionPlacement: 'hidden',
      contentBottomLift: 0,
    });

    expect(
      resolveExpandableOverlayDescriptionLayoutContract({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        isExpandable: true,
        isExpanded: false,
      })
    ).toEqual({
      actionPlacement: 'inline',
      contentBottomLift: 0,
    });

    expect(
      resolveExpandableOverlayDescriptionLayoutContract({
        actionGap: 4,
        actionLaneHeight: fullscreenVideoOverlayTypography.actionLaneHeight,
        isExpandable: true,
        isExpanded: true,
      })
    ).toEqual({
      actionPlacement: 'footer',
      contentBottomLift:
        fullscreenVideoOverlayTypography.actionLaneHeight + 4,
    });
  });

  it('keeps the newest untouched entries when the cache overflows', () => {
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

    expect(readExpandableOverlayDescriptionMeasurementCache(cache, 'key-1')).toBeUndefined();
    expect(readExpandableOverlayDescriptionMeasurementCache(cache, 'key-2')).toEqual([
      { text: 'second' },
    ]);
    expect(readExpandableOverlayDescriptionMeasurementCache(cache, 'key-3')).toEqual([
      { text: 'third' },
    ]);
  });
});
