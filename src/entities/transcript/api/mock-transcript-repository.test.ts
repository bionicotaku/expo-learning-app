import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchMockTranscript } from './mock-transcript-repository';

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

describe('mock transcript repository', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches the transcript from the mapped clip url and returns camelCase domain data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(transcriptResponse), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchMockTranscript('the-office-health-care-video-9')).resolves.toEqual({
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
              semanticElement: {
                baseForm: 'Pam',
                coarseId: null,
                dictionary: '女性人名；帕姆',
                reason: 'no coarse mapping',
              },
              start: 55260,
              text: 'Pam!',
            },
          ],
        },
      ],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://storage.googleapis.com/videos2077/test-video/transcript/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip1.json'
    );
  });

  it('rejects invalid video ids before issuing a network request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchMockTranscript('the-office-health-care-video')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'TRANSCRIPT_NOT_FOUND',
      retryable: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects invalid transcript payloads without falling back', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchMockTranscript('the-office-health-care-video-1')).rejects.toMatchObject({
      name: 'ApiError',
      status: 200,
      code: 'TRANSCRIPT_FETCH_FAILED',
      retryable: false,
    });
  });
});
