# Fullscreen Video Resources 设计规范

## 1. 文档目标

本文档定义 fullscreen 场景下 video meta 与 transcript asset 的读取、缓存和 active 派生结构。文件名保留旧名称以维持文档链接，但当前内容已经替代旧的单一 transcript 读取设计。

相关文档：

- [Video Meta API设计](./Video%20Meta%20API%E8%AE%BE%E8%AE%A1.md)
- [Transcript Asset API设计](./Transcript%20API%E8%AE%BE%E8%AE%A1.md)
- [Video 真值与 Runtime 设计规范](./Video%20真值与%20Runtime%20设计规范.md)

## 2. 核心结论

fullscreen 资源读取固定为：

- `features/fullscreen-video-resources` 是 owner
- 读取窗口是 `activeIndex - 1 / activeIndex / activeIndex + 1`
- 先按 `videoId` 读 `VideoMeta`
- 再按 `VideoMeta.transcriptUrl` 读 transcript asset
- video meta query key: `['video-meta', videoId]`
- transcript asset query key: `['transcript-asset', transcriptUrl]`
- 不使用 `placeholderData` 或 `keepPreviousData`
- active 切换时不能展示上一条视频的 meta 或 transcript
- video meta query 失败时触发全局 error toast：`视频数据获取失败`
- transcript asset query 失败时触发全局 error toast：`字幕获取失败`
- 每次 query attempt 失败弹一次 toast；同一次 error 的稳定重渲染不重复弹
- `refetchOnMount` 只对 cached error query 返回 true；退出 fullscreen 后再次进入会重试失败资源
- cached success query 继续复用，不因 remount 重新请求

## 3. Hook 接口

```ts
useFullscreenVideoResources({
  activeVideoId,
  activeIndex,
  items,
}): {
  activeVideoMeta: VideoMeta | null;
  activeVideoMetaStatus: 'idle' | 'loading' | 'success' | 'error';
  activeTranscript: Transcript | null;
  activeTranscriptStatus: 'idle' | 'loading' | 'success' | 'error';
  videoMetaByVideoId: ReadonlyMap<string, VideoMeta>;
}
```

状态语义：

- active target 不存在：meta 和 transcript 都是 `idle / null`
- active meta loading：transcript 也处于 loading 等待资源入口
- active meta error：transcript 不请求，返回 `idle / null`
- active meta success 且 `transcriptUrl === null`：transcript 为 `idle / null`
- transcript asset error：只影响字幕，不影响视频播放和 action rail
- meta / transcript asset 的每次实际请求失败都会通过全局红色 toast 给出中文反馈

## 4. UI 边界

- `FullscreenVideoSession` 消费 `useFullscreenVideoResources`
- `FullscreenVideoPager` 只把 active transcript 传给 active row，并把 `videoMetaByVideoId` 传给 row
- `FullscreenVideoRow` 以 `VideoMeta` 的 flags 作为 `video-runtime` base
- meta 未加载或失败时，like/favorite 按钮禁用；字幕不显示
- subtitle display mode 只控制 UI 展示，不控制资源读取

## 5. 非目标

- 不做真实 like/favorite 写 API
- 不展示 `likeCount / favoriteCount`
- 不做 transcript 本地持久化缓存
- 不让 row 或 pager 直接发业务请求
