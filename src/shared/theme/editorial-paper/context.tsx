import React from 'react';

import type {
  EditorialPaperThemeContextValue,
  EditorialPaperTokens,
} from './types';
import { editorialPaperLightTokens } from './tokens';

const defaultThemeContextValue: EditorialPaperThemeContextValue = {
  themeKey: 'light',
  tokens: editorialPaperLightTokens,
  fontsLoaded: false,
};

export function createEditorialPaperThemeContextValue(
  fontsLoaded: boolean,
  tokens: EditorialPaperTokens = editorialPaperLightTokens
): EditorialPaperThemeContextValue {
  return {
    themeKey: 'light',
    tokens,
    fontsLoaded,
  };
}

export const EditorialPaperThemeContext =
  React.createContext<EditorialPaperThemeContextValue>(defaultThemeContextValue);

type EditorialPaperThemeProviderProps = {
  children: React.ReactNode;
  fontsLoaded: boolean;
};

export function EditorialPaperThemeProvider({
  children,
  fontsLoaded,
}: EditorialPaperThemeProviderProps) {
  const value = React.useMemo(
    () => createEditorialPaperThemeContextValue(fontsLoaded),
    [fontsLoaded]
  );

  return (
    <EditorialPaperThemeContext.Provider value={value}>
      {children}
    </EditorialPaperThemeContext.Provider>
  );
}

export function useEditorialPaperTheme() {
  return React.use(EditorialPaperThemeContext);
}
