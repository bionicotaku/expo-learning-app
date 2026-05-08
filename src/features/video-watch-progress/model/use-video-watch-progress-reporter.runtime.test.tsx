import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createInMemoryTelemetryQueue, type TelemetryQueue } from '@/shared/telemetry';

import {
  useVideoWatchProgressReporter,
  type UseVideoWatchProgressReporterResult,
} from './use-video-watch-progress-reporter';
import type { WatchProgressTelemetryPayload } from './watch-progress-telemetry';

let latestReporter: UseVideoWatchProgressReporterResult | null = null;

function ReporterHarness({
  createSessionId = () => 'session-1',
  flushTelemetryQueue,
  nowMs,
  nowIso,
  queue,
}: {
  createSessionId?: () => string;
  flushTelemetryQueue: () => Promise<unknown>;
  nowMs: () => number;
  nowIso: () => string;
  queue: TelemetryQueue<WatchProgressTelemetryPayload>;
}) {
  latestReporter = useVideoWatchProgressReporter({
    createSessionId,
    flushTelemetryQueue,
    nowIso,
    nowMs,
    queue,
  });

  return React.createElement('ReporterHarness');
}

describe('useVideoWatchProgressReporter', () => {
  beforeEach(() => {
    latestReporter = null;
  });

  it('upserts a valid active progress sample', () => {
    const queue = createInMemoryTelemetryQueue<WatchProgressTelemetryPayload>();

    act(() => {
      TestRenderer.create(
        <ReporterHarness
          flushTelemetryQueue={vi.fn()}
          nowIso={() => '2026-05-08T12:00:00.000Z'}
          nowMs={() => 1_000}
          queue={queue}
        />
      );
    });

    act(() => {
      latestReporter?.reportSample({
        activeVisitToken: 1,
        currentTimeSeconds: 12.34,
        durationSeconds: 100,
        videoId: 'video-a',
      });
    });

    expect(queue.getSnapshot().items).toHaveLength(1);
    expect(queue.getSnapshot().items[0]).toMatchObject({
      dedupeKey: 'video.watch_progress:video-a:session-1',
      payload: {
        videoId: 'video-a',
        body: {
          duration_ms: 100_000,
          is_completed: false,
          metadata: { surface: 'fullscreen' },
          occurred_at: '2026-05-08T12:00:00.000Z',
          position_ms: 12_340,
          source: expect.any(String),
          watch_session_id: 'session-1',
        },
      },
    });
  });

  it('throttles non-completed samples within one second', () => {
    const queue = createInMemoryTelemetryQueue<WatchProgressTelemetryPayload>();
    let currentNowMs = 1_000;

    act(() => {
      TestRenderer.create(
        <ReporterHarness
          flushTelemetryQueue={vi.fn()}
          nowIso={() => new Date(currentNowMs).toISOString()}
          nowMs={() => currentNowMs}
          queue={queue}
        />
      );
    });

    act(() => {
      latestReporter?.reportSample({
        activeVisitToken: 1,
        currentTimeSeconds: 10,
        durationSeconds: 100,
        videoId: 'video-a',
      });
    });
    currentNowMs = 1_500;
    act(() => {
      latestReporter?.reportSample({
        activeVisitToken: 1,
        currentTimeSeconds: 20,
        durationSeconds: 100,
        videoId: 'video-a',
      });
    });

    expect(queue.getSnapshot().items[0].payload.body.position_ms).toBe(10_000);
  });

  it('ignores invalid duration and time samples', () => {
    const queue = createInMemoryTelemetryQueue<WatchProgressTelemetryPayload>();

    act(() => {
      TestRenderer.create(
        <ReporterHarness
          flushTelemetryQueue={vi.fn()}
          nowIso={() => '2026-05-08T12:00:00.000Z'}
          nowMs={() => 1_000}
          queue={queue}
        />
      );
    });

    act(() => {
      latestReporter?.reportSample({
        activeVisitToken: 1,
        currentTimeSeconds: 10,
        durationSeconds: 0,
        videoId: 'video-a',
      });
      latestReporter?.reportSample({
        activeVisitToken: 1,
        currentTimeSeconds: Number.NaN,
        durationSeconds: 100,
        videoId: 'video-a',
      });
    });

    expect(queue.getSnapshot().items).toEqual([]);
  });

  it('immediately upserts and flushes completed samples', async () => {
    const queue = createInMemoryTelemetryQueue<WatchProgressTelemetryPayload>();
    const flushTelemetryQueue = vi.fn().mockResolvedValue(undefined);

    act(() => {
      TestRenderer.create(
        <ReporterHarness
          flushTelemetryQueue={flushTelemetryQueue}
          nowIso={() => '2026-05-08T12:00:00.000Z'}
          nowMs={() => 1_000}
          queue={queue}
        />
      );
    });

    await act(async () => {
      latestReporter?.reportSample({
        activeVisitToken: 1,
        currentTimeSeconds: 91,
        durationSeconds: 100,
        videoId: 'video-a',
      });
    });

    expect(queue.getSnapshot().items[0].payload.body.is_completed).toBe(true);
    expect(flushTelemetryQueue).toHaveBeenCalledTimes(1);
  });

  it('creates a new watch session when the active visit changes', () => {
    const queue = createInMemoryTelemetryQueue<WatchProgressTelemetryPayload>();
    const createSessionId = vi
      .fn()
      .mockReturnValueOnce('session-1')
      .mockReturnValueOnce('session-2');
    let currentNowMs = 1_000;

    act(() => {
      TestRenderer.create(
        <ReporterHarness
          createSessionId={createSessionId}
          flushTelemetryQueue={vi.fn()}
          nowIso={() => new Date(currentNowMs).toISOString()}
          nowMs={() => currentNowMs}
          queue={queue}
        />
      );
    });

    act(() => {
      latestReporter?.reportSample({
        activeVisitToken: 1,
        currentTimeSeconds: 10,
        durationSeconds: 100,
        videoId: 'video-a',
      });
    });
    currentNowMs = 2_100;
    act(() => {
      latestReporter?.reportSample({
        activeVisitToken: 2,
        currentTimeSeconds: 11,
        durationSeconds: 100,
        videoId: 'video-a',
      });
    });

    expect(queue.getSnapshot().items.map((item) => item.payload.body.watch_session_id)).toEqual([
      'session-1',
      'session-2',
    ]);
  });
});
