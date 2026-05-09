import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchMockLearnedUnitProgressPage,
  fetchMockUnlearnedUnitProgressPage,
  resetMockLearnedUnitProgress,
  resetMockUnlearnedUnitProgress,
} from './mock-unit-progress-repository';

describe('mock unit progress repository', () => {
  beforeEach(() => {
    resetMockLearnedUnitProgress();
    resetMockUnlearnedUnitProgress();
    vi.useRealTimers();
  });

  it('returns the first unlearned page without a cursor', async () => {
    const response = await fetchMockUnlearnedUnitProgressPage({ limit: 4 });

    expect(response.items).toHaveLength(4);
    expect(response.items[0]).toMatchObject({
      coarseUnitId: 1,
      label: expect.any(String),
      progressPercent: expect.any(Number),
    });
    expect(response.page).toEqual({
      limit: 4,
      hasMore: true,
      nextCursor: 'mock-unlearned-page:1',
    });
  });

  it('returns a unique next page from an opaque mock cursor', async () => {
    const first = await fetchMockUnlearnedUnitProgressPage({ limit: 4 });
    const second = await fetchMockUnlearnedUnitProgressPage({
      limit: 4,
      cursor: first.page.nextCursor ?? undefined,
    });

    expect(second.page.nextCursor).toBe('mock-unlearned-page:2');
    expect(new Set([...first.items, ...second.items].map((item) => item.coarseUnitId)).size).toBe(
      8
    );
    expect(first.items[0]?.coarseUnitId).not.toBe(second.items[0]?.coarseUnitId);
  });

  it('keeps infinite scroll open by always returning a next cursor', async () => {
    const response = await fetchMockUnlearnedUnitProgressPage({
      limit: 2,
      cursor: 'mock-unlearned-page:99',
    });

    expect(response.items).toHaveLength(2);
    expect(response.page.hasMore).toBe(true);
    expect(response.page.nextCursor).toBe('mock-unlearned-page:100');
  });

  it('resolves after the configured mock network delay', async () => {
    vi.useFakeTimers();

    let resolved = false;
    const request = fetchMockUnlearnedUnitProgressPage({
      delayMs: 3000,
      limit: 2,
    }).then((response) => {
      resolved = true;
      return response;
    });

    await vi.advanceTimersByTimeAsync(2999);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(request).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({
          coarseUnitId: 1,
        }),
      ]),
    });

    vi.useRealTimers();
  });

  it('uses a 1.5 second mock network delay by default', async () => {
    vi.useFakeTimers();

    let resolved = false;
    const request = fetchMockUnlearnedUnitProgressPage({
      limit: 2,
    }).then((response) => {
      resolved = true;
      return response;
    });

    await vi.advanceTimersByTimeAsync(1499);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(request).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({
          coarseUnitId: 1,
        }),
      ]),
    });

    vi.useRealTimers();
  });

  it('returns learned pages from an independent opaque cursor stream', async () => {
    const first = await fetchMockLearnedUnitProgressPage({ limit: 3 });
    const second = await fetchMockLearnedUnitProgressPage({
      limit: 3,
      cursor: first.page.nextCursor ?? undefined,
    });

    expect(first.items).toHaveLength(3);
    expect(first.items[0]).toMatchObject({
      coarseUnitId: 10001,
      label: expect.any(String),
      progressPercent: 100,
    });
    expect(first.page).toEqual({
      limit: 3,
      hasMore: true,
      nextCursor: 'mock-learned-page:1',
    });
    expect(second.page.nextCursor).toBe('mock-learned-page:2');
    expect(new Set([...first.items, ...second.items].map((item) => item.coarseUnitId)).size).toBe(
      6
    );
  });
});
