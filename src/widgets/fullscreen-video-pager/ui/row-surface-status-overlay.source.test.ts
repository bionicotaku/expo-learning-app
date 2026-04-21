import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  decodeURIComponent(new URL('./row-surface-status-overlay.tsx', import.meta.url).pathname),
  'utf8'
);

describe('RowSurfaceStatusOverlay source', () => {
  it('renders loading with glass spinner and preserves the row-local retry path for errors', () => {
    expect(source).toContain('AdaptiveGlass');
    expect(source).toContain('ActivityIndicator');
    expect(source).toContain('centerOwner');
    expect(source).toContain("centerOwner !== 'loading'");
    expect(source).toContain('size="small"');
    expect(source).toContain('scale: 1.45');
    expect(source).toContain('Retry');
    expect(source).toContain("surfaceState === 'loading'");
    expect(source).toContain("surfaceState === 'ready'");
  });
});
