import { describe, expect, it } from 'vitest';

import { createTailRequestGate } from './tail-request-gate';

describe('tail request gate', () => {
  it('blocks duplicate starts while the same tail is in flight', () => {
    const gate = createTailRequestGate();

    expect(gate.canStart('video-8')).toBe(true);
    gate.markStarted('video-8');

    expect(gate.canStart('video-8')).toBe(false);
  });

  it('allows the same tail to start again after a failed request settles', () => {
    const gate = createTailRequestGate();

    gate.markStarted('video-8');
    gate.markSettled('video-8');

    expect(gate.canStart('video-8')).toBe(true);
  });

  it('blocks the same tail after a successful request has been fulfilled', () => {
    const gate = createTailRequestGate();

    gate.markStarted('video-8');
    gate.markSucceeded('video-8');
    gate.markSettled('video-8');

    expect(gate.canStart('video-8')).toBe(false);
  });

  it('allows a new tail after a previous tail has been fulfilled', () => {
    const gate = createTailRequestGate();

    gate.markStarted('video-8');
    gate.markSucceeded('video-8');
    gate.markSettled('video-8');

    expect(gate.canStart('video-16')).toBe(true);
  });
});
