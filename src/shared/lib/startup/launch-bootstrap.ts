export const LAUNCH_SCREEN_MINIMUM_VISIBLE_MS = 650;
export const LAUNCH_SCREEN_FADE_DURATION_MS = 220;

export type LaunchBootstrapState = {
  nativeVisible: boolean;
  jsLaunchVisible: boolean;
  appVisible: boolean;
  nativeHideRequested: boolean;
  minimumDurationComplete: boolean;
  exitAnimationComplete: boolean;
};

export type LaunchBootstrapAction =
  | { type: 'js-launch-painted' }
  | { type: 'native-splash-hidden' }
  | { type: 'minimum-duration-complete' }
  | { type: 'exit-animation-complete' };

export function createInitialLaunchBootstrapState(): LaunchBootstrapState {
  return {
    nativeVisible: true,
    jsLaunchVisible: true,
    appVisible: false,
    nativeHideRequested: false,
    minimumDurationComplete: false,
    exitAnimationComplete: false,
  };
}

export function reduceLaunchBootstrapState(
  state: LaunchBootstrapState,
  action: LaunchBootstrapAction
): LaunchBootstrapState {
  switch (action.type) {
    case 'js-launch-painted':
      if (state.nativeHideRequested) {
        return state;
      }

      return {
        ...state,
        nativeHideRequested: true,
      };
    case 'native-splash-hidden':
      if (!state.nativeVisible) {
        return state;
      }

      return {
        ...state,
        nativeVisible: false,
      };
    case 'minimum-duration-complete':
      if (state.minimumDurationComplete) {
        return state;
      }

      return {
        ...state,
        appVisible: true,
        minimumDurationComplete: true,
      };
    case 'exit-animation-complete':
      if (state.exitAnimationComplete) {
        return state;
      }

      return {
        ...state,
        jsLaunchVisible: false,
        exitAnimationComplete: true,
      };
    default:
      return state;
  }
}
