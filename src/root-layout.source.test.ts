import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('root layout source', () => {
  it('keeps the fullscreen video route singular at the stack level', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/app/_layout.tsx'), 'utf8');

    expect(source).toContain("const FULLSCREEN_VIDEO_ROUTE_SINGULAR_ID = 'fullscreen-video';");
    expect(source).toContain('name="video/[videoId]"');
    expect(source).toContain('dangerouslySingular={() => FULLSCREEN_VIDEO_ROUTE_SINGULAR_ID}');
  });
});
