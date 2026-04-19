export type EditorialPaperGlassMode = 'glass' | 'blur' | 'translucent';

type ResolveEditorialPaperGlassSupportOptions = {
  isWeb: boolean;
  platformOs: 'ios' | 'android' | 'web';
  liquidGlassAvailable: boolean;
  blurAvailable: boolean;
};

export function resolveEditorialPaperGlassSupport({
  isWeb,
  platformOs,
  liquidGlassAvailable,
  blurAvailable,
}: ResolveEditorialPaperGlassSupportOptions) {
  if (!isWeb && platformOs === 'ios' && liquidGlassAvailable) {
    return {
      mode: 'glass' as const satisfies EditorialPaperGlassMode,
      interactive: true,
    };
  }

  if (!isWeb && blurAvailable) {
    return {
      mode: 'blur' as const satisfies EditorialPaperGlassMode,
      interactive: false,
    };
  }

  return {
    mode: 'translucent' as const satisfies EditorialPaperGlassMode,
    interactive: false,
  };
}
