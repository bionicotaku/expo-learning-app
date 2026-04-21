import { describe, expect, it } from 'vitest';

import {
  createExpandableOverlayDescriptionMeasurementCache,
  createExpandableOverlayDescriptionMeasurementKey,
  getExpandableOverlayDescriptionState,
  normalizeExpandableOverlayDescriptionMeasuredLineText,
  readExpandableOverlayDescriptionMeasurementCache,
  reduceExpandableOverlayDescriptionUiState,
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
      fontScale: 1,
      maxTextWidth: 248,
      typographyKey: '13.5:16:v1',
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

  it('includes typography and font-scale stability in the measurement key', () => {
    expect(
      createExpandableOverlayDescriptionMeasurementKey({
        description: 'same text',
        fontScale: 1,
        maxTextWidth: 248,
        typographyKey: '13.5:16:v1',
      })
    ).not.toBe(
      createExpandableOverlayDescriptionMeasurementKey({
        description: 'same text',
        fontScale: 1.2,
        maxTextWidth: 248,
        typographyKey: '13.5:16:v1',
      })
    );

    expect(
      createExpandableOverlayDescriptionMeasurementKey({
        description: 'same text',
        fontScale: 1,
        maxTextWidth: 248,
        typographyKey: '13.5:16:v1',
      })
    ).not.toBe(
      createExpandableOverlayDescriptionMeasurementKey({
        description: 'same text',
        fontScale: 1,
        maxTextWidth: 248,
        typographyKey: '13.5:16:v2',
      })
    );
  });

  it('bounds measurement cache size and keeps the newest entries', () => {
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

  it('returns a complete layout contract so parents do not assemble conditional offsets themselves', () => {
    expect(
      resolveExpandableOverlayDescriptionLayoutContract({
        actionGap: 4,
        actionLaneHeight: 16,
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
        actionLaneHeight: 16,
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
        actionLaneHeight: 16,
        isExpandable: true,
        isExpanded: true,
      })
    ).toEqual({
      actionPlacement: 'footer',
      contentBottomLift: 20,
    });
  });

  it('resets expanded state across remount-like runtime transitions', () => {
    const expandedState = reduceExpandableOverlayDescriptionUiState(
      { isExpanded: false },
      { type: 'expand-pressed' }
    );

    expect(expandedState).toEqual({ isExpanded: true });
    expect(
      reduceExpandableOverlayDescriptionUiState(expandedState, {
        type: 'description-changed',
      })
    ).toEqual({ isExpanded: false });
    expect(
      reduceExpandableOverlayDescriptionUiState(expandedState, {
        type: 'became-inactive',
      })
    ).toEqual({ isExpanded: false });
    expect(
      reduceExpandableOverlayDescriptionUiState(expandedState, {
        type: 'lost-expandability',
      })
    ).toEqual({ isExpanded: false });
  });
});
