import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchTranscriptAsset } from './transcript-asset-repository';

const transcriptUrl = 'https://example.com/transcript/video-1.json';

const transcriptResponse = {
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
};

describe('transcript asset repository', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches transcript JSON from a transcript asset url and returns camelCase domain data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(transcriptResponse), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchTranscriptAsset(transcriptUrl)).resolves.toMatchObject({
      sentences: [
        {
          text: 'Pam!',
          tokens: [
            {
              semanticElement: {
                baseForm: 'Pam',
                coarseId: null,
              },
            },
          ],
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(transcriptUrl);
  });

  it('rejects HTTP failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('missing', { status: 404 })));

    await expect(fetchTranscriptAsset(transcriptUrl)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'TRANSCRIPT_ASSET_FETCH_FAILED',
      retryable: false,
      status: 404,
    });
  });

  it('rejects invalid JSON payloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('{', {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        })
      )
    );

    await expect(fetchTranscriptAsset(transcriptUrl)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'TRANSCRIPT_ASSET_FETCH_FAILED',
      retryable: false,
      status: 200,
    });
  });

  it('rejects payloads missing the sentences array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ items: [] }), {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        })
      )
    );

    await expect(fetchTranscriptAsset(transcriptUrl)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'TRANSCRIPT_ASSET_FETCH_FAILED',
      retryable: false,
      status: 200,
    });
  });
});
