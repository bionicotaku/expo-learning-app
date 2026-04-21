import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchTranscript } from '@/entities/transcript';

describe('transcript repository facade', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the public transcript contract stable', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          sentences: [
            {
              end: 55615,
              explanation: '这是一句对 Pam 的呼唤或感叹，可译为“帕姆！”。',
              index: 0,
              start: 55260,
              text: 'Pam!',
              tokens: [
                {
                  end: 55615,
                  explanation: '人名 Pam 的呼唤/感叹：‘帕姆！’',
                  index: 0,
                  semantic_element: {
                    base_form: 'Pam',
                    coarse_id: null,
                    dictionary: '女性人名；帕姆',
                    reason: 'no coarse mapping',
                  },
                  start: 55260,
                  text: 'Pam!',
                },
              ],
            },
          ],
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      )
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchTranscript('the-office-health-care-video-1')).resolves.toMatchObject({
      sentences: expect.arrayContaining([
        expect.objectContaining({
          index: 0,
          text: 'Pam!',
          tokens: expect.arrayContaining([
            expect.objectContaining({
              semanticElement: expect.objectContaining({
                baseForm: 'Pam',
                coarseId: null,
              }),
            }),
          ]),
        }),
      ]),
    });
  });
});
