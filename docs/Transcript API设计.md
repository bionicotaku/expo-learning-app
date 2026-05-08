# Transcript Asset API 设计

## 1. 文档目标

本文档定义 transcript asset JSON 的读取契约。当前项目已经删除按 `videoId` 的 transcript API；transcript 内容必须通过 `VideoMeta.transcriptUrl` 读取。

相关文档：

- [Video Meta API设计](./Video%20Meta%20API%E8%AE%BE%E8%AE%A1.md)
- [Fullscreen Video Resources设计规范](./Fullscreen%20Transcript%20Source%E8%AE%BE%E8%AE%A1%E8%A7%84%E8%8C%83.md)

## 2. 核心结论

当前结构固定为：

- 不再使用 `GET /videos/:videoId/transcript`
- transcript resource identity 是 `transcriptUrl`
- `entities/transcript` 只暴露 `fetchTranscriptAsset(transcriptUrl)`
- query key 使用 `['transcript-asset', transcriptUrl]`
- transcript JSON transport 仍保持 `snake_case`
- repository 边界映射成前端内部 `camelCase`
- repository 在返回前执行 sentence timing normalization，React Query 缓存的是 prepared transcript
- asset 请求支持 timeout 和外部 abort signal

## 3. Asset 响应契约

```ts
type TranscriptResponseDto = {
  sentences: TranscriptSentenceDto[];
};

type TranscriptSentenceDto = {
  index: number;
  text: string;
  explanation: string;
  tokens: TranscriptTokenDto[];
  start: number;
  end: number;
};

type TranscriptTokenDto = {
  index: number;
  text: string;
  explanation: string;
  semantic_element: TranscriptSemanticElementDto;
  start: number;
  end: number;
};

type TranscriptSemanticElementDto = {
  base_form: string;
  dictionary: string;
  coarse_id: number | null;
  reason: string;
};
```

前端 domain model 继续使用 `semanticElement.baseForm / coarseId` 等 `camelCase` 字段。

## 4. 读取流程

```txt
videoId
-> fetchVideoMeta(videoId)
-> transcriptUrl
-> fetchTranscriptAsset(transcriptUrl)
-> TranscriptResponseDto
-> mapTranscriptDtoToDomain(...)
-> prepareTranscriptForPlayback(...)
-> Transcript
```

`transcriptUrl === null` 表示该视频没有 transcript，不是错误。

`fetchTranscriptAsset(transcriptUrl, { signal, timeoutMs })` 使用完整 URL 读取 JSON asset，不拼接业务 API base URL，也不附带 auth。默认 timeout 为 `10s`。

读取成功后，`entities/transcript` 会在缓存前调整句子显示时间：每句 `start` 最多提前 `100ms`，每句 `end` 最多延后 `300ms`，相邻句子按 `1ms` 边界避免重叠。这个后处理只改 `TranscriptSentence.start/end`，不改 token 时间；token 高亮仍使用 asset 原始词级时间。

错误语义：

- timeout：`TIMEOUT`，`retryable: true`
- 外部 abort：`REQUEST_ABORTED`，`retryable: false`
- network failure：`NETWORK_ERROR`，`retryable: true`
- HTTP 4xx：`TRANSCRIPT_ASSET_FETCH_FAILED`，`retryable: false`
- HTTP 5xx：`TRANSCRIPT_ASSET_FETCH_FAILED`，`retryable: true`
- invalid JSON：`INVALID_JSON_RESPONSE`，`retryable: false`
- 缺少 `sentences`：`TRANSCRIPT_ASSET_FETCH_FAILED`，`retryable: false`

## 5. 边界

- `entities/transcript` 不知道 `videoId`。
- `entities/transcript` 不访问 mock clip catalog。
- `features/fullscreen-video-resources` 负责把 video meta 和 transcript asset 串起来。
- subtitle overlay 只消费已经解析好的 `Transcript | null`。
