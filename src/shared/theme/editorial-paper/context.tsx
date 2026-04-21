import React from 'react';

import type {
  EditorialPaperThemeContextValue,
  EditorialPaperTokens,
} from './types';
import { editorialPaperLightTokens } from './tokens';

const defaultThemeContextValue: EditorialPaperThemeContextValue = {
  themeKey: 'light',
  tokens: editorialPaperLightTokens,
};

export function createEditorialPaperThemeContextValue(
  tokens: EditorialPaperTokens = editorialPaperLightTokens
): EditorialPaperThemeContextValue {
  return {
    themeKey: 'light',
    tokens,
  };
}

export const EditorialPaperThemeContext =
  React.createContext<EditorialPaperThemeContextValue>(defaultThemeContextValue);

type EditorialPaperThemeProviderProps = {
  children: React.ReactNode;
};

export function EditorialPaperThemeProvider({
  children,
}: EditorialPaperThemeProviderProps) {
  const value = React.useMemo(() => createEditorialPaperThemeContextValue(), []);

  return (
    <EditorialPaperThemeContext.Provider value={value}>
      {children}
    </EditorialPaperThemeContext.Provider>
  );
}

export function useEditorialPaperTheme() {
  return React.use(EditorialPaperThemeContext);
}
