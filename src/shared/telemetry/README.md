# Shared Telemetry

这里是 `telemetry` 通道的固定落点。

当前包含：

- `model/types.ts`
  - `TelemetryQueueItem`
  - `TelemetryQueue`
  - `TelemetryFlushResult`
- `model/telemetry-queue.ts`
  - `createInMemoryTelemetryQueue(...)`
  - 支持普通入队、按 `dedupeKey` upsert 合并、容量上限、成功删除、失败 backoff
- `model/telemetry-flusher.ts`
  - `flushTelemetryQueue(...)`
  - 默认 `concurrency = 3`
  - 默认每次最多 flush `20` 条
  - 默认最多 `5` 次尝试，retryable 失败按内存 backoff 保留

边界：

- 只做内存队列，不做本地离线存储；App 被杀后未 flush 的 telemetry 可以丢失
- 不使用 React Query
- 不 import 页面、播放器、toast 或具体业务 endpoint
- 不直接实现播放进度上报；后续业务 feature 负责把自己的 payload upsert 到队列，并提供 sender
- telemetry 失败默认不打断用户，flush 只返回统计结果给调用方调试

这样做的目的是固定第三类请求的运行边界，避免后续把埋点误塞回普通 query / mutation。
