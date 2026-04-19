import { describe, expect, it } from 'vitest';

import {
  LAUNCH_SCREEN_FADE_DURATION_MS,
  LAUNCH_SCREEN_MINIMUM_VISIBLE_MS,
  createInitialLaunchBootstrapState,
  reduceLaunchBootstrapState,
} from './launch-bootstrap';

describe('launch bootstrap state', () => {
  it('starts with native and js launch visible while the app shell is hidden', () => {
    expect(createInitialLaunchBootstrapState()).toEqual({
      nativeVisible: true,
      jsLaunchVisible: true,
      appVisible: false,
      nativeHideRequested: false,
      minimumDurationComplete: false,
      exitAnimationComplete: false,
    });
  });

  it('requests native splash hide after the js launch screen is painted', () => {
    const nextState = reduceLaunchBootstrapState(
      createInitialLaunchBootstrapState(),
      { type: 'js-launch-painted' }
    );

    expect(nextState).toMatchObject({
      nativeVisible: true,
      jsLaunchVisible: true,
      appVisible: false,
      nativeHideRequested: true,
      minimumDurationComplete: false,
    });
  });

  it('reveals the app shell when the minimum visible duration completes', () => {
    const nextState = reduceLaunchBootstrapState(
      createInitialLaunchBootstrapState(),
      { type: 'minimum-duration-complete' }
    );

    expect(nextState).toMatchObject({
      nativeVisible: true,
      jsLaunchVisible: true,
      appVisible: true,
      minimumDurationComplete: true,
      exitAnimationComplete: false,
    });
  });

  it('removes the js launch screen after the exit animation completes', () => {
    const startedExitState = reduceLaunchBootstrapState(
      createInitialLaunchBootstrapState(),
      { type: 'minimum-duration-complete' }
    );

    expect(
      reduceLaunchBootstrapState(startedExitState, { type: 'exit-animation-complete' })
    ).toMatchObject({
      nativeVisible: true,
      jsLaunchVisible: false,
      appVisible: true,
      minimumDurationComplete: true,
      exitAnimationComplete: true,
    });
  });

  it('tracks when the native splash has been hidden', () => {
    const hideRequestedState = reduceLaunchBootstrapState(
      createInitialLaunchBootstrapState(),
      { type: 'js-launch-painted' }
    );

    expect(
      reduceLaunchBootstrapState(hideRequestedState, { type: 'native-splash-hidden' })
    ).toMatchObject({
      nativeVisible: false,
      jsLaunchVisible: true,
      nativeHideRequested: true,
    });
  });

  it('keeps the agreed minimum and fade durations stable', () => {
    expect(LAUNCH_SCREEN_MINIMUM_VISIBLE_MS).toBe(650);
    expect(LAUNCH_SCREEN_FADE_DURATION_MS).toBe(220);
  });
});
