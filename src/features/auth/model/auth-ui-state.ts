export type AuthScreenState = 'login' | 'forgotPassword' | 'register';

export type AuthLoginMode = 'password' | 'code';

export type AuthUiState = {
  screen: AuthScreenState;
  loginMode: AuthLoginMode;
};

export type AuthUiAction =
  | {
      type: 'set-login-mode';
      mode: AuthLoginMode;
    }
  | {
      type: 'show-forgot-password';
    }
  | {
      type: 'show-register';
    }
  | {
      type: 'show-login';
    };

export function createInitialAuthUiState(): AuthUiState {
  return {
    screen: 'login',
    loginMode: 'password',
  };
}

export function reduceAuthUiState(
  state: AuthUiState,
  action: AuthUiAction
): AuthUiState {
  switch (action.type) {
    case 'set-login-mode':
      return {
        ...state,
        loginMode: action.mode,
      };
    case 'show-forgot-password':
      return {
        ...state,
        screen: 'forgotPassword',
      };
    case 'show-register':
      return {
        ...state,
        screen: 'register',
      };
    case 'show-login':
      return {
        ...state,
        screen: 'login',
      };
  }
}
