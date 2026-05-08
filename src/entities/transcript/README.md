# Transcript Entity

`entities/transcript` 定义 transcript asset JSON 的读取契约，而不是字幕 UI 状态。

当前职责：

- `model/dto.ts`
  - transcript transport DTO
  - 保持远程与 mock 返回原样 `snake_case`
- `model/types.ts`
  - transcript domain types
  - 统一映射为前端内部 `camelCase`
- `model/mappers.ts`
  - DTO -> domain 映射
- `api/transcript-asset-repository.ts`
  - `fetchTranscriptAsset(transcriptUrl, options?)` 公开读取入口
  - 只按 `VideoMeta.transcriptUrl` 读取 asset JSON
  - 不再按 `videoId` 推导 transcript 资源
  - 透传 React Query `signal`，并使用 shared JSON resource timeout

边界约束：

- 这里只描述 transcript 数据和 transcript 读取
- 不放 subtitle overlay 布局
- 不放播放器时间同步状态
- 不放 token 点击、解释弹层或字幕交互状态

当前这里读取的是 URL-addressed transcript asset。`videoId -> transcriptUrl` 属于 `entities/video-meta`。

失败语义：

- timeout / network / HTTP 5xx 是 retryable
- 外部 abort 是 non-retryable，并由 fullscreen resources 过滤为非用户可见失败
- HTTP 4xx、invalid JSON、缺少 `sentences` 是 non-retryable
