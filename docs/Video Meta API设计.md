# Video Meta API 设计

## 1. 文档目标

本文档定义当前视频 meta 读取接口。Video meta 是按 `videoId` 读取的当前用户态和资源入口，不属于 feed 列表契约。

## 2. 请求契约

```http
GET /videos/:videoId/meta
```

当前只接受 path 上的 `videoId`，不接受分页或筛选参数。

## 3. 响应契约

```ts
type VideoMeta = {
  videoId: string;
  isLiked: boolean;
  isFavorited: boolean;
  transcriptUrl: string | null;
};
```

字段语义：

- `isLiked / isFavorited`：当前用户对该视频的状态读取快照。
- `transcriptUrl`：transcript asset JSON URL；`null` 表示没有 transcript。

## 4. Mock 规则

当前 mock video meta：

- 使用共享 mock clip catalog 解析 `videoId -> transcriptUrl`
- `video-1` 和 `video-9` 这类循环视频可以命中同一个 transcript asset URL
- `isLiked / isFavorited` 按 `videoId` 稳定伪随机生成
- 非法 `videoId` 抛 `VIDEO_META_NOT_FOUND`，不 fallback 到 `clip1`

## 5. 与其他层的关系

- feed 不返回 `isLiked / isFavorited / transcriptUrl`
- fullscreen resources 读取 active `±1` 的 video meta
- video runtime 以 video meta 的 flags 为 base，保存本地 override
