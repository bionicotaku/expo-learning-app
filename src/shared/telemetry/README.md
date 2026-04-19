# Shared Telemetry

这里是 `telemetry` 通道的固定落点。

当前只包含：

- `model/types.ts`
  - `TelemetryEvent`
  - `TelemetryBatch`
  - `TelemetryFlushResult`
  - `TelemetryQueueAdapter`

本轮明确不实现：

- 队列
- flush
- 持久化
- 生命周期接入
- 页面调用

这样做的目的是先把第三类请求的边界固定住，避免后续把埋点误塞回普通 query / mutation。
