const CJK_TITLE_PATTERN =
  /[\u3400-\u4dbf\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\uf900-\ufaff]/;

export function shouldUseEditorialDisplayFont(title: string) {
  return !CJK_TITLE_PATTERN.test(title);
}

export function resolveStructuredAuthTitleFontFamily(
  title: string,
  editorialDisplayFontFamily: string,
  editorialCjkTitleFontFamily: string
) {
  return shouldUseEditorialDisplayFont(title)
    ? editorialDisplayFontFamily
    : editorialCjkTitleFontFamily;
}
