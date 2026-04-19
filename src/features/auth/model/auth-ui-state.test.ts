import { describe, expect, it } from 'vitest';

import {
  createInitialAuthUiState,
  reduceAuthUiState,
} from './auth-ui-state';

describe('auth ui state', () => {
  it('starts on password login', () => {
    expect(createInitialAuthUiState()).toEqual({
      screen: 'login',
      loginMode: 'password',
    });
  });

  it('switches between password and code within the login screen', () => {
    const initialState = createInitialAuthUiState();

    expect(
      reduceAuthUiState(initialState, {
        type: 'set-login-mode',
        mode: 'code',
      })
    ).toEqual({
      screen: 'login',
      loginMode: 'code',
    });
  });

  it('keeps the chosen login mode when returning from forgot password', () => {
    const state = reduceAuthUiState(
      reduceAuthUiState(createInitialAuthUiState(), {
        type: 'set-login-mode',
        mode: 'code',
      }),
      { type: 'show-forgot-password' }
    );

    expect(reduceAuthUiState(state, { type: 'show-login' })).toEqual({
      screen: 'login',
      loginMode: 'code',
    });
  });

  it('shows register and then returns to login without resetting the mode', () => {
    const state = reduceAuthUiState(
      reduceAuthUiState(createInitialAuthUiState(), {
        type: 'set-login-mode',
        mode: 'code',
      }),
      { type: 'show-register' }
    );

    expect(reduceAuthUiState(state, { type: 'show-login' })).toEqual({
      screen: 'login',
      loginMode: 'code',
    });
  });
});
