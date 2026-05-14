import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createInMemoryTelemetryQueue, type TelemetryQueue } from '@/shared/telemetry';

import {
  useVideoWatchProgressReporter,
  type UseVideoWatchProgressReporterResult,
} from './use-video-watch-progress-reporter';
import type { WatchProgressTelemetryPayload } from './watch-progress-telemetry';

vi.mock('@/shared/lib/client-environment', () => ({
  getClientEnvironment: vi.fn(() => ({})),
  toAnalyticsClientContext: vi.fn(() => ({
    app_version: null,
    device_model: null,
    os_version: null,
    platform: 'unknown',
  })),
}));

let latestReporter: UseVideoWatchProgressReporterResult | null = null;

function ReporterHarness({
  flushTelemetryQueue,
  getClientContext = () => ({
    app_version: '1.2.3',
    device_model: 'iPhone16,2',
    os_version: '18.5',
    platform: 'ios',
  }),
  nowMs,
  nowIso,
  queue,
}: {
  flushTelemetryQueue: () => Promise<unknown>;
  getClientContext?: () => WatchProgressTelemetryPayload['body']['client_context'];
  nowMs: () => number;
  nowIso: () => string;
  queue: TelemetryQueue<WatchProgressTelemetryPayload>;
}) {
  latestReporter = useVideoWatchProgressReporter({
    flushTelemetryQueue,
    getClientContext,
    nowIso,
    nowMs,
    queue,
  });

  return React.createElement('ReporterHarness');
}

function DefaultIdentityHarness({
  marker,
  queue,
}: {
  marker: number;
  queue: TelemetryQueue<WatchProgressTelemetryPayload>;
}) {
  latestReporter = useVideoWatchProgressReporter({
    queue,
  });

  return React.createElement('DefaultIdentityHarness', { marker });
}

function InjectedIdentityHarness({
  nowMs,
  queue,
}: {
  nowMs: () => number;
  queue: TelemetryQueue<WatchProgressTelemetryPayload>;
}) {
  latestReporter = useVideoWatchProgressReporter({
    flushTelemetryQueue: vi.fn(),
    getClientContext: () => ({
      app_version: '1.2.3',
      device_model: 'iPhone16,2',
      os_version: '18.5',
      platform: 'ios',
    }),
    nowIso: () => '2026-05-08T12:00:00.000Z',
    nowMs,
    queue,
  });

  return React.createElement('InjectedIdentityHarness');
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
        currentTimeSeconds: 12.34,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: 'session-1',
      });
    });

    expect(queue.getSnapshot().items).toHaveLength(1);
    expect(queue.getSnapshot().items[0]).toMatchObject({
      dedupeKey: 'video.watch_progress:video-a:session-1',
      payload: {
        videoId: 'video-a',
        body: {
          client_context: {
            app_version: '1.2.3',
            device_model: 'iPhone16,2',
            os_version: '18.5',
            platform: 'ios',
          },
          duration_ms: 100_000,
          is_completed: false,
          occurred_at: '2026-05-08T12:00:00.000Z',
          position_ms: 12_340,
          source_surface: 'fullscreen',
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
        currentTimeSeconds: 10,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: 'session-1',
      });
    });
    currentNowMs = 1_500;
    act(() => {
      latestReporter?.reportSample({
        currentTimeSeconds: 20,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: 'session-1',
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
        currentTimeSeconds: 10,
        durationSeconds: 0,
        videoId: 'video-a',
        watchSessionId: 'session-1',
      });
      latestReporter?.reportSample({
        currentTimeSeconds: Number.NaN,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: 'session-1',
      });
      latestReporter?.reportSample({
        currentTimeSeconds: 10,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: null,
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
        currentTimeSeconds: 91,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: 'session-1',
      });
    });

    expect(queue.getSnapshot().items[0].payload.body.is_completed).toBe(true);
    expect(flushTelemetryQueue).toHaveBeenCalledTimes(1);
  });

  it('flushes only the first completed transition for a watch session', async () => {
    const queue = createInMemoryTelemetryQueue<WatchProgressTelemetryPayload>();
    const flushTelemetryQueue = vi.fn().mockResolvedValue(undefined);
    let currentNowMs = 1_000;

    act(() => {
      TestRenderer.create(
        <ReporterHarness
          flushTelemetryQueue={flushTelemetryQueue}
          nowIso={() => new Date(currentNowMs).toISOString()}
          nowMs={() => currentNowMs}
          queue={queue}
        />
      );
    });

    await act(async () => {
      latestReporter?.reportSample({
        currentTimeSeconds: 91,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: 'session-1',
      });
    });
    currentNowMs = 1_500;
    await act(async () => {
      latestReporter?.reportSample({
        currentTimeSeconds: 92,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: 'session-1',
      });
    });
    currentNowMs = 2_100;
    await act(async () => {
      latestReporter?.reportSample({
        currentTimeSeconds: 93,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: 'session-1',
      });
    });

    expect(flushTelemetryQueue).toHaveBeenCalledTimes(1);
    expect(queue.getSnapshot().items[0].payload.body).toMatchObject({
      is_completed: true,
      position_ms: 93_000,
    });
  });

  it('keeps separate pending states for distinct watch sessions', () => {
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
        currentTimeSeconds: 10,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: 'session-1',
      });
    });
    currentNowMs = 2_100;
    act(() => {
      latestReporter?.reportSample({
        currentTimeSeconds: 11,
        durationSeconds: 100,
        videoId: 'video-a',
        watchSessionId: 'session-2',
      });
    });

    expect(queue.getSnapshot().items.map((item) => item.payload.body.watch_session_id)).toEqual([
      'session-1',
      'session-2',
    ]);
  });

  it('keeps default flush and reportSample references stable across rerenders', () => {
    const queue = createInMemoryTelemetryQueue<WatchProgressTelemetryPayload>();
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    act(() => {
      renderer = TestRenderer.create(
        <DefaultIdentityHarness
          marker={1}
          queue={queue}
        />
      );
    });
    const firstFlush = latestReporter?.flush;
    const firstReportSample = latestReporter?.reportSample;

    act(() => {
      renderer?.update(
        <DefaultIdentityHarness
          marker={2}
          queue={queue}
        />
      );
    });

    expect(latestReporter?.flush).toBe(firstFlush);
    expect(latestReporter?.reportSample).toBe(firstReportSample);
  });

  it('updates reportSample when an injected clock dependency changes', () => {
    const queue = createInMemoryTelemetryQueue<WatchProgressTelemetryPayload>();
    const firstNowMs = () => 1_000;
    const secondNowMs = () => 2_000;
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    act(() => {
      renderer = TestRenderer.create(
        <InjectedIdentityHarness
          nowMs={firstNowMs}
          queue={queue}
        />
      );
    });
    const firstReportSample = latestReporter?.reportSample;

    act(() => {
      renderer?.update(
        <InjectedIdentityHarness
          nowMs={secondNowMs}
          queue={queue}
        />
      );
    });

    expect(latestReporter?.reportSample).not.toBe(firstReportSample);
  });
});
