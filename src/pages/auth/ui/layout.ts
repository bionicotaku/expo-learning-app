export function resolveAuthPageShellLayout(height: number) {
  const isCompact = height < 900;

  if (isCompact) {
    return {
      displayFontSize: 44,
      displayLineHeight: 43,
      displayLetterSpacing: -1.4,
      subtitleMarginTop: 12,
      cardMarginTop: 24,
      footerPaddingTop: 12,
    } as const;
  }

  return {
    displayFontSize: 48,
    displayLineHeight: 47,
    displayLetterSpacing: -1.6,
    subtitleMarginTop: 16,
    cardMarginTop: 30,
    footerPaddingTop: 16,
  } as const;
}
