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
    vi.useRealTimers();
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
          end: 55915,
          start: 55160,
          text: 'Pam!',
          tokens: [
            {
              end: 55615,
              semanticElement: {
                baseForm: 'Pam',
                coarseId: null,
              },
              start: 55260,
            },
          ],
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      transcriptUrl,
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('passes an external abort signal to the transcript asset fetch', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(transcriptResponse), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchTranscriptAsset(transcriptUrl, {
      signal: controller.signal,
    });

    const [, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit];
    expect(init.signal).toBeInstanceOf(AbortSignal);
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
      code: 'INVALID_JSON_RESPONSE',
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
    });
  });

  it('surfaces transcript asset timeout errors before mapping', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = fetchTranscriptAsset(transcriptUrl, {
      timeoutMs: 100,
    });
    const expectation = expect(request).rejects.toMatchObject({
      code: 'TIMEOUT',
      name: 'ApiError',
      retryable: true,
    });

    await vi.advanceTimersByTimeAsync(100);

    await expectation;
    vi.useRealTimers();
  });
});
